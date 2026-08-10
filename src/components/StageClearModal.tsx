import React, { useEffect } from 'react';
import { EliteFourMaster, PokemonData } from '../types/pokemon';
import { TypeBadge } from './TypeBadge';
import { Sparkles, Trophy, Heart, ArrowRight, ShieldCheck, Zap } from 'lucide-react';
import confetti from 'canvas-confetti';
import { sounds } from '../utils/soundEffects';

interface StageClearModalProps {
  defeatedMaster: EliteFourMaster;
  party: PokemonData[];
  nextStageNumber: number; // 2, 3, 4, or 5 (champion victory)
  onProceed: () => void;
}

export const StageClearModal: React.FC<StageClearModalProps> = ({
  defeatedMaster,
  party,
  nextStageNumber,
  onProceed,
}) => {
  useEffect(() => {
    sounds.playVictory();
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch {
      // safe fallback
    }
  }, []);

  return (
    <div
      id="stage-clear-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xs animate-fade-in"
    >
      <div
        id="stage-clear-modal-content"
        className="relative w-full max-w-lg bg-slate-900 border-4 border-black shadow-[8px_8px_0px_#000] text-slate-100 text-center p-6 sm:p-8 space-y-6"
      >
        {/* Trophy & Badge */}
        <div className="flex flex-col items-center">
          <div className="relative w-20 h-20 bg-yellow-400 border-4 border-black p-4 shadow-[4px_4px_0px_#000] flex items-center justify-center mb-3">
            <Trophy className="w-10 h-10 text-black stroke-[2.5]" />
          </div>

          <span className="text-xs font-black text-yellow-400 uppercase tracking-widest block">
            STAGE {defeatedMaster.stage} 격파 완료!
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight mt-1">
            사천왕 {defeatedMaster.name} 제압!
          </h2>

          {/* Badge Acquisition */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-yellow-400 border-2 border-black text-black text-xs font-black uppercase mt-3 shadow-[2px_2px_0px_#000]">
            <ShieldCheck className="w-4 h-4 text-black" />
            <span>【{defeatedMaster.badge.name}】 획득</span>
          </div>
        </div>

        {/* Master Defeat Quote */}
        <div className="bg-slate-950 p-4 border-2 border-black shadow-[4px_4px_0px_#000] text-slate-200 text-xs sm:text-sm leading-relaxed font-bold italic">
          “{defeatedMaster.defeatQuote}”
        </div>

        {/* Full Party Healing Notice (Key Rule Highlight) */}
        <div className="bg-slate-950 border-2 border-black p-4 text-green-400 space-y-2 shadow-[4px_4px_0px_#000]">
          <div className="flex items-center justify-center gap-2 font-black text-sm text-green-400 uppercase">
            <Heart className="w-4 h-4 text-red-500 fill-red-500 animate-ping" />
            <span>도장깨기 룰: 파티 전원 완벽 회복!</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed font-medium">
            모든 6마리 포켓몬의 <strong className="text-yellow-400">체력(HP) 100%</strong>와{' '}
            <strong className="text-yellow-400">기술 PP</strong>, 상태이상이 모두 완전히 회복되었습니다!
          </p>

          {/* Restored party avatars mini bar */}
          <div className="flex items-center justify-center gap-2 pt-2">
            {party.map((pokemon) => (
              <div
                key={pokemon.id}
                className="w-10 h-10 bg-slate-900 border-2 border-black shadow-[2px_2px_0px_#000] flex items-center justify-center p-0.5 relative group"
                title={`${pokemon.name} - HP & PP 만원 회복`}
              >
                <img src={pokemon.spriteFront} alt={pokemon.name} className="w-full h-full object-contain" />
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-green-500 border border-black" />
              </div>
            ))}
          </div>
        </div>

        {/* Proceed Button */}
        <button
          id="btn-proceed-next-stage"
          onClick={() => {
            sounds.playClick();
            onProceed();
          }}
          className="w-full py-3.5 px-6 bg-yellow-400 hover:bg-yellow-300 border-4 border-black text-black font-black text-base uppercase flex items-center justify-center gap-2 shadow-[6px_6px_0px_#000] active:translate-x-1 active:translate-y-1 active:shadow-[2px_2px_0px_#000] transition-all cursor-pointer"
        >
          <span>
            {nextStageNumber <= 4
              ? `제${nextStageNumber}관문 사천왕 도전하기`
              : '포켓몬 리그 챔피언 등극의 전당으로!'}
          </span>
          <ArrowRight className="w-5 h-5 text-black" />
        </button>
      </div>
    </div>
  );
};
