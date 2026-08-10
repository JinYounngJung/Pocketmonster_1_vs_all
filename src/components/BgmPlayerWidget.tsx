import React, { useState, useEffect, useRef } from 'react';
import { Music, Play, Pause, Volume2, VolumeX, SkipForward, ChevronDown, Radio, Sparkles } from 'lucide-react';
import { bgmEngine, BGM_TRACKS, BgmTrackId } from '../utils/bgmEngine';
import { sounds } from '../utils/soundEffects';

interface BgmPlayerWidgetProps {
  compact?: boolean;
  className?: string;
  theme?: 'dark' | 'header' | 'battle';
}

export const BgmPlayerWidget: React.FC<BgmPlayerWidgetProps> = ({
  compact = false,
  className = '',
  theme = 'header',
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(bgmEngine.getIsPlaying());
  const [currentTrackId, setCurrentTrackId] = useState<BgmTrackId>(bgmEngine.getCurrentTrack());
  const [volume, setVolume] = useState<number>(bgmEngine.getVolume());
  const [isMuted, setIsMuted] = useState<boolean>(bgmEngine.getIsMuted());
  const [isOpenMenu, setIsOpenMenu] = useState<boolean>(false);
  const [visualizerBars, setVisualizerBars] = useState<number[]>([4, 10, 16, 8, 12, 18, 6, 14]);

  const menuRef = useRef<HTMLDivElement>(null);
  const animFrameRef = useRef<number | null>(null);

  // Sync state with BGM Engine
  useEffect(() => {
    const unsubscribe = bgmEngine.subscribe(() => {
      setIsPlaying(bgmEngine.getIsPlaying());
      setCurrentTrackId(bgmEngine.getCurrentTrack());
      setVolume(bgmEngine.getVolume());
      setIsMuted(bgmEngine.getIsMuted());
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Equalizer visualizer animation loop
  useEffect(() => {
    let active = true;

    const updateVisualizer = () => {
      if (!active) return;
      if (isPlaying && !isMuted) {
        const rawData = bgmEngine.getVisualizerData();
        const bars: number[] = [];
        for (let i = 0; i < 8; i++) {
          const val = rawData[i * 2] || Math.random() * 80 + 30;
          bars.push(Math.max(3, Math.min(24, Math.floor(val / 10))));
        }
        setVisualizerBars(bars);
      } else {
        setVisualizerBars([3, 3, 3, 3, 3, 3, 3, 3]);
      }
      animFrameRef.current = requestAnimationFrame(updateVisualizer);
    };

    animFrameRef.current = requestAnimationFrame(updateVisualizer);

    return () => {
      active = false;
      if (animFrameRef.current !== null) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [isPlaying, isMuted]);

  // Click outside to close track selector dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpenMenu(false);
      }
    };

    if (isOpenMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpenMenu]);

  const currentTrack = BGM_TRACKS.find((t) => t.id === currentTrackId) || BGM_TRACKS[0];

  const handleTogglePlay = () => {
    sounds.playClick();
    bgmEngine.togglePlayPause();
  };

  const handleSelectTrack = (trackId: BgmTrackId) => {
    sounds.playClick();
    bgmEngine.setTrack(trackId);
    if (!isPlaying) {
      bgmEngine.play(trackId);
    }
    setIsOpenMenu(false);
  };

  const handleNextTrack = () => {
    sounds.playClick();
    const curIdx = BGM_TRACKS.findIndex((t) => t.id === currentTrackId);
    const nextTrack = BGM_TRACKS[(curIdx + 1) % BGM_TRACKS.length];
    bgmEngine.setTrack(nextTrack.id);
    if (!isPlaying) {
      bgmEngine.play(nextTrack.id);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVol = parseFloat(e.target.value);
    setVolume(newVol);
    bgmEngine.setVolume(newVol);
  };

  const handleToggleMute = () => {
    sounds.playClick();
    bgmEngine.toggleMute();
  };

  // Header compact theme
  if (theme === 'header') {
    return (
      <div ref={menuRef} className={`relative flex items-center ${className}`}>
        {/* Main Header BGM Pill */}
        <div className="flex items-center gap-1.5 bg-slate-950/90 border-2 border-black p-1 sm:px-2 sm:py-1 shadow-[2px_2px_0px_#000]">
          {/* Animated Dancing Equalizer Bars */}
          <div
            onClick={handleTogglePlay}
            className="flex items-end gap-0.5 h-4 w-5 px-0.5 cursor-pointer py-0.5"
            title={isPlaying ? 'BGM 일시정지' : 'BGM 재생 (4세대 신오 사천왕)'}
          >
            {visualizerBars.slice(0, 4).map((height, idx) => (
              <div
                key={idx}
                className={`w-1 transition-all duration-75 rounded-t-xs ${
                  isPlaying && !isMuted ? 'bg-yellow-400' : 'bg-slate-600'
                }`}
                style={{ height: `${height}px` }}
              />
            ))}
          </div>

          {/* Play/Pause Button */}
          <button
            id="btn-bgm-toggle"
            onClick={handleTogglePlay}
            className="geo-btn p-1 text-white hover:text-yellow-300 cursor-pointer"
            title={isPlaying ? 'BGM 일시정지' : '4세대 BGM 재생하기'}
          >
            {isPlaying ? (
              <Pause className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
            ) : (
              <Play className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
            )}
          </button>

          {/* Current Track Label & Selector Trigger */}
          <button
            id="btn-bgm-menu"
            onClick={() => {
              sounds.playClick();
              setIsOpenMenu(!isOpenMenu);
            }}
            className="hidden sm:flex items-center gap-1 text-left max-w-[130px] md:max-w-[170px] cursor-pointer hover:bg-slate-900 px-1 py-0.5"
            title="BGM 트랙 변경 및 볼륨 조절"
          >
            <span className="text-[11px] font-black text-yellow-300 truncate">
              {currentTrack.name}
            </span>
            <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
          </button>

          {/* Next Track Button */}
          <button
            id="btn-bgm-next"
            onClick={handleNextTrack}
            className="hidden md:flex p-1 text-slate-300 hover:text-yellow-300 cursor-pointer"
            title="다음 BGM 트랙"
          >
            <SkipForward className="w-3 h-3" />
          </button>
        </div>

        {/* Dropdown Menu for Track Selection & Volume */}
        {isOpenMenu && (
          <div className="absolute right-0 top-full mt-2 w-72 bg-slate-950 border-4 border-black p-3 z-50 shadow-[6px_6px_0px_#000] text-white">
            <div className="flex items-center justify-between border-b-2 border-slate-800 pb-2 mb-2">
              <div className="flex items-center gap-1.5">
                <Music className="w-4 h-4 text-yellow-400" />
                <span className="text-xs font-black uppercase text-yellow-400">포켓몬 BGM 센터</span>
              </div>
              <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-900 px-1.5 py-0.5 border border-slate-800">
                {currentTrack.bpm} BPM
              </span>
            </div>

            {/* Volume Control */}
            <div className="bg-slate-900/80 p-2 border-2 border-slate-800 mb-3">
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-300 mb-1.5">
                <div className="flex items-center gap-1">
                  <button onClick={handleToggleMute} className="cursor-pointer hover:text-yellow-400">
                    {isMuted ? <VolumeX className="w-3.5 h-3.5 text-red-500" /> : <Volume2 className="w-3.5 h-3.5 text-green-400" />}
                  </button>
                  <span>BGM 볼륨</span>
                </div>
                <span className="font-mono text-yellow-400">{isMuted ? '0%' : `${Math.round(volume * 100)}%`}</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-full accent-yellow-400 cursor-pointer h-1.5 bg-slate-700 rounded-lg appearance-none"
              />
            </div>

            {/* Track List */}
            <div className="space-y-1.5 mb-2">
              <span className="text-[10px] font-black uppercase text-slate-400 block px-1">트랙 선택 (4세대 신오)</span>
              {BGM_TRACKS.map((track) => {
                const isSelected = track.id === currentTrackId;
                return (
                  <button
                    key={track.id}
                    id={`btn-track-${track.id}`}
                    onClick={() => handleSelectTrack(track.id)}
                    className={`w-full text-left p-2 border-2 transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'bg-yellow-400 text-black border-black font-black shadow-[2px_2px_0px_#000]'
                        : 'bg-slate-900 hover:bg-slate-800 text-slate-200 border-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate pr-1">
                      <span className="text-base">{track.icon}</span>
                      <div className="truncate">
                        <div className="text-xs font-black truncate">{track.name}</div>
                        <div className={`text-[10px] truncate ${isSelected ? 'text-slate-900 font-bold' : 'text-slate-400'}`}>
                          {track.nameEn}
                        </div>
                      </div>
                    </div>
                    {isSelected && isPlaying && (
                      <span className="text-[10px] font-black px-1.5 py-0.5 bg-black text-yellow-300 shrink-0">
                        재생중
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Footer Action */}
            <div className="pt-2 border-t border-slate-800 flex justify-between items-center">
              <button
                onClick={handleTogglePlay}
                className="geo-btn w-full py-1.5 bg-yellow-400 hover:bg-yellow-300 text-black font-black text-xs uppercase flex items-center justify-center gap-1.5 cursor-pointer shadow-[2px_2px_0px_#000]"
              >
                {isPlaying ? (
                  <>
                    <Pause className="w-3.5 h-3.5 fill-black" />
                    <span>배경음악 정지</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-black" />
                    <span>배경음악 재생</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // In-Battle Floating Theme
  return (
    <div
      ref={menuRef}
      className={`relative inline-flex items-center gap-2 bg-slate-950/95 border-2 border-yellow-400 p-2 shadow-[4px_4px_0px_#000] text-white ${className}`}
    >
      {/* Visualizer bars */}
      <div
        onClick={handleTogglePlay}
        className="flex items-end gap-0.5 h-5 w-6 px-0.5 cursor-pointer py-0.5 bg-slate-900 border border-slate-800"
        title={isPlaying ? 'BGM 일시정지' : 'BGM 재생'}
      >
        {visualizerBars.slice(0, 5).map((height, idx) => (
          <div
            key={idx}
            className={`w-1 transition-all duration-75 rounded-t-xs ${
              isPlaying && !isMuted ? 'bg-yellow-400' : 'bg-slate-600'
            }`}
            style={{ height: `${height}px` }}
          />
        ))}
      </div>

      <button
        onClick={handleTogglePlay}
        className="geo-btn p-1.5 bg-yellow-400 hover:bg-yellow-300 text-black cursor-pointer font-black"
        title={isPlaying ? 'BGM 일시정지' : 'BGM 재생'}
      >
        {isPlaying ? <Pause className="w-3.5 h-3.5 fill-black" /> : <Play className="w-3.5 h-3.5 fill-black" />}
      </button>

      <div className="flex flex-col">
        <div className="flex items-center gap-1">
          <span className="text-[10px] font-black uppercase text-yellow-400">BGM:</span>
          <span className="text-xs font-black text-white truncate max-w-[140px] sm:max-w-[180px]">
            {currentTrack.name}
          </span>
        </div>
        <div className="text-[9px] font-mono text-slate-400">
          {isPlaying ? '▶ PLAYING (4th Gen Sinnoh)' : '⏸ PAUSED'}
        </div>
      </div>

      <button
        onClick={() => setIsOpenMenu(!isOpenMenu)}
        className="geo-btn px-2 py-1 bg-slate-800 hover:bg-slate-700 text-yellow-300 text-xs font-black border border-slate-700 cursor-pointer ml-auto"
      >
        트랙 변경
      </button>

      {/* Dropdown Menu */}
      {isOpenMenu && (
        <div className="absolute right-0 bottom-full mb-2 w-72 bg-slate-950 border-4 border-black p-3 z-50 shadow-[6px_6px_0px_#000] text-white">
          <div className="flex items-center justify-between border-b-2 border-slate-800 pb-2 mb-2">
            <span className="text-xs font-black uppercase text-yellow-400">배틀 BGM 선택</span>
            <span className="text-[10px] font-mono text-slate-400">{currentTrack.bpm} BPM</span>
          </div>

          {/* Volume Control */}
          <div className="bg-slate-900/80 p-2 border-2 border-slate-800 mb-3">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-300 mb-1.5">
              <span>BGM 볼륨</span>
              <span className="font-mono text-yellow-400">{isMuted ? '0%' : `${Math.round(volume * 100)}%`}</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              className="w-full accent-yellow-400 cursor-pointer h-1.5 bg-slate-700 rounded-lg appearance-none"
            />
          </div>

          <div className="space-y-1.5">
            {BGM_TRACKS.map((track) => {
              const isSelected = track.id === currentTrackId;
              return (
                <button
                  key={track.id}
                  onClick={() => handleSelectTrack(track.id)}
                  className={`w-full text-left p-2 border-2 transition-all cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? 'bg-yellow-400 text-black border-black font-black shadow-[2px_2px_0px_#000]'
                      : 'bg-slate-900 hover:bg-slate-800 text-slate-200 border-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate pr-1">
                    <span>{track.icon}</span>
                    <div className="truncate">
                      <div className="text-xs font-black truncate">{track.name}</div>
                      <div className={`text-[10px] truncate ${isSelected ? 'text-slate-900 font-bold' : 'text-slate-400'}`}>
                        {track.description}
                      </div>
                    </div>
                  </div>
                  {isSelected && isPlaying && (
                    <span className="text-[9px] font-black px-1.5 py-0.5 bg-black text-yellow-300 shrink-0">
                      ON
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
