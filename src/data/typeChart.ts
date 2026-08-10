import { PokemonType } from '../types/pokemon';

// Type effectiveness matrix: attacker -> defender -> multiplier
export const TYPE_CHART: Record<PokemonType, Partial<Record<PokemonType, number>>> = {
  노말: {
    바위: 0.5,
    고스트: 0,
    강철: 0.5,
  },
  불꽃: {
    불꽃: 0.5,
    물: 0.5,
    풀: 2,
    얼음: 2,
    벌레: 2,
    바위: 0.5,
    드래곤: 0.5,
    강철: 2,
  },
  물: {
    불꽃: 2,
    물: 0.5,
    풀: 0.5,
    땅: 2,
    바위: 2,
    드래곤: 0.5,
  },
  풀: {
    불꽃: 0.5,
    물: 2,
    풀: 0.5,
    독: 0.5,
    땅: 2,
    비행: 0.5,
    벌레: 0.5,
    바위: 2,
    드래곤: 0.5,
    강철: 0.5,
  },
  전기: {
    물: 2,
    풀: 0.5,
    전기: 0.5,
    땅: 0,
    비행: 2,
    드래곤: 0.5,
  },
  얼음: {
    불꽃: 0.5,
    물: 0.5,
    풀: 2,
    얼음: 0.5,
    땅: 2,
    비행: 2,
    드래곤: 2,
    강철: 0.5,
  },
  격투: {
    노말: 2,
    얼음: 2,
    독: 0.5,
    비행: 0.5,
    에스퍼: 0.5,
    벌레: 0.5,
    바위: 2,
    고스트: 0,
    악: 2,
    강철: 2,
    페어리: 0.5,
  },
  독: {
    풀: 2,
    독: 0.5,
    땅: 0.5,
    바위: 0.5,
    고스트: 0.5,
    강철: 0,
    페어리: 2,
  },
  땅: {
    불꽃: 2,
    풀: 0.5,
    전기: 2,
    독: 2,
    비행: 0,
    벌레: 0.5,
    바위: 2,
    강철: 2,
  },
  비행: {
    풀: 2,
    전기: 0.5,
    격투: 2,
    벌레: 2,
    바위: 0.5,
    강철: 0.5,
  },
  에스퍼: {
    격투: 2,
    독: 2,
    에스퍼: 0.5,
    악: 0,
    강철: 0.5,
  },
  벌레: {
    불꽃: 0.5,
    풀: 2,
    격투: 0.5,
    독: 0.5,
    비행: 0.5,
    에스퍼: 2,
    고스트: 0.5,
    악: 2,
    강철: 0.5,
    페어리: 0.5,
  },
  바위: {
    불꽃: 2,
    얼음: 2,
    격투: 0.5,
    땅: 0.5,
    비행: 2,
    벌레: 2,
    강철: 0.5,
  },
  고스트: {
    노말: 0,
    에스퍼: 2,
    고스트: 2,
    악: 0.5,
  },
  드래곤: {
    드래곤: 2,
    강철: 0.5,
    페어리: 0,
  },
  악: {
    격투: 0.5,
    에스퍼: 2,
    고스트: 2,
    악: 0.5,
    페어리: 0.5,
  },
  강철: {
    불꽃: 0.5,
    물: 0.5,
    전기: 0.5,
    얼음: 2,
    바위: 2,
    강철: 0.5,
    페어리: 2,
  },
  페어리: {
    불꽃: 0.5,
    격투: 2,
    독: 0.5,
    드래곤: 2,
    악: 2,
    강철: 0.5,
  },
};

// Calculate attack type against single/dual defending types
export function getTypeEffectiveness(attackType: PokemonType, defenderTypes: PokemonType[]): number {
  let multiplier = 1;
  for (const defType of defenderTypes) {
    const singleMultiplier = TYPE_CHART[attackType]?.[defType] ?? 1;
    multiplier *= singleMultiplier;
  }
  return multiplier;
}

// Calculate defensive matchups for team synergy inspection
export function getDefenseWeaknesses(types: PokemonType[]): Record<PokemonType, number> {
  const allTypes: PokemonType[] = [
    '노말', '불꽃', '물', '풀', '전기', '얼음', '격투', '독',
    '땅', '비행', '에스퍼', '벌레', '바위', '고스트', '드래곤', '악', '강철', '페어리'
  ];
  const result: Record<PokemonType, number> = {} as any;
  for (const atkType of allTypes) {
    result[atkType] = getTypeEffectiveness(atkType, types);
  }
  return result;
}

