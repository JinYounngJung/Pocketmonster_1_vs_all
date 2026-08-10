import React from 'react';
import { PokemonData } from '../types/pokemon';
import { TypeBadge } from './TypeBadge';
import { Info, Check, Plus, Heart, Sword, Zap } from 'lucide-react';
import { sounds } from '../utils/soundEffects';

interface PokemonCardProps {
  pokemon: PokemonData;
  isSelected: boolean;
  partyIndex: number; // 0 to 5, or -1 if not selected
  isPartyFull: boolean;
  onToggleSelect: (pokemon: PokemonData) => void;
  onOpenDetail: (pokemon: PokemonData) => void;
}

export const PokemonCard: React.FC<PokemonCardProps> = ({
  pokemon,
  isSelected,
  partyIndex,
  isPartyFull,
  onToggleSelect,
  onOpenDetail,
}) => {
  return (
    <div
      id={`pokemon-card-${pokemon.id}`}
      className={`group relative border-2 border-black transition-all duration-150 flex flex-col justify-between overflow-hidden ${
        isSelected
          ? 'bg-amber-50 border-4 border-black shadow-[6px_6px_0px_#000] scale-[1.02]'
          : pokemon.isLegendary
          ? 'bg-amber-50/50 hover:bg-amber-100/60 shadow-[4px_4px_0px_#000] hover:shadow-[6px_6px_0px_#d97706]'
          : 'bg-white hover:bg-slate-50 shadow-[4px_4px_0px_#000] hover:shadow-[6px_6px_0px_#000]'
      }`}
    >
      {/* Selection Slot Badge */}
      {isSelected && (
        <div className="absolute top-2 left-2 z-10 flex items-center gap-1 px-2 py-0.5 bg-yellow-400 border-2 border-black text-black font-black text-[11px] shadow-[2px_2px_0px_#000] uppercase">
          <Check className="w-3 h-3 stroke-[3]" />
          <span>파티 #{partyIndex + 1}</span>
        </div>
      )}

      {/* Dex Number & Detail Button */}
      <div className="flex items-center justify-between p-2.5 pb-0">
        <div className="flex items-center gap-1">
          <span className="text-[10px] font-mono font-black text-black bg-slate-200 border border-black px-1.5 py-0.2 uppercase shadow-[1px_1px_0px_#000]">
            No.{String(pokemon.dexNumber).padStart(3, '0')}
          </span>
          {pokemon.isLegendary && (
            <span className="text-[9px] font-black px-1.5 py-0.2 bg-amber-400 border border-black text-black uppercase shadow-[1px_1px_0px_#000]">
              👑 전설
            </span>
          )}
        </div>
        <button
          id={`btn-detail-${pokemon.id}`}
          onClick={(e) => {
            e.stopPropagation();
            sounds.playClick();
            onOpenDetail(pokemon);
          }}
          className="p-1 border border-black bg-white hover:bg-yellow-400 text-black shadow-[1px_1px_0px_#000] transition-colors cursor-pointer"
          title="상세 스펙 / 기술 도감 보기"
        >
          <Info className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Sprite & Identity */}
      <div className="px-3 py-1.5 flex flex-col items-center text-center">
        <div className="relative w-24 h-24 bg-slate-100 border-2 border-black flex items-center justify-center p-1 mb-2 shadow-[2px_2px_0px_#000] group-hover:scale-105 transition-transform duration-200">
          <img
            src={pokemon.officialArtwork}
            alt={pokemon.name}
            loading="lazy"
            className="max-w-full max-h-full object-contain filter drop-shadow-xs"
            onError={(e) => {
              (e.target as HTMLImageElement).src = pokemon.spriteFront;
            }}
          />
        </div>

        <h3 className="text-base font-black text-black tracking-tight flex items-center gap-1">
          {pokemon.name}
        </h3>
        <span className="text-[10px] font-bold text-slate-500 uppercase mb-1.5">{pokemon.nameEn}</span>

        {/* Types */}
        <div className="flex items-center gap-1 mb-2.5">
          {pokemon.types.map((type) => (
            <TypeBadge key={type} type={type} size="sm" />
          ))}
        </div>

        {/* Mini Stats Summary */}
        <div className="w-full grid grid-cols-3 gap-1 bg-slate-100 p-1.5 border-2 border-black text-[10px] text-black shadow-[1px_1px_0px_#000] mb-2">
          <div className="flex flex-col items-center border-r border-black">
            <span className="text-[9px] font-black text-slate-600 flex items-center gap-0.5 uppercase">
              <Heart className="w-2.5 h-2.5 text-red-600" /> HP
            </span>
            <span className="font-black text-black">{pokemon.stats.hp}</span>
          </div>
          <div className="flex flex-col items-center border-r border-black">
            <span className="text-[9px] font-black text-slate-600 flex items-center gap-0.5 uppercase">
              <Sword className="w-2.5 h-2.5 text-orange-600" /> 공/특공
            </span>
            <span className="font-black text-black">
              {pokemon.stats.attack}/{pokemon.stats.spAttack}
            </span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-[9px] font-black text-slate-600 flex items-center gap-0.5 uppercase">
              <Zap className="w-2.5 h-2.5 text-yellow-600" /> 스피드
            </span>
            <span className="font-black text-black">{pokemon.stats.speed}</span>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="p-2.5 pt-0">
        <button
          id={`btn-select-${pokemon.id}`}
          onClick={() => {
            sounds.playClick();
            onToggleSelect(pokemon);
          }}
          disabled={!isSelected && isPartyFull}
          className={`w-full py-2 px-3 text-xs font-black uppercase flex items-center justify-center gap-1.5 transition-all border-2 border-black cursor-pointer ${
            isSelected
              ? 'bg-red-600 hover:bg-red-500 text-white shadow-[2px_2px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none'
              : isPartyFull
              ? 'bg-slate-200 text-slate-400 cursor-not-allowed opacity-60'
              : 'bg-yellow-400 hover:bg-yellow-300 text-black shadow-[2px_2px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none'
          }`}
        >
          {isSelected ? (
            <>파티에서 제외</>
          ) : isPartyFull ? (
            <>정원 초과 (6/6)</>
          ) : (
            <>
              <Plus className="w-3.5 h-3.5" /> 파티에 영입
            </>
          )}
        </button>
      </div>
    </div>
  );
};

