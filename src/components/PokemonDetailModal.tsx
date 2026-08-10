import React from 'react';
import { PokemonData, PokemonType } from '../types/pokemon';
import { TypeBadge } from './TypeBadge';
import { getDefenseWeaknesses } from '../data/typeChart';
import { X, Heart, Shield, Sword, Zap, Sparkles, Activity } from 'lucide-react';
import { sounds } from '../utils/soundEffects';

interface PokemonDetailModalProps {
  pokemon: PokemonData | null;
  onClose: () => void;
}

export const PokemonDetailModal: React.FC<PokemonDetailModalProps> = ({ pokemon, onClose }) => {
  if (!pokemon) return null;

  const weaknesses = getDefenseWeaknesses(pokemon.types);
  const totalBase = Object.values(pokemon.baseStats).reduce((a, b) => Number(a) + Number(b), 0);

  // Group weaknesses
  const superWeak: PokemonType[] = []; // 4x
  const weak: PokemonType[] = []; // 2x
  const resist: PokemonType[] = []; // 0.5x
  const superResist: PokemonType[] = []; // 0.25x
  const immune: PokemonType[] = []; // 0x

  (Object.entries(weaknesses) as [PokemonType, number][]).forEach(([type, mult]) => {
    if (mult === 4) superWeak.push(type);
    else if (mult === 2) weak.push(type);
    else if (mult === 0.5) resist.push(type);
    else if (mult === 0.25) superResist.push(type);
    else if (mult === 0) immune.push(type);
  });

  return (
    <div
      id="pokemon-detail-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-fade-in"
      onClick={() => {
        sounds.playClick();
        onClose();
      }}
    >
      <div
        id="pokemon-detail-modal-content"
        className="relative w-full max-w-2xl bg-slate-900 border-4 border-black shadow-[8px_8px_0px_#000] text-slate-100 max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b-2 border-black bg-slate-950">
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono font-black text-black bg-yellow-400 border border-black px-2 py-0.5 shadow-[1px_1px_0px_#000]">
              No.{String(pokemon.dexNumber).padStart(3, '0')}
            </span>
            <h2 className="text-xl font-black text-white uppercase flex items-center gap-2">
              {pokemon.name}
              <span className="text-xs font-bold text-slate-400">({pokemon.nameEn})</span>
              {pokemon.isLegendary && (
                <span className="text-[10px] font-black px-2 py-0.5 bg-amber-400 text-black border border-black uppercase shadow-[1px_1px_0px_#000]">
                  👑 전설/환상
                </span>
              )}
            </h2>
            <div className="flex items-center gap-1.5 ml-2">
              {pokemon.types.map((type) => (
                <TypeBadge key={type} type={type} size="sm" />
              ))}
            </div>
          </div>

          <button
            id="btn-close-detail"
            onClick={() => {
              sounds.playClick();
              onClose();
            }}
            className="p-1.5 bg-white hover:bg-slate-100 border-2 border-black text-black shadow-[2px_2px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_#000] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6 bg-slate-900">
          {/* Top Row: Artwork + Ability + Stat Overview */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            {/* Artwork */}
            <div className="md:col-span-5 flex flex-col items-center justify-center bg-slate-950 p-4 border-2 border-black shadow-[4px_4px_0px_#000]">
              <img
                src={pokemon.officialArtwork}
                alt={pokemon.name}
                className="w-40 h-40 object-contain filter drop-shadow-xl"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = pokemon.spriteFront;
                }}
              />
              <div className="mt-3 text-center">
                <span className="text-[11px] font-black text-yellow-400 uppercase tracking-wider block">
                  특성 (Ability)
                </span>
                <span className="text-sm font-black text-white block">{pokemon.ability.name}</span>
                <p className="text-xs text-slate-300 mt-1 max-w-xs font-medium">{pokemon.ability.description}</p>
              </div>
            </div>

            {/* Stats Breakdown (Lv 50 Flat) */}
            <div className="md:col-span-7 space-y-2 bg-slate-950 p-4 border-2 border-black shadow-[4px_4px_0px_#000]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-black text-white uppercase flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-green-400" /> Lv.50 실능력치 (종족값)
                </span>
                <span className="text-xs font-mono font-bold text-yellow-400">총합: {totalBase}</span>
              </div>

              {/* Stat bars */}
              {[
                { label: 'HP', base: pokemon.baseStats.hp, stat: pokemon.stats.hp, color: 'bg-rose-500' },
                { label: '공격', base: pokemon.baseStats.attack, stat: pokemon.stats.attack, color: 'bg-orange-500' },
                { label: '방어', base: pokemon.baseStats.defense, stat: pokemon.stats.defense, color: 'bg-yellow-500' },
                { label: '특수공격', base: pokemon.baseStats.spAttack, stat: pokemon.stats.spAttack, color: 'bg-sky-500' },
                { label: '특수방어', base: pokemon.baseStats.spDefense, stat: pokemon.stats.spDefense, color: 'bg-indigo-500' },
                { label: '스피드', base: pokemon.baseStats.speed, stat: pokemon.stats.speed, color: 'bg-emerald-500' },
              ].map((s) => (
                <div key={s.label} className="grid grid-cols-12 items-center text-xs gap-2">
                  <span className="col-span-3 text-slate-300 font-bold">{s.label}</span>
                  <span className="col-span-2 font-mono font-black text-white text-right">
                    {s.stat} <span className="text-[10px] text-slate-400 font-normal">({s.base})</span>
                  </span>
                  <div className="col-span-7 h-2.5 bg-slate-800 border border-black overflow-hidden">
                    <div
                      className={`h-full ${s.color}`}
                      style={{ width: `${Math.min(100, (s.base / 160) * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 4 Moves Arsenal */}
          <div>
            <h3 className="text-sm font-black text-white uppercase mb-3 flex items-center gap-1.5">
              <Sword className="w-4 h-4 text-yellow-400" /> 보유 기술 4종 (Lv.50 배틀 세팅)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {pokemon.moves.map((move) => (
                <div
                  key={move.id}
                  className="bg-slate-950 p-3.5 border-2 border-black shadow-[4px_4px_0px_#000] flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-black text-sm text-white uppercase">{move.name}</span>
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

                    <p className="text-xs text-slate-300 mb-2 leading-relaxed font-medium">{move.description}</p>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-300 border-t border-slate-700 pt-2 font-mono font-bold">
                    <span>위력: <strong className="text-yellow-400">{move.power > 0 ? move.power : '-'}</strong></span>
                    <span>명중률: <strong className="text-white">{move.accuracy > 100 ? '필중' : `${move.accuracy}%`}</strong></span>
                    <span>PP: <strong className="text-yellow-400">{move.pp}/{move.maxPp}</strong></span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Defense Type Matchups Matrix */}
          <div>
            <h3 className="text-sm font-black text-white uppercase mb-3 flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-cyan-400" /> 방어 상성 분석 (피해 배율)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {/* Weaknesses */}
              <div className="bg-slate-950 border-2 border-black p-3.5 shadow-[4px_4px_0px_#000]">
                <span className="font-black text-red-400 uppercase block mb-2">약점 (받는 피해 증가)</span>
                {superWeak.length > 0 && (
                  <div className="mb-2">
                    <span className="text-[11px] text-red-300 font-bold block mb-1">4배 치명상:</span>
                    <div className="flex flex-wrap gap-1">
                      {superWeak.map((t) => (
                        <TypeBadge key={t} type={t} size="sm" />
                      ))}
                    </div>
                  </div>
                )}
                {weak.length > 0 ? (
                  <div>
                    <span className="text-[11px] text-yellow-400 font-bold block mb-1">2배 약점:</span>
                    <div className="flex flex-wrap gap-1">
                      {weak.map((t) => (
                        <TypeBadge key={t} type={t} size="sm" />
                      ))}
                    </div>
                  </div>
                ) : (
                  <span className="text-slate-400 text-xs">2배 약점 없음</span>
                )}
              </div>

              {/* Resistances & Immunities */}
              <div className="bg-slate-950 border-2 border-black p-3.5 shadow-[4px_4px_0px_#000]">
                <span className="font-black text-green-400 uppercase block mb-2">반감 및 무효 (방어 유리)</span>
                {immune.length > 0 && (
                  <div className="mb-2">
                    <span className="text-[11px] text-cyan-300 font-bold block mb-1">0배 완벽 무효:</span>
                    <div className="flex flex-wrap gap-1">
                      {immune.map((t) => (
                        <TypeBadge key={t} type={t} size="sm" />
                      ))}
                    </div>
                  </div>
                )}
                {resist.length > 0 || superResist.length > 0 ? (
                  <div>
                    <span className="text-[11px] text-green-300 font-bold block mb-1">0.5배 / 0.25배 반감:</span>
                    <div className="flex flex-wrap gap-1">
                      {[...superResist, ...resist].map((t) => (
                        <TypeBadge key={t} type={t} size="sm" />
                      ))}
                    </div>
                  </div>
                ) : (
                  <span className="text-slate-400 text-xs">반감 없음</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
