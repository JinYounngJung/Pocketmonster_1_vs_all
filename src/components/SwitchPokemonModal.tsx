import React from 'react';
import { PokemonData } from '../types/pokemon';
import { TypeBadge } from './TypeBadge';
import { PokemonStatusBadge } from './PokemonStatusBadge';
import { X, RefreshCw, Heart, Zap, AlertCircle } from 'lucide-react';
import { sounds } from '../utils/soundEffects';

interface SwitchPokemonModalProps {
  party: PokemonData[];
  activePokemonIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onSelectSwitch: (targetIndex: number) => void;
}

export const SwitchPokemonModal: React.FC<SwitchPokemonModalProps> = ({
  party,
  activePokemonIndex,
  isOpen,
  onClose,
  onSelectSwitch,
}) => {
  if (!isOpen) return null;

  return (
    <div
      id="switch-pokemon-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-fade-in"
      onClick={() => {
        sounds.playClick();
        onClose();
      }}
    >
      <div
        id="switch-pokemon-modal-content"
        className="relative w-full max-w-xl bg-slate-900 border-4 border-black shadow-[8px_8px_0px_#000] text-slate-100 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b-2 border-black bg-slate-950">
          <div className="flex items-center gap-2">
            <RefreshCw className="w-5 h-5 text-yellow-400" />
            <h3 className="text-lg font-black text-white uppercase">교체할 포켓몬 선택</h3>
          </div>
          <button
            onClick={() => {
              sounds.playClick();
              onClose();
            }}
            className="p-1.5 bg-white hover:bg-slate-100 border-2 border-black text-black shadow-[2px_2px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_#000] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Party Member List */}
        <div className="p-4 sm:p-6 space-y-3 max-h-[70vh] overflow-y-auto bg-slate-900">
          {party.map((member, index) => {
            const isActive = index === activePokemonIndex;
            const isFainted = member.currentHp <= 0;
            const hpPercent = Math.max(0, Math.min(100, (member.currentHp / member.stats.hp) * 100));

            return (
              <div
                key={member.id}
                id={`switch-slot-${index}`}
                onClick={() => {
                  if (!isActive && !isFainted) {
                    sounds.playClick();
                    onSelectSwitch(index);
                  }
                }}
                className={`p-3 border-2 border-black flex items-center justify-between gap-4 transition-all ${
                  isActive
                    ? 'bg-amber-950 border-4 border-yellow-400 shadow-[4px_4px_0px_#000] cursor-default'
                    : isFainted
                    ? 'bg-slate-950 opacity-60 border-slate-700 cursor-not-allowed shadow-none'
                    : 'bg-slate-950 hover:bg-slate-900 border-2 border-black cursor-pointer shadow-[4px_4px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_#000]'
                }`}
              >
                {/* Left: Sprite & Name */}
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-slate-900 border-2 border-black shadow-[2px_2px_0px_#000] flex items-center justify-center p-1">
                    <img
                      src={member.spriteFront}
                      alt={member.name}
                      className={`w-full h-full object-contain ${isFainted ? 'grayscale' : ''}`}
                    />
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-black text-sm text-white uppercase">{member.name}</span>
                      {isActive && (
                        <span className="text-[9px] font-black px-1.5 py-0.2 border border-black bg-yellow-400 text-black uppercase shadow-[1px_1px_0px_#000]">
                          배틀 중
                        </span>
                      )}
                      {isFainted && (
                        <span className="text-[9px] font-black px-1.5 py-0.2 border border-black bg-red-600 text-white uppercase shadow-[1px_1px_0px_#000]">
                          기절
                        </span>
                      )}
                      <PokemonStatusBadge status={member.status} />
                    </div>

                    <div className="flex items-center gap-1 mt-1">
                      {member.types.map((t) => (
                        <TypeBadge key={t} type={t} size="sm" />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right: HP Bar & Switch CTA */}
                <div className="w-36 text-right space-y-1">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-300 font-bold">HP</span>
                    <span
                      className={`font-black ${
                        hpPercent > 50
                          ? 'text-green-400'
                          : hpPercent > 20
                          ? 'text-yellow-400'
                          : 'text-red-400'
                      }`}
                    >
                      {member.currentHp}/{member.stats.hp}
                    </span>
                  </div>

                  <div className="w-full h-2.5 bg-slate-800 border border-black overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        hpPercent > 50
                          ? 'bg-emerald-500'
                          : hpPercent > 20
                          ? 'bg-yellow-500'
                          : 'bg-rose-500'
                      }`}
                      style={{ width: `${hpPercent}%` }}
                    />
                  </div>

                  {!isActive && !isFainted && (
                    <span className="text-[11px] font-black text-yellow-400 block pt-0.5 uppercase">
                      교체하기 ➜
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
