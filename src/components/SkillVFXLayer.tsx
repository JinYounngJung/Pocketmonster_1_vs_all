import React, { useEffect, useState } from 'react';
import { PokemonType, MoveCategory } from '../types/pokemon';
import { TypeBadge } from './TypeBadge';
import { Sparkles, Flame, Droplets, Zap, Leaf, Snowflake, Swords, Skull, Mountain, Wind, Eye, Bug, Gem, Ghost, Sparkle, Shield, Moon, CircleDot } from 'lucide-react';

export interface ActiveSkillVFX {
  id: string;
  moveName: string;
  moveType: PokemonType;
  category: MoveCategory;
  power: number;
  attackerSide: 'player' | 'opponent';
}

interface SkillVFXLayerProps {
  vfx: ActiveSkillVFX | null;
}

export const SkillVFXLayer: React.FC<SkillVFXLayerProps> = ({ vfx }) => {
  const [phase, setPhase] = useState<'start' | 'flying' | 'impact' | 'end'>('start');

  useEffect(() => {
    if (!vfx) {
      setPhase('start');
      return;
    }

    setPhase('start');
    const t1 = setTimeout(() => setPhase('flying'), 100);
    const t2 = setTimeout(() => setPhase('impact'), 350);
    const t3 = setTimeout(() => setPhase('end'), 800);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [vfx]);

  if (!vfx) return null;

  const isPlayerAttacking = vfx.attackerSide === 'player';
  const moveType = vfx.moveType;
  const isStatus = vfx.category === 'status';

  // Coordinate setup:
  // Player is bottom-left (approx x: 25%, y: 75%)
  // Opponent is top-right (approx x: 75%, y: 25%)
  const attackerPos = isPlayerAttacking
    ? { x: '25%', y: '70%' }
    : { x: '75%', y: '25%' };
  const targetPos = isPlayerAttacking
    ? { x: '75%', y: '25%' }
    : { x: '25%', y: '70%' };

  // Category label and color
  const categoryLabel =
    vfx.category === 'physical'
      ? '물리'
      : vfx.category === 'special'
      ? '특수'
      : '변화';

  const categoryColor =
    vfx.category === 'physical'
      ? 'bg-orange-500 text-white'
      : vfx.category === 'special'
      ? 'bg-blue-500 text-white'
      : 'bg-emerald-500 text-white';

  return (
    <div
      id="skill-vfx-overlay"
      className="absolute inset-0 z-30 pointer-events-none overflow-hidden select-none"
    >
      {/* 1. TOP ARCADE SKILL BANNER */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 z-40 animate-slide-down">
        <div className="flex items-center gap-2 px-4 py-2 bg-slate-950/95 border-3 border-black shadow-[4px_4px_0px_#000] text-white">
          <TypeBadge type={vfx.moveType} size="sm" />
          <span className="font-black text-sm sm:text-base tracking-tight text-yellow-400 uppercase drop-shadow">
            {vfx.moveName}
          </span>
          <span
            className={`text-[10px] font-black px-1.5 py-0.5 border border-black uppercase shadow-[1px_1px_0px_#000] ${categoryColor}`}
          >
            {categoryLabel}
          </span>
          {vfx.power > 0 && (
            <span className="text-[11px] font-mono font-black text-slate-300">
              위력 {vfx.power}
            </span>
          )}
        </div>
      </div>

      {/* 2. ATTACKER CHARGING AURA */}
      {phase !== 'end' && (
        <div
          className="absolute transition-all duration-300 -translate-x-1/2 -translate-y-1/2"
          style={{ left: attackerPos.x, top: attackerPos.y }}
        >
          <div className="relative flex items-center justify-center">
            <div
              className={`w-28 h-28 rounded-full animate-ping opacity-75 blur-xs ${
                moveType === '불꽃'
                  ? 'bg-orange-500'
                  : moveType === '물'
                  ? 'bg-blue-500'
                  : moveType === '전기'
                  ? 'bg-yellow-400'
                  : moveType === '풀'
                  ? 'bg-green-500'
                  : moveType === '얼음'
                  ? 'bg-cyan-300'
                  : moveType === '격투'
                  ? 'bg-red-600'
                  : moveType === '독'
                  ? 'bg-purple-600'
                  : moveType === '땅'
                  ? 'bg-amber-700'
                  : moveType === '비행'
                  ? 'bg-indigo-300'
                  : moveType === '에스퍼'
                  ? 'bg-pink-500'
                  : moveType === '벌레'
                  ? 'bg-lime-500'
                  : moveType === '바위'
                  ? 'bg-yellow-700'
                  : moveType === '고스트'
                  ? 'bg-purple-900'
                  : moveType === '드래곤'
                  ? 'bg-indigo-600'
                  : moveType === '악'
                  ? 'bg-slate-900'
                  : moveType === '강철'
                  ? 'bg-slate-300'
                  : moveType === '페어리'
                  ? 'bg-pink-300'
                  : 'bg-white'
              }`}
            />
            {/* Energy Ring */}
            <div className="absolute w-20 h-20 rounded-full border-4 border-white/80 animate-spin" />
          </div>
        </div>
      )}

      {/* 3. PROJECTILE / FLYING STAGE (FOR ATTACKS) */}
      {!isStatus && phase === 'flying' && (
        <div
          className="absolute z-30 transition-all duration-200 -translate-x-1/2 -translate-y-1/2"
          style={{
            left: isPlayerAttacking ? '50%' : '50%',
            top: isPlayerAttacking ? '48%' : '48%',
          }}
        >
          {renderProjectile(moveType, isPlayerAttacking)}
        </div>
      )}

      {/* 4. IMPACT / HIT EXPLOSION STAGE ON TARGET */}
      {phase === 'impact' && (
        <div
          className="absolute z-40 -translate-x-1/2 -translate-y-1/2"
          style={{
            left: isStatus ? attackerPos.x : targetPos.x,
            top: isStatus ? attackerPos.y : targetPos.y,
          }}
        >
          {isStatus
            ? renderStatusEffect(vfx.moveName, moveType)
            : renderImpactEffect(moveType, vfx.power)}
        </div>
      )}
    </div>
  );
};

// Helper: Render traveling projectile across the arena
function renderProjectile(type: PokemonType, isPlayerAttacking: boolean) {
  const rotation = isPlayerAttacking ? 'rotate-[-35deg]' : 'rotate-[145deg]';

  switch (type) {
    case '불꽃':
      return (
        <div className={`flex items-center gap-1 ${rotation} scale-125 animate-pulse`}>
          <div className="w-12 h-12 bg-gradient-to-r from-yellow-300 via-orange-500 to-red-600 rounded-full blur-xs shadow-[0_0_20px_#f97316]" />
          <div className="w-8 h-4 bg-orange-400 rounded-full -ml-3 blur-xs" />
          <div className="w-4 h-2 bg-red-500 rounded-full -ml-2" />
        </div>
      );
    case '물':
      return (
        <div className={`flex items-center ${rotation} scale-125`}>
          <div className="w-14 h-14 bg-gradient-to-r from-cyan-300 via-blue-500 to-indigo-600 rounded-full border-2 border-white blur-xs shadow-[0_0_20px_#3b82f6] animate-spin" />
          <div className="w-6 h-6 bg-cyan-200 rounded-full -ml-2" />
        </div>
      );
    case '전기':
      return (
        <div className={`flex items-center ${rotation} scale-150`}>
          <Zap className="w-14 h-14 text-yellow-300 filter drop-shadow-[0_0_12px_#eab308] animate-bounce" />
          <div className="w-10 h-2 bg-yellow-100 rounded-full shadow-[0_0_10px_#fef08a]" />
        </div>
      );
    case '풀':
      return (
        <div className={`flex items-center gap-1 ${rotation} scale-125`}>
          <Leaf className="w-10 h-10 text-green-400 filter drop-shadow-[0_0_10px_#22c55e] animate-spin" />
          <Leaf className="w-8 h-8 text-emerald-300 filter drop-shadow-[0_0_8px_#10b981]" />
          <div className="w-6 h-3 bg-green-500 rounded-full" />
        </div>
      );
    case '얼음':
      return (
        <div className={`flex items-center gap-1 ${rotation} scale-125`}>
          <Snowflake className="w-12 h-12 text-cyan-200 filter drop-shadow-[0_0_15px_#06b6d4] animate-spin" />
          <div className="w-10 h-4 bg-cyan-100 border border-white rotate-45 shadow-[0_0_10px_#67e8f9]" />
        </div>
      );
    case '격투':
      return (
        <div className={`flex items-center ${rotation} scale-150`}>
          <div className="w-10 h-10 bg-red-600 rounded-full border-4 border-yellow-300 flex items-center justify-center font-black text-white text-xs shadow-[0_0_15px_#dc2626]">
            💥
          </div>
        </div>
      );
    case '고스트':
    case '악':
      return (
        <div className={`flex items-center ${rotation} scale-125`}>
          <div className="w-12 h-12 bg-purple-950 border-2 border-purple-400 rounded-full shadow-[0_0_20px_#9333ea] animate-ping" />
          <div className="w-8 h-8 bg-black rounded-full -ml-4" />
        </div>
      );
    case '드래곤':
      return (
        <div className={`flex items-center ${rotation} scale-150`}>
          <div className="w-16 h-12 bg-gradient-to-r from-cyan-400 via-indigo-600 to-purple-700 rounded-full shadow-[0_0_25px_#6366f1] flex items-center justify-center text-white font-black text-xs">
            🐉
          </div>
        </div>
      );
    case '에스퍼':
    case '페어리':
      return (
        <div className={`flex items-center ${rotation} scale-125`}>
          <Sparkles className="w-12 h-12 text-pink-300 filter drop-shadow-[0_0_15px_#f472b6] animate-spin" />
          <div className="w-10 h-10 bg-pink-400/80 rounded-full blur-xs" />
        </div>
      );
    default:
      return (
        <div className={`flex items-center ${rotation} scale-125`}>
          <div className="w-10 h-10 bg-white rounded-full border-2 border-yellow-400 shadow-[0_0_15px_#fff]" />
          <div className="w-8 h-3 bg-yellow-200 rounded-full -ml-2" />
        </div>
      );
  }
}

// Helper: Render explosive impact VFX on defender
function renderImpactEffect(type: PokemonType, power: number) {
  switch (type) {
    case '불꽃':
      return (
        <div className="relative flex items-center justify-center animate-shake">
          <div className="w-40 h-40 bg-gradient-to-r from-orange-500 via-red-600 to-yellow-400 rounded-full blur-md animate-ping opacity-90" />
          <div className="absolute w-28 h-28 bg-yellow-300 rounded-full blur-xs animate-scale-up" />
          <div className="absolute flex gap-2 font-black text-2xl text-yellow-300 animate-bounce">
            🔥 🔥 🔥
          </div>
          {/* Flame Embers */}
          <div className="absolute w-36 h-36 border-4 border-orange-500 rounded-full animate-spin" />
        </div>
      );
    case '물':
      return (
        <div className="relative flex items-center justify-center animate-shake">
          <div className="w-40 h-40 bg-blue-500 rounded-full blur-md animate-ping opacity-90" />
          <div className="absolute w-32 h-32 bg-cyan-300 rounded-full blur-xs" />
          <div className="absolute flex gap-2 font-black text-2xl text-cyan-200 animate-bounce">
            🌊 💦 🌊
          </div>
          {/* Splash Rings */}
          <div className="absolute w-40 h-40 border-4 border-cyan-300 rounded-full animate-scale-up" />
        </div>
      );
    case '전기':
      return (
        <div className="relative flex items-center justify-center animate-shake">
          <div className="w-40 h-40 bg-yellow-400 rounded-full blur-md animate-ping opacity-90" />
          <div className="absolute w-28 h-28 bg-white rounded-full blur-xs" />
          <Zap className="absolute w-24 h-24 text-yellow-300 animate-bounce filter drop-shadow-[0_0_20px_#facc15]" />
          <div className="absolute flex gap-3 font-black text-2xl text-yellow-200">
            ⚡ ⚡ ⚡
          </div>
        </div>
      );
    case '풀':
      return (
        <div className="relative flex items-center justify-center animate-shake">
          <div className="w-36 h-36 bg-green-500 rounded-full blur-md animate-ping opacity-90" />
          <div className="absolute w-24 h-24 bg-emerald-300 rounded-full blur-xs" />
          <div className="absolute flex gap-2 font-black text-2xl text-green-200 animate-spin">
            🍃 🌿 🍃
          </div>
          <div className="absolute w-32 h-32 border-4 border-green-300 rounded-full animate-scale-up" />
        </div>
      );
    case '얼음':
      return (
        <div className="relative flex items-center justify-center animate-shake">
          <div className="w-36 h-36 bg-cyan-400 rounded-full blur-md animate-ping opacity-90" />
          <Snowflake className="absolute w-24 h-24 text-white animate-spin filter drop-shadow-[0_0_20px_#a5f3fc]" />
          <div className="absolute flex gap-2 font-black text-2xl text-cyan-100">
            ❄️ 🧊 ❄️
          </div>
        </div>
      );
    case '격투':
      return (
        <div className="relative flex items-center justify-center animate-shake">
          <div className="w-36 h-36 bg-red-600 rounded-full blur-md animate-ping opacity-90" />
          <div className="absolute text-5xl font-black text-yellow-300 animate-scale-up drop-shadow-[4px_4px_0px_#000]">
            POW!
          </div>
          <div className="absolute w-28 h-28 border-4 border-red-500 rounded-full animate-spin" />
        </div>
      );
    case '땅':
    case '바위':
      return (
        <div className="relative flex items-center justify-center animate-shake">
          <div className="w-40 h-40 bg-amber-800 rounded-full blur-md animate-ping opacity-90" />
          <div className="absolute flex gap-2 font-black text-3xl text-amber-200 animate-bounce">
            🪨 💥 🪨
          </div>
          <div className="absolute w-36 h-36 border-4 border-amber-600 rounded-full animate-scale-up" />
        </div>
      );
    case '독':
      return (
        <div className="relative flex items-center justify-center animate-shake">
          <div className="w-36 h-36 bg-purple-700 rounded-full blur-md animate-ping opacity-90" />
          <div className="absolute flex gap-2 font-black text-2xl text-purple-200 animate-bounce">
            ☠️ 🧪 ☠️
          </div>
        </div>
      );
    case '비행':
      return (
        <div className="relative flex items-center justify-center animate-shake">
          <div className="w-36 h-36 bg-indigo-300 rounded-full blur-md animate-ping opacity-90" />
          <div className="absolute flex gap-2 font-black text-2xl text-white animate-spin">
            🌪️ 🪶 🌪️
          </div>
        </div>
      );
    case '에스퍼':
      return (
        <div className="relative flex items-center justify-center animate-shake">
          <div className="w-36 h-36 bg-pink-500 rounded-full blur-md animate-ping opacity-90" />
          <div className="absolute w-24 h-24 rounded-full border-4 border-pink-200 animate-spin" />
          <div className="absolute flex gap-2 font-black text-2xl text-pink-200 animate-pulse">
            🔮 ✨ 🔮
          </div>
        </div>
      );
    case '벌레':
      return (
        <div className="relative flex items-center justify-center animate-shake">
          <div className="w-36 h-36 bg-lime-500 rounded-full blur-md animate-ping opacity-90" />
          <div className="absolute text-4xl font-black text-lime-200 animate-scale-up">
            ⚔️ 🦗 ⚔️
          </div>
        </div>
      );
    case '고스트':
    case '악':
      return (
        <div className="relative flex items-center justify-center animate-shake">
          <div className="w-40 h-40 bg-purple-950 rounded-full blur-md animate-ping opacity-95" />
          <div className="absolute flex gap-2 font-black text-3xl text-purple-300 animate-pulse">
            👻 😈 👻
          </div>
        </div>
      );
    case '드래곤':
      return (
        <div className="relative flex items-center justify-center animate-shake">
          <div className="w-44 h-44 bg-indigo-700 rounded-full blur-md animate-ping opacity-95" />
          <div className="absolute flex gap-2 font-black text-3xl text-cyan-300 animate-bounce">
            🐉 ☄️ 🐉
          </div>
          <div className="absolute w-36 h-36 border-4 border-cyan-400 rounded-full animate-spin" />
        </div>
      );
    case '강철':
      return (
        <div className="relative flex items-center justify-center animate-shake">
          <div className="w-36 h-36 bg-slate-300 rounded-full blur-md animate-ping opacity-90" />
          <div className="absolute flex gap-2 font-black text-3xl text-white animate-scale-up">
            ⚔️ 🛡️ ⚔️
          </div>
        </div>
      );
    case '페어리':
      return (
        <div className="relative flex items-center justify-center animate-shake">
          <div className="w-36 h-36 bg-pink-300 rounded-full blur-md animate-ping opacity-90" />
          <Sparkles className="absolute w-20 h-20 text-pink-400 animate-spin" />
          <div className="absolute flex gap-2 font-black text-2xl text-pink-100">
            💖 ✨ 💖
          </div>
        </div>
      );
    default:
      return (
        <div className="relative flex items-center justify-center animate-shake">
          <div className="w-36 h-36 bg-yellow-300 rounded-full blur-md animate-ping opacity-90" />
          <div className="absolute text-4xl font-black text-white drop-shadow-[2px_2px_0px_#000]">
            💥 💥 💥
          </div>
        </div>
      );
  }
}

// Helper: Render Status / Buff / Recovery / Debuff animations
function renderStatusEffect(moveName: string, type: PokemonType) {
  const isHeal =
    moveName.includes('회복') ||
    moveName.includes('쉬기') ||
    moveName.includes('태만함') ||
    moveName.includes('드레인');

  if (isHeal) {
    return (
      <div className="relative flex flex-col items-center justify-center animate-slide-up">
        <div className="w-28 h-28 bg-green-400/40 rounded-full blur-xs animate-pulse" />
        <div className="absolute flex flex-col items-center gap-1 font-black text-green-300 text-lg">
          <span className="text-3xl animate-bounce">💚</span>
          <span className="bg-slate-900 px-2 py-0.5 border border-black text-xs text-green-400 font-bold shadow-[2px_2px_0px_#000]">
            HP 회복
          </span>
        </div>
      </div>
    );
  }

  // Stat Buff (Swords Dance, Dragon Dance, Calm Mind, Nasty Plot, etc.)
  return (
    <div className="relative flex flex-col items-center justify-center animate-slide-up">
      {/* Upward Energy Pillar */}
      <div className="w-24 h-40 bg-gradient-to-t from-yellow-400/60 via-red-500/60 to-transparent rounded-full blur-xs animate-pulse" />
      <div className="absolute flex flex-col items-center gap-1 font-black text-yellow-300">
        <span className="text-3xl animate-bounce">⚔️ 🔺 🔺</span>
        <span className="bg-slate-900 px-2 py-0.5 border border-black text-xs text-yellow-400 font-bold shadow-[2px_2px_0px_#000]">
          능력치 상승!
        </span>
      </div>
    </div>
  );
}
