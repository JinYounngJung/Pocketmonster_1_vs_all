import React, { useEffect } from 'react';
import { PokemonData, EliteFourMaster } from '../types/pokemon';
import { TypeBadge } from './TypeBadge';
import { Trophy, Crown, Sparkles, RotateCcw, ShieldCheck, Heart, Zap } from 'lucide-react';
import confetti from 'canvas-confetti';
import { sounds } from '../utils/soundEffects';
import { recordHallOfFameVictory, getGameSettings } from '../utils/localStorageStore';

interface VictoryScreenProps {
  party: PokemonData[];
  eliteMasters: EliteFourMaster[];
  totalTurns: number;
  onRestart: () => void;
}

export const VictoryScreen: React.FC<VictoryScreenProps> = ({
  party,
  eliteMasters,
  totalTurns,
  onRestart,
}) => {
  useEffect(() => {
    sounds.playVictory();
    const settings = getGameSettings();
    recordHallOfFameVictory(party, totalTurns, settings.difficulty);
    try {
      const end = Date.now() + 3 * 1000;
      const colors = ['#f59e0b', '#ef4444', '#3b82f6', '#10b981'];

      (function frame() {
        confetti({
          particleCount: 4,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors,
        });
        confetti({
          particleCount: 4,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors,
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      })();
    } catch {
      // safe fallback
    }
  }, []);

  return (
    <div
      id="victory-screen-view"
      className="w-full max-w-5xl mx-auto px-4 py-8 animate-fade-in space-y-8"
    >
      {/* Champion Banner */}
      <div className="relative bg-slate-900 border-4 border-black p-8 sm:p-12 text-center text-white shadow-[8px_8px_0px_#000] overflow-hidden">
        <div className="relative z-10 flex flex-col items-center space-y-4">
          <div className="w-24 h-24 bg-yellow-400 border-4 border-black p-5 shadow-[4px_4px_0px_#000] flex items-center justify-center">
            <Crown className="w-14 h-14 text-black stroke-[2.5]" />
          </div>

          <div>
            <div className="inline-flex items-center gap-1.5 px-4 py-1 bg-yellow-400 text-black border-2 border-black text-xs font-black uppercase tracking-widest mb-2 shadow-[2px_2px_0px_#000]">
              <Sparkles className="w-4 h-4 text-black" />
              <span>사천왕 도장깨기 완전 정복!</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white uppercase mt-2">
              새로운 <span className="text-yellow-400">포켓몬 리그 챔피언</span>의 탄생!
            </h1>
            <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto mt-2 leading-relaxed font-medium">
              시바의 바위/격투, 칸나의 얼음/물, 카게의 고스트/악, 드라케의 드래곤/불꽃 사천왕을
              전부 상성 전술로 격파하고 전설의 전당에 이름을 새겼습니다!
            </p>
          </div>

          {/* Badges Collection */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
            {eliteMasters.map((m) => (
              <div
                key={m.id}
                className="flex items-center gap-2 bg-yellow-400 px-3.5 py-1.5 border-2 border-black text-xs font-black text-black shadow-[2px_2px_0px_#000]"
              >
                <ShieldCheck className="w-4 h-4 text-black" />
                <span>{m.badge.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Hall of Fame Heroes Showcase (6 Pokemon) */}
      <div className="bg-slate-900 border-4 border-black p-6 sm:p-8 shadow-[8px_8px_0px_#000] space-y-4">
        <div className="flex items-center justify-between border-b-2 border-black pb-4">
          <div className="flex items-center gap-2.5">
            <Trophy className="w-6 h-6 text-yellow-400" />
            <h2 className="text-xl font-black text-white uppercase">챔피언 명예의 전당 (Hall of Fame)</h2>
          </div>
          <span className="text-xs font-black text-yellow-400 uppercase">총 소요 턴수: {totalTurns} Turns</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 pt-2">
          {party.map((hero, idx) => (
            <div
              key={hero.id}
              className="bg-slate-950 p-4 border-2 border-black flex flex-col items-center text-center space-y-2 shadow-[4px_4px_0px_#000] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_#000] transition-all"
            >
              <span className="text-[10px] font-black px-2 py-0.5 border border-black bg-yellow-400 text-black uppercase shadow-[1px_1px_0px_#000]">
                HERO #{idx + 1}
              </span>

              <div className="w-20 h-20 flex items-center justify-center my-1">
                <img
                  src={hero.officialArtwork}
                  alt={hero.name}
                  className="max-h-full object-contain filter drop-shadow-md"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = hero.spriteFront;
                  }}
                />
              </div>

              <div className="w-full">
                <h3 className="text-sm font-black text-white truncate uppercase">{hero.name}</h3>
                <span className="text-[10px] text-slate-300 block font-mono font-bold">Lv.50 FLAT</span>
                <div className="flex justify-center gap-1 mt-1.5">
                  {hero.types.map((t) => (
                    <TypeBadge key={t} type={t} size="sm" />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Restart Challenge CTA */}
      <div className="flex justify-center pt-4">
        <button
          id="btn-play-again"
          onClick={() => {
            sounds.playClick();
            onRestart();
          }}
          className="px-10 py-4 bg-yellow-400 hover:bg-yellow-300 border-4 border-black text-black font-black text-lg uppercase flex items-center gap-3 shadow-[8px_8px_0px_#000] active:translate-x-1 active:translate-y-1 active:shadow-[2px_2px_0px_#000] transition-all cursor-pointer"
        >
          <RotateCcw className="w-6 h-6 text-black" />
          <span>새로운 파티로 다시 도전하기</span>
        </button>
      </div>
    </div>
  );
};
