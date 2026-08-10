export type PokemonType =
  | '노말'
  | '불꽃'
  | '물'
  | '풀'
  | '전기'
  | '얼음'
  | '격투'
  | '독'
  | '땅'
  | '비행'
  | '에스퍼'
  | '벌레'
  | '바위'
  | '고스트'
  | '드래곤'
  | '악'
  | '강철'
  | '페어리';

export type MoveCategory = 'physical' | 'special' | 'status';

export type StatusCondition = 'none' | 'burn' | 'paralysis' | 'poison' | 'badPoison' | 'sleep' | 'freeze';

export interface Move {
  id: string;
  name: string;
  type: PokemonType;
  category: MoveCategory;
  power: number; // 0 for status moves
  accuracy: number; // 100, 90, 85 etc (101 for never miss)
  pp: number;
  maxPp: number;
  priority?: number; // default 0, +1 for Aqua Jet / Bullet Punch / Extreme Speed
  description: string;
  target?: 'enemy' | 'self';
  statChanges?: {
    stat: 'attack' | 'defense' | 'spAttack' | 'spDefense' | 'speed' | 'accuracy' | 'evasion';
    stages: number; // +1, +2, -1, etc.
    chance?: number; // 100 = 100%, 30 = 30%
    target?: 'enemy' | 'self';
  }[];
  statusEffect?: {
    status: StatusCondition;
    chance: number; // 0~100%
  };
  healRatio?: number; // e.g., 0.5 for recover (heals 50% max HP)
  drainRatio?: number; // e.g., 0.5 for Giga Drain
  recoilRatio?: number; // e.g., 0.33 for Flare Blitz / Brave Bird
  critBoost?: boolean; // high critical ratio
}

export interface BaseStats {
  hp: number;
  attack: number;
  defense: number;
  spAttack: number;
  spDefense: number;
  speed: number;
}

export interface StatStages {
  attack: number;
  defense: number;
  spAttack: number;
  spDefense: number;
  speed: number;
  accuracy: number;
  evasion: number;
}

export type HeldItemCategory =
  | 'defensive' // 방어/내구
  | 'offensive' // 화력/공격
  | 'choice' // 구애 시리즈
  | 'recovery' // 회복/열매
  | 'tactical'; // 전술/특수

export interface HeldItem {
  id: string;
  name: string;
  nameEn: string;
  icon: string;
  category: HeldItemCategory;
  description: string;
  triggerTiming: string; // e.g. "피격 시", "턴 종료 시", "공격 시", "상시"
  isConsumable: boolean; // whether it is consumed once in battle (e.g. Focus Sash, Berries, Weakness Policy)
  color: string; // Tailwind border/badge color
}

export interface PokemonData {
  id: string;
  dexNumber: number;
  name: string;
  nameEn: string;
  types: PokemonType[];
  baseStats: BaseStats;
  stats: BaseStats; // calculated Lv 50 stats
  moves: Move[];
  currentHp: number;
  ability: {
    name: string;
    description: string;
  };
  spriteFront: string;
  spriteBack: string;
  officialArtwork: string;
  status: StatusCondition;
  statusTurns: number;
  statStages: StatStages;
  item?: string;
  itemConsumed?: boolean; // True if consumable item was used in current battle
  choiceLockedMoveId?: string; // If holding Choice item, locks move until switched
  fainted?: boolean;
  isLegendary?: boolean;
}

export interface EliteFourMaster {
  id: string;
  stage: number;
  name: string;
  title: string;
  specialty: string;
  specialtyTypes: PokemonType[];
  avatar: string;
  themeColor: string;
  bgGradient: string;
  introQuote: string;
  defeatQuote: string;
  team: PokemonData[];
  badge: {
    name: string;
    icon: string;
    color: string;
  };
}

export type BattleActionType = 'move' | 'switch' | 'run';

export interface BattleLog {
  id: string;
  text: string;
  type: 'normal' | 'damage' | 'effective' | 'resist' | 'crit' | 'status' | 'faint' | 'switch' | 'heal' | 'stage';
  timestamp: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: number;
}
