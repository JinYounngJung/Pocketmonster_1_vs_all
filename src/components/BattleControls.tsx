import React from 'react';
import { PokemonData, Move } from '../types/pokemon';
import { TypeBadge } from './TypeBadge';
import { getTypeEffectiveness } from '../data/typeChart';
import { Swords, RefreshCw, Sparkles, BookOpen, Zap } from 'lucide-react';
import { sounds } from '../utils/soundEffects';

interface BattleControlsProps {
  playerPokemon: PokemonData;
  opponentPokemon: PokemonData;
  isProcessingTurn: boolean;
  onSelectMove: (move: Move) => void;
  onOpenSwitchModal: () => void;
  onOpenOakChat: () => void;
  onOpenTypeChart: () => void;
}

export const BattleControls: React.FC<BattleControlsProps> = ({
  playerPokemon,
  opponentPokemon,
  isProcessingTurn,
  onSelectMove,
  onOpenSwitchModal,
  onOpenOakChat,
  onOpenTypeChart,
}) => {
  return (
    <div id="battle-controls-container" className="w-full space-y-3">
      {/* 4 Moves Action Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {playerPokemon.moves.map((move) => {
          const mult = move.power > 0 ? getTypeEffectiveness(move.type, opponentPokemon.types) : 1;
          const isSuper = mult > 1;
          const isResist = mult < 1 && mult > 0;
          const isImmune = mult === 0;
          const isOutOfPp = move.pp <= 0;

          return (
            <button
              key={move.id}
              id={`btn-move-${move.id}`}
              onClick={() => {
                sounds.playClick();
                onSelectMove(move);
              }}
              disabled={isProcessingTurn || isOutOfPp}
              className={`relative p-3 border-2 border-black text-left transition-all flex flex-col justify-between overflow-hidden cursor-pointer shadow-[4px_4px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_#000] ${
                isOutOfPp
                  ? 'bg-slate-900 border-slate-700 text-slate-600 cursor-not-allowed opacity-60 shadow-none'
                  : isProcessingTurn
                  ? 'bg-slate-900 border-slate-700 text-slate-500 cursor-wait'
                  : isSuper
                  ? 'bg-amber-950 border-4 border-yellow-400 hover:bg-amber-900'
                  : 'bg-slate-900 hover:bg-slate-800'
              }`}
            >
              {/* Top Row: Name + Type Badge + Category */}
              <div className="flex items-center justify-between w-full mb-1">
                <span className="font-black text-sm text-white uppercase tracking-tight flex items-center gap-1.5">
                  {move.priority && move.priority > 0 && (
                    <Zap className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" title="선제 공격기" />
                  )}
                  {move.name}
                </span>

                <div className="flex items-center gap-1.5">
                  <span
                    className={`text-[9px] px-1.5 py-0.2 border border-black font-black uppercase shadow-[1px_1px_0px_#000] ${
                      move.category === 'physical'
                        ? 'bg-orange-500 text-black'
                        : move.category === 'special'
                        ? 'bg-cyan-400 text-black'
                        : 'bg-slate-300 text-black'
                    }`}
                  >
                    {move.category === 'physical' ? '물리' : move.category === 'special' ? '특수' : '변화'}
                  </span>
                  <TypeBadge type={move.type} size="sm" />
                </div>
              </div>

              {/* Bottom Row: Stats & Type Matchup Tag */}
              <div className="flex items-center justify-between text-xs text-slate-300 w-full pt-1.5 border-t border-slate-700 font-mono">
                <div className="flex items-center gap-2">
                  <span className="font-bold">위력: <strong className="text-yellow-400">{move.power > 0 ? move.power : '-'}</strong></span>
                  <span className="font-bold">명중: <strong className="text-white">{move.accuracy > 100 ? '필중' : `${move.accuracy}%`}</strong></span>
                </div>

                <div className="flex items-center gap-2">
                  {/* Effectiveness Indicator Tag */}
                  {move.power > 0 && (
                    <span
                      className={`text-[9px] font-black px-1.5 py-0.2 border border-black uppercase shadow-[1px_1px_0px_#000] ${
                        isSuper
                          ? 'bg-red-500 text-white animate-pulse'
                          : isImmune
                          ? 'bg-slate-700 text-slate-300'
                          : isResist
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {isSuper
                        ? `굉장함 (${mult}x)`
                        : isImmune
                        ? '무효 (0x)'
                        : isResist
                        ? `반감 (${mult}x)`
                        : '보통 (1x)'}
                    </span>
                  )}

                  {/* PP */}
                  <span className={`font-black text-xs ${move.pp === 0 ? 'text-red-500' : move.pp <= 3 ? 'text-yellow-400' : 'text-slate-200'}`}>
                    PP {move.pp}/{move.maxPp}
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Auxiliary Tactical Action Bar */}
      <div className="grid grid-cols-3 gap-2.5">
        {/* Switch Pokemon */}
        <button
          id="btn-switch-pokemon"
          onClick={() => {
            sounds.playClick();
            onOpenSwitchModal();
          }}
          disabled={isProcessingTurn}
          className="geo-btn py-2.5 px-3 bg-white hover:bg-emerald-300 text-black text-xs sm:text-sm font-black uppercase flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className="w-4 h-4 text-black" />
          <span>포켓몬 교체</span>
        </button>

        {/* Dr. Oak Live Matchup Coach Advice */}
        <button
          id="btn-coach-advice"
          onClick={() => {
            sounds.playClick();
            onOpenOakChat();
          }}
          className="geo-btn py-2.5 px-3 bg-yellow-400 hover:bg-yellow-300 text-black text-xs sm:text-sm font-black uppercase flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <Sparkles className="w-4 h-4 text-black" />
          <span>오박사 훈수</span>
        </button>

        {/* Type Chart Quick Reference */}
        <button
          id="btn-open-typechart-battle"
          onClick={() => {
            sounds.playClick();
            onOpenTypeChart();
          }}
          className="geo-btn py-2.5 px-3 bg-white hover:bg-slate-150 text-black text-xs sm:text-sm font-black uppercase flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <BookOpen className="w-4 h-4 text-black" />
          <span>상성표 보기</span>
        </button>
      </div>
    </div>
  );
};
