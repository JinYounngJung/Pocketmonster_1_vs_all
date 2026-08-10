import React from 'react';
import { StatusCondition, StatStages } from '../types/pokemon';

interface PokemonStatusBadgeProps {
  status: StatusCondition;
  statStages?: StatStages;
}

export const PokemonStatusBadge: React.FC<PokemonStatusBadgeProps> = ({ status, statStages }) => {
  const statusConfig: Record<StatusCondition, { text: string; bg: string } | null> = {
    none: null,
    burn: { text: '화상 (BRN)', bg: 'bg-red-600 text-white' },
    paralysis: { text: '마비 (PAR)', bg: 'bg-yellow-400 text-black' },
    poison: { text: '독 (PSN)', bg: 'bg-purple-700 text-white' },
    badPoison: { text: '맹독 (TOX)', bg: 'bg-purple-950 text-purple-200' },
    sleep: { text: '수면 (SLP)', bg: 'bg-indigo-600 text-white' },
    freeze: { text: '동빙 (FRZ)', bg: 'bg-cyan-400 text-black' },
  };

  const currentStatus = statusConfig[status];

  // Significant stat changes
  const activeBoosts: { label: string; stages: number; isBuff: boolean }[] = [];
  if (statStages) {
    if (statStages.attack !== 0) activeBoosts.push({ label: '공격', stages: statStages.attack, isBuff: statStages.attack > 0 });
    if (statStages.defense !== 0) activeBoosts.push({ label: '방어', stages: statStages.defense, isBuff: statStages.defense > 0 });
    if (statStages.spAttack !== 0) activeBoosts.push({ label: '특공', stages: statStages.spAttack, isBuff: statStages.spAttack > 0 });
    if (statStages.spDefense !== 0) activeBoosts.push({ label: '특방', stages: statStages.spDefense, isBuff: statStages.spDefense > 0 });
    if (statStages.speed !== 0) activeBoosts.push({ label: '스피드', stages: statStages.speed, isBuff: statStages.speed > 0 });
  }

  return (
    <div className="flex flex-wrap items-center gap-1">
      {currentStatus && (
        <span
          className={`text-[10px] font-black px-1.5 py-0.2 border-2 border-black shadow-[1px_1px_0px_#000] uppercase ${currentStatus.bg} animate-pulse`}
        >
          {currentStatus.text}
        </span>
      )}

      {activeBoosts.map((b) => (
        <span
          key={b.label}
          className={`text-[10px] font-black px-1.5 py-0.2 border border-black shadow-[1px_1px_0px_#000] ${
            b.isBuff
              ? 'bg-yellow-400 text-black'
              : 'bg-blue-600 text-white'
          }`}
        >
          {b.label} {b.stages > 0 ? `+${b.stages}` : b.stages}
        </span>
      ))}
    </div>
  );
};