// Visual color styling for each type
export const TYPE_COLORS: Record<PokemonType, {
  bg: string;
  text: string;
  badge: string;
  border: string;
  glow: string;
}> = {
  노말: { bg: 'bg-stone-500', text: 'text-stone-100', badge: 'bg-stone-500/20 text-stone-300 border-stone-400/40', border: 'border-stone-400', glow: 'shadow-stone-500/30' },
  불꽃: { bg: 'bg-red-500', text: 'text-white', badge: 'bg-red-500/20 text-red-300 border-red-400/40', border: 'border-red-500', glow: 'shadow-red-500/30' },
  물: { bg: 'bg-blue-500', text: 'text-white', badge: 'bg-blue-500/20 text-blue-300 border-blue-400/40', border: 'border-blue-500', glow: 'shadow-blue-500/30' },
  풀: { bg: 'bg-emerald-500', text: 'text-white', badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40', border: 'border-emerald-500', glow: 'shadow-emerald-500/30' },
  전기: { bg: 'bg-yellow-400', text: 'text-slate-900', badge: 'bg-yellow-400/20 text-yellow-300 border-yellow-300/40', border: 'border-yellow-400', glow: 'shadow-yellow-400/30' },
  얼음: { bg: 'bg-cyan-400', text: 'text-slate-900', badge: 'bg-cyan-400/20 text-cyan-300 border-cyan-300/40', border: 'border-cyan-400', glow: 'shadow-cyan-400/30' },
  격투: { bg: 'bg-amber-700', text: 'text-white', badge: 'bg-amber-700/20 text-amber-300 border-amber-600/40', border: 'border-amber-700', glow: 'shadow-amber-700/30' },
  독: { bg: 'bg-purple-600', text: 'text-white', badge: 'bg-purple-600/20 text-purple-300 border-purple-500/40', border: 'border-purple-600', glow: 'shadow-purple-600/30' },
  땅: { bg: 'bg-amber-600', text: 'text-white', badge: 'bg-amber-600/20 text-amber-300 border-amber-500/40', border: 'border-amber-600', glow: 'shadow-amber-600/30' },
  비행: { bg: 'bg-indigo-400', text: 'text-slate-900', badge: 'bg-indigo-400/20 text-indigo-300 border-indigo-300/40', border: 'border-indigo-400', glow: 'shadow-indigo-400/30' },
  에스퍼: { bg: 'bg-pink-500', text: 'text-white', badge: 'bg-pink-500/20 text-pink-300 border-pink-400/40', border: 'border-pink-500', glow: 'shadow-pink-500/30' },
  벌레: { bg: 'bg-lime-600', text: 'text-white', badge: 'bg-lime-600/20 text-lime-300 border-lime-500/40', border: 'border-lime-600', glow: 'shadow-lime-600/30' },
  바위: { bg: 'bg-stone-600', text: 'text-white', badge: 'bg-stone-600/20 text-stone-300 border-stone-500/40', border: 'border-stone-600', glow: 'shadow-stone-600/30' },
  고스트: { bg: 'bg-violet-800', text: 'text-white', badge: 'bg-violet-800/20 text-violet-300 border-violet-600/40', border: 'border-violet-800', glow: 'shadow-violet-800/30' },
  드래곤: { bg: 'bg-indigo-700', text: 'text-white', badge: 'bg-indigo-700/20 text-indigo-300 border-indigo-500/40', border: 'border-indigo-700', glow: 'shadow-indigo-700/30' },
  악: { bg: 'bg-neutral-800', text: 'text-white', badge: 'bg-neutral-800/30 text-neutral-300 border-neutral-600/40', border: 'border-neutral-700', glow: 'shadow-neutral-800/30' },
  강철: { bg: 'bg-slate-400', text: 'text-slate-900', badge: 'bg-slate-400/20 text-slate-300 border-slate-300/40', border: 'border-slate-400', glow: 'shadow-slate-400/30' },
  페어리: { bg: 'bg-pink-400', text: 'text-slate-900', badge: 'bg-pink-400/20 text-pink-300 border-pink-300/40', border: 'border-pink-400', glow: 'shadow-pink-400/30' },
};
