import React, { useState } from 'react';
import { PokemonType } from '../types/pokemon';
import { TYPE_CHART, TYPE_COLORS, getTypeEffectiveness } from '../data/typeChart';
import { TypeBadge } from './TypeBadge';
import { X, BookOpen, Search, Shield, Sword } from 'lucide-react';
import { sounds } from '../utils/soundEffects';

interface TypeChartModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ALL_TYPES: PokemonType[] = [
  '노말', '불꽃', '물', '풀', '전기', '얼음', '격투', '독',
  '땅', '비행', '에스퍼', '벌레', '바위', '고스트', '드래곤', '악', '강철', '페어리'
];

export const TypeChartModal: React.FC<TypeChartModalProps> = ({ isOpen, onClose }) => {
  const [inspectType, setInspectType] = useState<PokemonType>('불꽃');

  if (!isOpen) return null;

  // Attack matchup for inspectType
  const attackStrengths: PokemonType[] = [];
  const attackWeaknesses: PokemonType[] = [];
  const attackImmunities: PokemonType[] = [];

  // Defense matchup for inspectType
  const defenseWeaknesses: PokemonType[] = [];
  const defenseResistances: PokemonType[] = [];
  const defenseImmunities: PokemonType[] = [];

  ALL_TYPES.forEach((other) => {
    // When inspectType attacks other
    const atkEff = getTypeEffectiveness(inspectType, [other]);
    if (atkEff === 2) attackStrengths.push(other);
    else if (atkEff === 0.5) attackWeaknesses.push(other);
    else if (atkEff === 0) attackImmunities.push(other);

    // When other attacks inspectType
    const defEff = getTypeEffectiveness(other, [inspectType]);
    if (defEff === 2) defenseWeaknesses.push(other);
    else if (defEff === 0.5) defenseResistances.push(other);
    else if (defEff === 0) defenseImmunities.push(other);
  });

  return (
    <div
      id="type-chart-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xs animate-fade-in"
      onClick={() => {
        sounds.playClick();
        onClose();
      }}
    >
      <div
        id="type-chart-modal-content"
        className="relative w-full max-w-4xl bg-slate-900 border-4 border-black shadow-[8px_8px_0px_#000] text-slate-100 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b-2 border-black bg-slate-950">
          <div className="flex items-center gap-2.5">
            <BookOpen className="w-5 h-5 text-yellow-400" />
            <h3 className="text-lg font-black text-white uppercase">포켓몬 18타입 완전 상성표 도감</h3>
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

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 bg-slate-900">
          {/* Type Selector Pill Bar */}
          <div>
            <span className="text-xs font-black text-white uppercase block mb-2">분석할 타입을 선택하세요:</span>
            <div className="flex flex-wrap gap-1.5">
              {ALL_TYPES.map((type) => (
                <button
                  key={type}
                  onClick={() => {
                    sounds.playClick();
                    setInspectType(type);
                  }}
                  className={`transition-all cursor-pointer ${
                    inspectType === type
                      ? 'border-2 border-black shadow-[3px_3px_0px_#000] scale-105'
                      : 'opacity-70 hover:opacity-100'
                  }`}
                >
                  <TypeBadge type={type} size="sm" />
                </button>
              ))}
            </div>
          </div>

          {/* Detailed Matchup Inspector for inspectType */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Attack Matchups */}
            <div className="bg-slate-950 p-4 border-2 border-black shadow-[4px_4px_0px_#000] space-y-3">
              <div className="flex items-center gap-2 border-b-2 border-black pb-2">
                <Sword className="w-4 h-4 text-yellow-400" />
                <h4 className="text-sm font-black text-white uppercase">
                  【{inspectType}】 타입 기술로 공격 시
                </h4>
              </div>

              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-green-400 font-black uppercase block mb-1">
                    효과는 굉장했다! (2.0배 피해):
                  </span>
                  {attackStrengths.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {attackStrengths.map((t) => (
                        <TypeBadge key={t} type={t} size="sm" />
                      ))}
                    </div>
                  ) : (
                    <span className="text-slate-400">2배 약점 찌르는 타입 없음</span>
                  )}
                </div>

                <div>
                  <span className="text-cyan-400 font-black uppercase block mb-1">
                    효과가 별로인 듯하다... (0.5배 반감):
                  </span>
                  {attackWeaknesses.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {attackWeaknesses.map((t) => (
                        <TypeBadge key={t} type={t} size="sm" />
                      ))}
                    </div>
                  ) : (
                    <span className="text-slate-400">반감 없음</span>
                  )}
                </div>

                <div>
                  <span className="text-red-400 font-black uppercase block mb-1">
                    효과가 없는 것 같다... (0배 완벽 무효):
                  </span>
                  {attackImmunities.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {attackImmunities.map((t) => (
                        <TypeBadge key={t} type={t} size="sm" />
                      ))}
                    </div>
                  ) : (
                    <span className="text-slate-400">무효 타입 없음</span>
                  )}
                </div>
              </div>
            </div>

            {/* Defense Matchups */}
            <div className="bg-slate-950 p-4 border-2 border-black shadow-[4px_4px_0px_#000] space-y-3">
              <div className="flex items-center gap-2 border-b-2 border-black pb-2">
                <Shield className="w-4 h-4 text-cyan-400" />
                <h4 className="text-sm font-black text-white uppercase">
                  【{inspectType}】 타입 포켓몬이 피격 시 (단일 타입 기준)
                </h4>
              </div>

              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-red-400 font-black uppercase block mb-1">
                    약점! (2.0배 피해를 입음):
                  </span>
                  {defenseWeaknesses.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {defenseWeaknesses.map((t) => (
                        <TypeBadge key={t} type={t} size="sm" />
                      ))}
                    </div>
                  ) : (
                    <span className="text-slate-400">약점 없음</span>
                  )}
                </div>

                <div>
                  <span className="text-green-400 font-black uppercase block mb-1">
                    내성! (0.5배로 경감):
                  </span>
                  {defenseResistances.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {defenseResistances.map((t) => (
                        <TypeBadge key={t} type={t} size="sm" />
                      ))}
                    </div>
                  ) : (
                    <span className="text-slate-400">반감 없음</span>
                  )}
                </div>

                <div>
                  <span className="text-cyan-300 font-black uppercase block mb-1">
                    무효! (0배 완벽 방어):
                  </span>
                  {defenseImmunities.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {defenseImmunities.map((t) => (
                        <TypeBadge key={t} type={t} size="sm" />
                      ))}
                    </div>
                  ) : (
                    <span className="text-slate-400">무효 없음</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
