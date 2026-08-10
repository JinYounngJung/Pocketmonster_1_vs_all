import React from 'react';
import { EliteFourMaster } from '../types/pokemon';
import { Skull, RotateCcw, RefreshCw, Sparkles } from 'lucide-react';
import { sounds } from '../utils/soundEffects';

interface GameOverModalProps {
  currentMaster: EliteFourMaster;
  onRetryStage: () => void;
  onRebuildParty: () => void;
  onOpenOakChat: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  currentMaster,
  onRetryStage,
  onRebuildParty,
  onOpenOakChat,
}) => {
  return (
    <div
      id="game-over-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xs animate-fade-in"
    >
      <div
        id="game-over-modal-content"
        className="relative w-full max-w-md bg-slate-900 border-4 border-black shadow-[8px_8px_0px_#000] text-slate-100 text-center p-6 sm:p-8 space-y-6"
      >
        {/* Skull Icon */}
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 bg-red-600 border-4 border-black p-4 shadow-[4px_4px_0px_#000] flex items-center justify-center mb-3 text-white">
            <Skull className="w-8 h-8 text-white" />
          </div>

          <span className="text-xs font-black text-red-400 uppercase tracking-widest block">
            STAGE {currentMaster.stage} 도전 실패
          </span>
          <h2 className="text-2xl font-black text-white uppercase mt-1">눈앞이 캄캄해졌다...</h2>
        </div>

        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
          사천왕 <strong className="text-yellow-400">{currentMaster.name}</strong>의 강력한 공세에
          파티 전원이 쓰러졌습니다. 상대의 약점 타입 기술과 상성 교체를 적극 활용해 보세요!
        </p>

        {/* Action Buttons */}
        <div className="space-y-2.5">
          <button
            id="btn-retry-stage"
            onClick={() => {
              sounds.playClick();
              onRetryStage();
            }}
            className="geo-btn w-full py-3 px-4 bg-yellow-400 hover:bg-yellow-300 text-black font-black uppercase text-sm flex items-center justify-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4 text-black" />
            <span>이 사천왕에게 다시 도전 (전원 회복)</span>
          </button>

          <button
            id="btn-rebuild-party"
            onClick={() => {
              sounds.playClick();
              onRebuildParty();
            }}
            className="geo-btn w-full py-2.5 px-4 bg-white hover:bg-slate-100 text-black font-black uppercase text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4 text-black" />
            <span>파티 새로 구성하기</span>
          </button>

          <button
            id="btn-gameover-coach"
            onClick={onOpenOakChat}
            className="geo-btn w-full py-2.5 px-4 bg-white hover:bg-yellow-400 text-black font-black uppercase text-xs sm:text-sm flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-black" />
            <span>오박사에게 패배 원인 및 공략법 묻기</span>
          </button>
        </div>
      </div>
    </div>
  );
};
