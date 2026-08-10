import React from 'react';
import { Volume2, VolumeX, Sparkles, BookOpen, RotateCcw, Settings } from 'lucide-react';
import { sounds } from '../utils/soundEffects';
import { BgmPlayerWidget } from './BgmPlayerWidget';

interface HeaderProps {
  currentStage: number; // 0 = Team Building, 1..4 = Stage 1..4, 5 = Champion
  isMuted: boolean;
  onToggleMute: () => void;
  onOpenOakChat: () => void;
  onOpenTypeChart: () => void;
  onOpenAdmin: () => void;
  onResetGame: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentStage,
  isMuted,
  onToggleMute,
  onOpenOakChat,
  onOpenTypeChart,
  onOpenAdmin,
  onResetGame,
}) => {
  return (
    <header
      id="app-header"
      className="sticky top-0 z-40 w-full bg-red-600 border-b-4 border-black text-white shadow-md select-none"
    >
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between gap-3">
        {/* Title and Branding with Geometric Pokeball */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-white border-4 border-black flex items-center justify-center shadow-[2px_2px_0px_#000] shrink-0">
            <div className="w-2.5 h-2.5 rounded-full bg-slate-900"></div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-black tracking-tighter uppercase text-white drop-shadow-xs">
                포켓몬 리그 <span className="text-yellow-300">사천왕 도장깨기</span>
              </h1>
              <span className="hidden sm:inline-block px-2 py-0.5 bg-yellow-400 border-2 border-black text-black font-black text-[11px] uppercase shadow-[1px_1px_0px_#000]">
                Lv.50 FLAT
              </span>
            </div>
            <p className="text-[11px] font-bold text-red-100 uppercase tracking-tight hidden md:block">
              ELITE FOUR CHALLENGE • 6 POKEMON ENTRY • FULL HEAL RULE
            </p>
          </div>
        </div>

        {/* Stage tracker (when in challenge) */}
        {currentStage > 0 && currentStage <= 4 && (
          <div className="hidden lg:flex items-center gap-2 bg-slate-950/80 px-3 py-1.5 border-2 border-black shadow-[2px_2px_0px_#000]">
            <span className="px-2 py-0.5 bg-yellow-400 border border-black text-black font-black text-[10px] uppercase">
              관문 진행도
            </span>
            <div className="flex gap-1.5">
              {[1, 2, 3, 4].map((stageNum) => (
                <div
                  key={stageNum}
                  className={`w-6 h-6 border-2 border-black flex items-center justify-center font-black text-xs transition-all ${
                    stageNum === currentStage
                      ? 'bg-yellow-400 text-black animate-pulse shadow-[1px_1px_0px_#000]'
                      : stageNum < currentStage
                      ? 'bg-green-500 text-black'
                      : 'bg-slate-700 text-slate-400'
                  }`}
                  title={`제${stageNum}관문`}
                >
                  {stageNum}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Controls Bar with Geometric styling */}
        <div className="flex items-center gap-2">
          {/* 4th Gen Pokemon BGM Player Widget */}
          <BgmPlayerWidget theme="header" />

          {/* Admin Dashboard Button */}
          <button
            id="btn-admin-page"
            onClick={() => {
              sounds.playClick();
              onOpenAdmin();
            }}
            className="geo-btn flex items-center gap-1.5 px-3 py-1.5 bg-slate-950 hover:bg-slate-900 text-yellow-300 font-black text-xs sm:text-sm uppercase cursor-pointer border-2 border-yellow-400 shadow-[2px_2px_0px_#000]"
            title="포켓몬/기술/규칙 관리자 페이지"
          >
            <Settings className="w-4 h-4 text-yellow-400" />
            <span className="hidden sm:inline">관리자 페이지</span>
            <span className="sm:hidden">관리자</span>
          </button>

          {/* Dr Oak Coach Trigger Button */}
          <button
            id="btn-oak-chat"
            onClick={() => {
              sounds.playClick();
              onOpenOakChat();
            }}
            className="geo-btn flex items-center gap-1.5 px-3 py-1.5 bg-yellow-400 hover:bg-yellow-300 text-black font-black text-xs sm:text-sm uppercase cursor-pointer"
            title="오박사 배틀 코치 AI 훈수"
          >
            <Sparkles className="w-4 h-4 text-black" />
            <span className="hidden sm:inline">오박사 AI 코치</span>
            <span className="sm:hidden">AI 코치</span>
          </button>

          {/* Type Chart Button */}
          <button
            id="btn-type-chart"
            onClick={() => {
              sounds.playClick();
              onOpenTypeChart();
            }}
            className="geo-btn flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-100 text-black font-black text-xs sm:text-sm uppercase cursor-pointer"
            title="18타입 상성표 도감"
          >
            <BookOpen className="w-4 h-4 text-blue-600" />
            <span className="hidden sm:inline">상성표</span>
          </button>

          {/* Sound FX Toggle */}
          <button
            id="btn-sound-toggle"
            onClick={onToggleMute}
            className="geo-btn p-1.5 sm:p-2 bg-white hover:bg-slate-100 text-black cursor-pointer"
            title={isMuted ? '효과음 음소거 해제' : '효과음 음소거'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-600" /> : <Volume2 className="w-4 h-4 text-green-700" />}
          </button>

          {/* Restart Game */}
          <button
            id="btn-reset-game"
            onClick={() => {
              sounds.playClick();
              if (window.confirm('처음 파티 구성 화면으로 돌아가시겠습니까? (현재 진행도는 리셋됩니다)')) {
                onResetGame();
              }
            }}
            className="geo-btn p-1.5 sm:p-2 bg-slate-900 hover:bg-slate-800 text-white cursor-pointer"
            title="게임 리셋 / 다시하기"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
