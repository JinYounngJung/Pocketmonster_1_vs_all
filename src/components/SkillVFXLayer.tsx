import React, { useEffect, useState } from 'react';
import { PokemonType, MoveCategory } from '../types/pokemon';
import { TypeBadge } from './TypeBadge';
import {
  Sparkles,
  Flame,
  Droplets,
  Zap,
  Leaf,
  Snowflake,
  Swords,
  Skull,
  Mountain,
  Wind,
  Eye,
  Bug,
  Gem,
  Ghost,
  Shield,
  Moon,
  Sun,
  Crosshair,
  Star,
  Activity,
  Heart,
  Radio,
  Clock,
  Compass,
} from 'lucide-react';

export interface ActiveSkillVFX {
  id: string;
  moveId?: string;
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
    const t1 = setTimeout(() => setPhase('flying'), 120);
    const t2 = setTimeout(() => setPhase('impact'), 380);
    const t3 = setTimeout(() => setPhase('end'), 860);

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
  const moveId = vfx.moveId || '';
  const moveName = vfx.moveName;

  // Positions on screen:
  // Player is bottom-left (x: 25%, y: 72%)
  // Opponent is top-right (x: 75%, y: 28%)
  const attackerPos = isPlayerAttacking
    ? { x: '25%', y: '72%' }
    : { x: '75%', y: '28%' };
  const targetPos = isPlayerAttacking
    ? { x: '75%', y: '28%' }
    : { x: '25%', y: '72%' };

  // Midpoint between attacker and target for flying projectile
  const midPos = { x: '50%', y: '50%' };

  // Category badge info
  const categoryLabel =
    vfx.category === 'physical'
      ? '물리'
      : vfx.category === 'special'
      ? '특수'
      : '변화';

  const categoryColor =
    vfx.category === 'physical'
      ? 'bg-orange-600 text-white'
      : vfx.category === 'special'
      ? 'bg-blue-600 text-white'
      : 'bg-emerald-600 text-white';

  return (
    <div
      id="skill-vfx-overlay"
      className="absolute inset-0 z-30 pointer-events-none overflow-hidden select-none"
    >
      {/* 1. TOP ARCADE SKILL BANNER WITH RETRO FLAIR */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 z-50 animate-slide-down">
        <div className="flex items-center gap-2 px-4 py-2 bg-slate-950/95 border-3 border-black shadow-[4px_4px_0px_#000] text-white backdrop-blur-xs">
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

      {/* 2. ATTACKER CHARGING AURA (START / FLYING PHASES) */}
      {phase !== 'end' && (
        <div
          className="absolute transition-all duration-300 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-30"
          style={{ left: attackerPos.x, top: attackerPos.y }}
        >
          {renderAttackerAura(moveType, moveId, moveName, isStatus)}
        </div>
      )}

      {/* 3. TRAVELING PROJECTILE / SPECIAL TRAIL PHASE */}
      {!isStatus && phase === 'flying' && (
        <div
          className="absolute z-35 transition-all duration-200 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
          style={{ left: midPos.x, top: midPos.y }}
        >
          {renderSkillProjectile(moveId, moveName, moveType, isPlayerAttacking)}
        </div>
      )}

      {/* 4. IMPACT / HIT EXPLOSION ON TARGET OR BUFF ON SELF */}
      {phase === 'impact' && (
        <div
          className="absolute z-40 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
          style={{
            left: isStatus ? attackerPos.x : targetPos.x,
            top: isStatus ? attackerPos.y : targetPos.y,
          }}
        >
          {isStatus
            ? renderCustomStatusEffect(moveId, moveName, moveType)
            : renderCustomSkillImpact(moveId, moveName, moveType, vfx.power, isPlayerAttacking)}
        </div>
      )}
    </div>
  );
};

// =========================================================================
// ATTACKER CHARGING AURA (발동시 시전자 기 모으기 / 오라 모션)
// =========================================================================
function renderAttackerAura(type: PokemonType, moveId: string, moveName: string, isStatus: boolean) {
  if (moveId === 'fire_blast' || moveName === '불대문자') {
    return (
      <div className="relative flex items-center justify-center">
        <div className="w-28 h-28 bg-orange-600 rounded-full animate-ping opacity-75 blur-xs" />
        <div className="absolute font-black text-2xl text-yellow-300 animate-pulse">大</div>
      </div>
    );
  }

  if (moveId === 'dark_ball' || moveName === '다크볼') {
    return (
      <div className="relative flex items-center justify-center">
        <div className="w-32 h-32 bg-purple-950 rounded-full animate-ping opacity-90 blur-xs border-2 border-purple-500" />
        <div className="absolute w-20 h-20 bg-black rounded-full shadow-[0_0_30px_#9333ea] animate-spin border border-purple-300" />
        <div className="absolute text-2xl animate-pulse">🔮 ⚡</div>
      </div>
    );
  }

  if (moveId === 'dark_void' || moveName === '다크홀') {
    return (
      <div className="relative flex items-center justify-center">
        <div className="w-36 h-36 bg-black rounded-full animate-dark-void opacity-95 blur-xs border-2 border-purple-700" />
        <div className="absolute text-2xl animate-bounce">🌑 💤</div>
      </div>
    );
  }

  if (moveId === 'gigaton_hammer' || moveName === '거대해머') {
    return (
      <div className="relative flex items-center justify-center">
        <div className="w-32 h-32 bg-pink-500 rounded-full animate-ping opacity-80 blur-xs" />
        <div className="absolute text-3xl font-black animate-bounce">🔨 100t</div>
      </div>
    );
  }

  if (moveId === 'blood_moon' || moveName === '블러드문') {
    return (
      <div className="relative flex items-center justify-center">
        <div className="w-32 h-32 bg-red-900 rounded-full animate-pulse blur-xs shadow-[0_0_30px_#dc2626]" />
        <div className="absolute text-3xl animate-spin">🩸 🌕</div>
      </div>
    );
  }

  if (moveId === 'draco_meteor' || moveName === '용성군') {
    return (
      <div className="relative flex items-center justify-center">
        <div className="w-32 h-32 bg-gradient-to-r from-orange-500 via-indigo-600 to-purple-600 rounded-full animate-pulse blur-xs" />
        <div className="absolute text-2xl animate-bounce">☄️</div>
      </div>
    );
  }

  if (moveId === 'moonblast' || moveName === '문포스') {
    return (
      <div className="relative flex items-center justify-center">
        <div className="w-32 h-32 bg-pink-400 rounded-full animate-pulse blur-sm opacity-80" />
        <Moon className="absolute w-12 h-12 text-pink-100 animate-spin" />
      </div>
    );
  }

  const typeColorMap: Record<PokemonType, string> = {
    불꽃: 'bg-orange-500 shadow-[0_0_25px_#f97316]',
    물: 'bg-blue-500 shadow-[0_0_25px_#3b82f6]',
    전기: 'bg-yellow-400 shadow-[0_0_25px_#eab308]',
    풀: 'bg-green-500 shadow-[0_0_25px_#22c55e]',
    얼음: 'bg-cyan-300 shadow-[0_0_25px_#06b6d4]',
    격투: 'bg-red-600 shadow-[0_0_25px_#dc2626]',
    독: 'bg-purple-600 shadow-[0_0_25px_#9333ea]',
    땅: 'bg-amber-700 shadow-[0_0_25px_#b45309]',
    비행: 'bg-indigo-300 shadow-[0_0_25px_#818cf8]',
    에스퍼: 'bg-pink-500 shadow-[0_0_25px_#ec4899]',
    벌레: 'bg-lime-500 shadow-[0_0_25px_#84cc16]',
    바위: 'bg-yellow-700 shadow-[0_0_25px_#a16207]',
    고스트: 'bg-purple-950 shadow-[0_0_25px_#581c87]',
    드래곤: 'bg-indigo-700 shadow-[0_0_25px_#4338ca]',
    악: 'bg-slate-900 shadow-[0_0_25px_#0f172a]',
    강철: 'bg-slate-300 shadow-[0_0_25px_#cbd5e1]',
    페어리: 'bg-pink-300 shadow-[0_0_25px_#f472b6]',
    노말: 'bg-slate-200 shadow-[0_0_20px_#ffffff]',
  };

  return (
    <div className="relative flex items-center justify-center">
      <div className={`w-28 h-28 rounded-full animate-ping opacity-70 blur-xs ${typeColorMap[type] || 'bg-white'}`} />
      <div className="absolute w-20 h-20 rounded-full border-4 border-white/80 animate-spin" />
    </div>
  );
}

// =========================================================================
// TRAVELING SKILL PROJECTILES (스킬별 투사체 / 전진 모션)
// =========================================================================
function renderSkillProjectile(
  moveId: string,
  moveName: string,
  type: PokemonType,
  isPlayerAttacking: boolean
) {
  const rotation = isPlayerAttacking ? 'rotate-[-35deg]' : 'rotate-[145deg]';

  // 1. 다크볼 (Dark Ball) - Darkrai's sinister dark sphere
  if (moveId === 'dark_ball' || moveName === '다크볼') {
    return (
      <div className={`flex items-center ${rotation} scale-150`}>
        <div className="relative flex items-center justify-center">
          <div className="w-16 h-16 bg-gradient-to-r from-black via-purple-950 to-indigo-950 rounded-full border-3 border-purple-500 shadow-[0_0_35px_#9333ea] animate-spin flex items-center justify-center">
            <div className="w-8 h-8 bg-purple-600 rounded-full animate-ping" />
          </div>
          <div className="absolute text-purple-300 text-xs font-black animate-pulse">DARK</div>
        </div>
      </div>
    );
  }

  // 2. 다크홀 (Dark Void) - Expanding dark void hole
  if (moveId === 'dark_void' || moveName === '다크홀') {
    return (
      <div className={`flex items-center ${rotation} scale-150`}>
        <div className="w-16 h-16 bg-black border-4 border-purple-700 rounded-full shadow-[0_0_40px_#581c87] animate-spin flex items-center justify-center">
          <Moon className="w-8 h-8 text-purple-400 animate-pulse" />
        </div>
      </div>
    );
  }

  // 3. 거대해머 (Gigaton Hammer) - Flying 100t warhammer
  if (moveId === 'gigaton_hammer' || moveName === '거대해머') {
    return (
      <div className={`flex items-center ${rotation} scale-150 animate-bounce`}>
        <div className="w-16 h-16 bg-gradient-to-tr from-pink-400 via-slate-300 to-pink-600 border-3 border-black rounded-lg shadow-[0_0_25px_#f43f5e] flex items-center justify-center font-black text-xs text-black">
          🔨100t
        </div>
      </div>
    );
  }

  // 4. 골드러시 (Make It Rain) - Flow of gold coins
  if (moveId === 'make_it_rain' || moveName === '골드러시') {
    return (
      <div className={`flex items-center gap-1 ${rotation} scale-150 animate-bounce`}>
        <div className="w-12 h-12 bg-yellow-400 border-2 border-yellow-600 rounded-full shadow-[0_0_20px_#fbbf24] flex items-center justify-center font-black text-black">
          💰
        </div>
        <div className="w-8 h-8 bg-yellow-300 border-2 border-yellow-500 rounded-full -ml-3 shadow-[0_0_15px_#fde047] flex items-center justify-center text-xs">
          🪙
        </div>
      </div>
    );
  }

  // 5. 블러드문 (Blood Moon) - Crimson moon orb
  if (moveId === 'blood_moon' || moveName === '블러드문') {
    return (
      <div className={`flex items-center ${rotation} scale-150`}>
        <div className="w-16 h-16 bg-gradient-to-r from-red-950 via-red-600 to-red-900 rounded-full border-2 border-red-400 shadow-[0_0_35px_#dc2626] animate-pulse flex items-center justify-center">
          <Moon className="w-8 h-8 text-red-200 animate-spin" />
        </div>
      </div>
    );
  }

  // 6. 분노의주먹 (Rage Fist) - Spectral purple flaming fist
  if (moveId === 'rage_fist' || moveName === '분노의주먹') {
    return (
      <div className={`flex items-center ${rotation} scale-150 animate-pulse`}>
        <div className="w-14 h-14 bg-gradient-to-r from-purple-900 via-red-600 to-purple-700 rounded-full border-2 border-purple-300 shadow-[0_0_25px_#a855f7] flex items-center justify-center font-black text-xl text-white">
          👊
        </div>
      </div>
    );
  }

  // 7. 트릭플라워 (Flower Trick) - Magician flower bouquet bomb
  if (moveId === 'flower_trick' || moveName === '트릭플라워') {
    return (
      <div className={`flex items-center ${rotation} scale-150 animate-bounce`}>
        <div className="w-14 h-14 bg-emerald-600 border-2 border-pink-400 rounded-lg shadow-[0_0_25px_#22c55e] flex items-center justify-center text-xl">
          🎁🌸
        </div>
      </div>
    );
  }

  // 8. 플레어송 (Torch Song) - Flaming bird note
  if (moveId === 'torch_song' || moveName === '플레어송') {
    return (
      <div className={`flex items-center ${rotation} scale-150 animate-pulse`}>
        <div className="w-14 h-14 bg-orange-600 border-2 border-yellow-300 rounded-full shadow-[0_0_25px_#ea580c] flex items-center justify-center text-xl">
          🐦🔥
        </div>
      </div>
    );
  }

  // 9. 화염볼 (Pyro Ball) - Flaming soccer ball
  if (moveId === 'pyro_ball' || moveName === '화염볼') {
    return (
      <div className={`flex items-center ${rotation} scale-150 animate-spin`}>
        <div className="w-14 h-14 bg-gradient-to-r from-yellow-300 via-orange-500 to-red-600 rounded-full border-2 border-white shadow-[0_0_25px_#f97316] flex items-center justify-center text-xl">
          ⚽🔥
        </div>
      </div>
    );
  }

  // 10. 블라스트번 / 하이드로캐논 (Blast Burn / Hydro Cannon)
  if (moveId === 'blast_burn' || moveName === '블라스트번') {
    return (
      <div className={`flex items-center gap-1 ${rotation} scale-160 animate-pulse`}>
        <div className="w-16 h-16 bg-gradient-to-r from-yellow-300 via-orange-600 to-red-700 rounded-full blur-xs animate-spin shadow-[0_0_35px_#ea580c]" />
      </div>
    );
  }

  if (moveId === 'hydro_cannon' || moveName === '하이드로캐논') {
    return (
      <div className={`flex items-center gap-1 ${rotation} scale-160`}>
        <div className="w-16 h-12 bg-gradient-to-r from-cyan-300 via-blue-600 to-indigo-800 rounded-full border-2 border-white shadow-[0_0_35px_#2563eb]" />
      </div>
    );
  }

  // 11. 불대문자 (Fire Blast) - Flying '大' Kanji in flames
  if (moveId === 'fire_blast' || moveName === '불대문자') {
    return (
      <div className={`flex flex-col items-center justify-center ${rotation} scale-150 animate-pulse`}>
        <div className="relative flex items-center justify-center">
          <div className="w-16 h-16 bg-gradient-to-r from-yellow-300 via-orange-500 to-red-600 rounded-full blur-xs animate-spin shadow-[0_0_25px_#f97316]" />
          <span className="absolute font-black text-3xl text-yellow-200 drop-shadow-[2px_2px_0px_#000]">
            大
          </span>
        </div>
      </div>
    );
  }

  // 12. 화염방사 (Flamethrower) - Swirling continuous flame stream
  if (moveId === 'flamethrower' || moveName === '화염방사') {
    return (
      <div className={`flex items-center gap-1 ${rotation} scale-150`}>
        <div className="w-14 h-14 bg-gradient-to-r from-yellow-300 via-orange-500 to-red-600 rounded-full blur-xs animate-pulse shadow-[0_0_25px_#f97316]" />
        <div className="w-10 h-8 bg-orange-400 rounded-full -ml-3 blur-xs animate-ping" />
        <div className="w-6 h-4 bg-red-500 rounded-full -ml-2" />
        <Flame className="w-8 h-8 text-yellow-200 -ml-8 animate-bounce" />
      </div>
    );
  }

  // 13. 하이드로펌프 (Hydro Pump) - Dual spiraling high pressure water cannon
  if (moveId === 'hydro_pump' || moveName === '하이드로펌프') {
    return (
      <div className={`flex flex-col items-center gap-1 ${rotation} scale-150`}>
        <div className="flex items-center gap-1">
          <div className="w-16 h-8 bg-gradient-to-r from-cyan-300 via-blue-500 to-indigo-600 rounded-full border-2 border-white blur-xs shadow-[0_0_25px_#3b82f6]" />
          <div className="w-8 h-8 bg-cyan-200 rounded-full -ml-2 animate-ping" />
        </div>
        <div className="flex items-center gap-1 -mt-2">
          <div className="w-14 h-6 bg-gradient-to-r from-cyan-200 via-blue-400 to-indigo-500 rounded-full border border-white blur-xs" />
        </div>
      </div>
    );
  }

  // 14. 10만볼트 / 번개 (Thunderbolt / Thunder) - Lightning zigzag projectile
  if (moveId === 'thunderbolt' || moveName === '10만볼트' || moveId === 'thunder' || moveName === '번개') {
    return (
      <div className={`flex items-center ${rotation} scale-150 animate-bounce`}>
        <Zap className="w-16 h-16 text-yellow-300 filter drop-shadow-[0_0_20px_#fde047]" />
        <div className="w-12 h-3 bg-white rounded-full -ml-4 shadow-[0_0_15px_#fef08a]" />
      </div>
    );
  }

  // 15. 냉동빔 (Ice Beam) - Double helix frost laser beam
  if (moveId === 'ice_beam' || moveName === '냉동빔') {
    return (
      <div className={`flex items-center gap-1 ${rotation} scale-140`}>
        <div className="w-16 h-8 bg-gradient-to-r from-white via-cyan-300 to-blue-500 rounded-full border border-white shadow-[0_0_25px_#38bdf8] flex items-center justify-center">
          <Snowflake className="w-6 h-6 text-white animate-spin" />
        </div>
        <div className="w-8 h-4 bg-cyan-100 rounded-full -ml-2" />
      </div>
    );
  }

  // 16. 에너지볼 / 파동탄 / 섀도볼 (Energy Ball / Aura Sphere / Shadow Ball)
  if (moveId === 'energy_ball' || moveName === '에너지볼') {
    return (
      <div className={`flex items-center ${rotation} scale-140`}>
        <div className="w-14 h-14 bg-gradient-to-r from-lime-300 via-green-500 to-emerald-700 rounded-full border-2 border-white shadow-[0_0_25px_#22c55e] animate-spin flex items-center justify-center">
          <Leaf className="w-6 h-6 text-white" />
        </div>
      </div>
    );
  }

  if (moveId === 'aura_sphere' || moveName === '파동탄') {
    return (
      <div className={`flex items-center ${rotation} scale-140`}>
        <div className="w-14 h-14 bg-gradient-to-r from-cyan-300 via-blue-500 to-indigo-600 rounded-full border-3 border-cyan-100 shadow-[0_0_30px_#06b6d4] animate-spin flex items-center justify-center">
          <div className="w-6 h-6 bg-white rounded-full animate-ping" />
        </div>
      </div>
    );
  }

  if (moveId === 'shadow_ball' || moveName === '섀도볼') {
    return (
      <div className={`flex items-center ${rotation} scale-140`}>
        <div className="w-14 h-14 bg-gradient-to-r from-purple-900 via-purple-950 to-black rounded-full border-2 border-purple-400 shadow-[0_0_30px_#9333ea] animate-pulse flex items-center justify-center">
          <Ghost className="w-6 h-6 text-purple-300 animate-bounce" />
        </div>
      </div>
    );
  }

  // 17. 문포스 (Moonblast) - Radiant lunar orb
  if (moveId === 'moonblast' || moveName === '문포스') {
    return (
      <div className={`flex items-center ${rotation} scale-150`}>
        <div className="w-16 h-16 bg-gradient-to-r from-pink-200 via-pink-400 to-purple-500 rounded-full border-2 border-white shadow-[0_0_30px_#f472b6] flex items-center justify-center animate-spin">
          <Moon className="w-8 h-8 text-white" />
        </div>
      </div>
    );
  }

  // 18. 용성군 (Draco Meteor) - Ascending dragon flare
  if (moveId === 'draco_meteor' || moveName === '용성군') {
    return (
      <div className="flex flex-col items-center animate-slide-up scale-150">
        <div className="w-14 h-14 bg-gradient-to-t from-orange-600 via-indigo-600 to-purple-600 rounded-full shadow-[0_0_30px_#6366f1] flex items-center justify-center text-white font-black text-sm">
          ☄️
        </div>
      </div>
    );
  }

  // Generic Type-Based Projectiles
  switch (type) {
    case '불꽃':
      return (
        <div className={`flex items-center gap-1 ${rotation} scale-125 animate-pulse`}>
          <div className="w-12 h-12 bg-gradient-to-r from-yellow-300 via-orange-500 to-red-600 rounded-full blur-xs shadow-[0_0_20px_#f97316]" />
          <div className="w-8 h-4 bg-orange-400 rounded-full -ml-3 blur-xs" />
        </div>
      );
    case '물':
      return (
        <div className={`flex items-center ${rotation} scale-125`}>
          <div className="w-14 h-14 bg-gradient-to-r from-cyan-300 via-blue-500 to-indigo-600 rounded-full border-2 border-white blur-xs shadow-[0_0_20px_#3b82f6] animate-spin" />
        </div>
      );
    case '전기':
      return (
        <div className={`flex items-center ${rotation} scale-150`}>
          <Zap className="w-14 h-14 text-yellow-300 filter drop-shadow-[0_0_12px_#eab308] animate-bounce" />
        </div>
      );
    case '풀':
      return (
        <div className={`flex items-center gap-1 ${rotation} scale-125`}>
          <Leaf className="w-10 h-10 text-green-400 filter drop-shadow-[0_0_10px_#22c55e] animate-spin" />
          <Leaf className="w-8 h-8 text-emerald-300 filter drop-shadow-[0_0_8px_#10b981]" />
        </div>
      );
    case '얼음':
      return (
        <div className={`flex items-center gap-1 ${rotation} scale-125`}>
          <Snowflake className="w-12 h-12 text-cyan-200 filter drop-shadow-[0_0_15px_#06b6d4] animate-spin" />
        </div>
      );
    case '격투':
      return (
        <div className={`flex items-center ${rotation} scale-150`}>
          <div className="w-12 h-12 bg-red-600 rounded-full border-4 border-yellow-300 flex items-center justify-center font-black text-white text-base shadow-[0_0_20px_#dc2626]">
            💥
          </div>
        </div>
      );
    case '고스트':
    case '악':
      return (
        <div className={`flex items-center ${rotation} scale-125`}>
          <div className="w-12 h-12 bg-purple-950 border-2 border-purple-400 rounded-full shadow-[0_0_20px_#9333ea] animate-ping" />
        </div>
      );
    case '드래곤':
      return (
        <div className={`flex items-center ${rotation} scale-150`}>
          <div className="w-16 h-12 bg-gradient-to-r from-cyan-400 via-indigo-600 to-purple-700 rounded-full shadow-[0_0_25px_#6366f1] flex items-center justify-center text-white font-black text-sm">
            🐉
          </div>
        </div>
      );
    case '에스퍼':
    case '페어리':
      return (
        <div className={`flex items-center ${rotation} scale-125`}>
          <Sparkles className="w-12 h-12 text-pink-300 filter drop-shadow-[0_0_15px_#f472b6] animate-spin" />
        </div>
      );
    default:
      return (
        <div className={`flex items-center ${rotation} scale-125`}>
          <div className="w-12 h-12 bg-white rounded-full border-3 border-yellow-400 shadow-[0_0_15px_#fff] animate-ping" />
        </div>
      );
  }
}

// =========================================================================
// CUSTOM SKILL IMPACT ANIMATIONS ON DEFENDER (나무위키 기반 타격 모션 & 이펙트)
// =========================================================================
function renderCustomSkillImpact(
  moveId: string,
  moveName: string,
  type: PokemonType,
  power: number,
  isPlayerAttacking: boolean
) {
  // 1. 다크볼 (Dark Ball) - Darkrai's signature dark matter blast
  if (moveId === 'dark_ball' || moveName === '다크볼') {
    return (
      <div className="relative flex flex-col items-center justify-center animate-shake-heavy">
        <div className="w-52 h-52 bg-purple-950 rounded-full blur-xl animate-ping opacity-95" />
        <div className="w-40 h-40 bg-black rounded-full border-4 border-purple-500 shadow-[0_0_50px_#9333ea] animate-dark-ball flex items-center justify-center">
          <div className="w-24 h-24 bg-purple-700 rounded-full blur-md animate-ping" />
        </div>
        <div className="absolute text-5xl font-black text-purple-300 drop-shadow-[3px_3px_0px_#000] animate-bounce">
          🔮 🌑 💥
        </div>
        <div className="absolute font-black text-2xl text-purple-200 bg-black/90 px-3 py-1 border-2 border-purple-400 mt-28 shadow-[0_0_20px_#a855f7]">
          DARK BALL! (특방 저하!)
        </div>
      </div>
    );
  }

  // 2. 다크홀 (Dark Void) - Nightmare abyss engulfment
  if (moveId === 'dark_void' || moveName === '다크홀') {
    return (
      <div className="relative flex flex-col items-center justify-center animate-shake-heavy">
        <div className="w-60 h-60 bg-black rounded-full border-8 border-purple-900 shadow-[0_0_60px_#581c87] animate-dark-void flex items-center justify-center">
          <Moon className="w-28 h-28 text-purple-400 animate-spin" />
        </div>
        <div className="absolute flex gap-3 text-4xl animate-bounce">
          🌑 💤 😈
        </div>
        <div className="absolute font-black text-3xl text-purple-300 bg-black/95 px-4 py-2 border-3 border-purple-500 mt-32 shadow-[0_0_25px_#7e22ce]">
          DARK VOID (악몽의 잠)
        </div>
      </div>
    );
  }

  // 3. 거대해머 (Gigaton Hammer) - Tinkaton's 100t hammer smash
  if (moveId === 'gigaton_hammer' || moveName === '거대해머') {
    return (
      <div className="relative flex flex-col items-center justify-center animate-hammer-smash">
        <div className="w-56 h-56 bg-pink-600/70 rounded-full blur-xl animate-ping" />
        <div className="w-48 h-48 bg-gradient-to-tr from-pink-400 via-slate-200 to-pink-700 border-4 border-black rounded-2xl shadow-[0_0_40px_#f43f5e] flex items-center justify-center font-black text-black text-4xl">
          🔨 100t
        </div>
        <div className="absolute font-black text-4xl text-yellow-300 bg-black px-4 py-1 border-4 border-pink-500 mt-36 uppercase shadow-[4px_4px_0px_#000]">
          GIGATON SMASH!
        </div>
      </div>
    );
  }

  // 4. 골드러시 (Make It Rain) - Gholdengo gold shower
  if (moveId === 'make_it_rain' || moveName === '골드러시') {
    return (
      <div className="relative flex flex-col items-center justify-center animate-gold-shower">
        <div className="w-56 h-56 bg-yellow-300/80 rounded-full blur-xl animate-ping" />
        <div className="absolute flex gap-4 text-5xl animate-bounce">
          💰 🪙 🏆 🪙 💰
        </div>
        <div className="font-black text-3xl text-yellow-950 bg-yellow-400 px-4 py-2 border-4 border-black shadow-[4px_4px_0px_#000] uppercase mt-20">
          MAKE IT RAIN!
        </div>
      </div>
    );
  }

  // 5. 블러드문 (Blood Moon) - Ursaluna crimson lunar laser
  if (moveId === 'blood_moon' || moveName === '블러드문') {
    return (
      <div className="relative flex flex-col items-center justify-center animate-crimson-moon">
        <div className="w-56 h-56 bg-red-950 rounded-full blur-xl animate-ping opacity-95" />
        <div className="w-44 h-44 bg-gradient-to-tr from-red-950 via-red-600 to-red-400 rounded-full border-4 border-red-300 shadow-[0_0_50px_#ef4444] flex items-center justify-center">
          <Moon className="w-28 h-28 text-red-100 animate-spin" />
        </div>
        <div className="absolute font-black text-3xl text-red-100 bg-red-950 px-4 py-2 border-3 border-red-500 mt-32 shadow-[0_0_30px_#dc2626]">
          BLOOD MOON!
        </div>
      </div>
    );
  }

  // 6. 분노의주먹 (Rage Fist) - Annihilape phantom fury
  if (moveId === 'rage_fist' || moveName === '분노의주먹') {
    return (
      <div className="relative flex flex-col items-center justify-center animate-rage-fist">
        <div className="w-52 h-52 bg-purple-900 rounded-full blur-xl animate-ping" />
        <div className="absolute flex gap-3 text-5xl animate-bounce">
          👊 💥 💢 💥 👊
        </div>
        <div className="font-black text-3xl text-white bg-purple-950 px-4 py-2 border-3 border-purple-400 uppercase mt-20 shadow-[4px_4px_0px_#000]">
          RAGE FIST!
        </div>
      </div>
    );
  }

  // 7. 트릭플라워 (Flower Trick) - Meowscarada trick bomb
  if (moveId === 'flower_trick' || moveName === '트릭플라워') {
    return (
      <div className="relative flex flex-col items-center justify-center animate-flower-burst">
        <div className="w-48 h-48 bg-emerald-400/80 rounded-full blur-lg animate-ping" />
        <div className="absolute flex gap-3 text-4xl animate-bounce">
          🌸 🌺 🎁 🌺 🌸
        </div>
        <div className="font-black text-2xl text-emerald-950 bg-pink-300 px-4 py-2 border-3 border-black uppercase mt-16 shadow-[4px_4px_0px_#000]">
          CRITICAL TRICK!
        </div>
      </div>
    );
  }

  // 8. 플레어송 (Torch Song) - Skeledirge fire bird song
  if (moveId === 'torch_song' || moveName === '플레어송') {
    return (
      <div className="relative flex flex-col items-center justify-center animate-shake-heavy">
        <div className="w-52 h-52 bg-orange-600 rounded-full blur-lg animate-ping" />
        <div className="absolute flex gap-3 text-4xl animate-bounce">
          🔥 🐦 🎶 🔥
        </div>
        <div className="font-black text-2xl text-yellow-300 bg-slate-950 px-4 py-2 border-3 border-orange-500 mt-20 shadow-[0_0_25px_#f97316]">
          TORCH SONG! (특공 +1)
        </div>
      </div>
    );
  }

  // 9. 아쿠아스텝 (Aqua Step) - Quaquaval samba wave
  if (moveId === 'aqua_step' || moveName === '아쿠아스텝') {
    return (
      <div className="relative flex flex-col items-center justify-center animate-shake">
        <div className="w-48 h-48 bg-cyan-400 rounded-full blur-md animate-ping" />
        <div className="absolute flex gap-3 text-4xl animate-bounce">
          🌊 💃 🦚 💦
        </div>
        <div className="font-black text-2xl text-cyan-200 bg-slate-950 px-4 py-2 border-3 border-cyan-400 mt-16 shadow-[0_0_25px_#06b6d4]">
          AQUA STEP! (스피드 +1)
        </div>
      </div>
    );
  }

  // 10. 수류연타 (Surging Strikes) - Rapid triple water strikes
  if (moveId === 'surging_strikes' || moveName === '수류연타') {
    return (
      <div className="relative flex items-center justify-center animate-flurry-hits">
        <div className="w-52 h-52 bg-blue-600 rounded-full blur-lg animate-ping" />
        <div className="absolute flex gap-4 text-4xl font-black text-cyan-200 animate-bounce">
          💧 ⚔️ 🌊 ⚔️ 💧
        </div>
        <div className="absolute font-black text-3xl text-white bg-blue-900 px-4 py-1 border-3 border-cyan-300 uppercase shadow-[3px_3px_0px_#000]">
          3-HIT CRITICAL!
        </div>
      </div>
    );
  }

  // 11. 불대문자 (Fire Blast) - Huge burning '大' explosion
  if (moveId === 'fire_blast' || moveName === '불대문자') {
    return (
      <div className="relative flex flex-col items-center justify-center">
        <div className="w-48 h-48 bg-gradient-to-r from-orange-600 via-red-600 to-yellow-400 rounded-full blur-md animate-ping opacity-90" />
        <div className="absolute text-8xl font-black text-yellow-300 animate-fire-dai drop-shadow-[0_0_30px_#f97316]">
          大
        </div>
        <div className="absolute flex gap-4 text-3xl animate-bounce">
          🔥 💥 🔥
        </div>
      </div>
    );
  }

  // 12. 화염방사 (Flamethrower) - Concentrated jet flame cone
  if (moveId === 'flamethrower' || moveName === '화염방사') {
    return (
      <div className="relative flex items-center justify-center animate-shake-heavy">
        <div className="w-44 h-44 bg-gradient-to-r from-orange-500 via-red-600 to-yellow-300 rounded-full blur-lg animate-pulse" />
        <div className="absolute flex gap-2 font-black text-4xl text-yellow-300 animate-bounce">
          🔥 🔥 🔥
        </div>
        <div className="absolute w-36 h-36 border-4 border-orange-500 rounded-full animate-spin" />
      </div>
    );
  }

  // 13. 플레어드라이브 (Flare Blitz) / 오버히트 (Overheat) / 블라스트번 (Blast Burn)
  if (
    moveId === 'flare_blitz' ||
    moveName === '플레어드라이브' ||
    moveId === 'overheat' ||
    moveName === '오버히트' ||
    moveId === 'blast_burn' ||
    moveName === '블라스트번'
  ) {
    return (
      <div className="relative flex items-center justify-center animate-shake-heavy">
        <div className="w-56 h-56 bg-gradient-to-r from-red-600 via-orange-500 to-yellow-300 rounded-full blur-xl animate-ping" />
        <div className="absolute w-40 h-40 bg-yellow-300 rounded-full blur-sm animate-scale-up" />
        <div className="absolute font-black text-3xl text-red-950 bg-yellow-400 px-3 py-1 border-3 border-black shadow-[4px_4px_0px_#000] animate-bounce uppercase">
          BLAST CRASH!
        </div>
      </div>
    );
  }

  // 14. 하이드로펌프 / 하이드로캐논 (Hydro Pump / Hydro Cannon)
  if (
    moveId === 'hydro_pump' ||
    moveName === '하이드로펌프' ||
    moveId === 'hydro_cannon' ||
    moveName === '하이드로캐논'
  ) {
    return (
      <div className="relative flex items-center justify-center animate-shake-heavy">
        <div className="w-48 h-48 bg-gradient-to-r from-cyan-400 via-blue-600 to-indigo-700 rounded-full blur-md animate-ping" />
        <div className="absolute w-36 h-36 border-6 border-white rounded-full animate-spin" />
        <div className="absolute flex gap-3 font-black text-4xl text-cyan-200 animate-bounce">
          🌊 💦 🌊
        </div>
      </div>
    );
  }

  // 15. 파도타기 (Surf) - Huge tidal wave sweep
  if (moveId === 'surf' || moveName === '파도타기') {
    return (
      <div className="relative flex flex-col items-center justify-center animate-wave-surge">
        <div className="w-56 h-32 bg-gradient-to-t from-blue-700 via-cyan-400 to-white rounded-t-full blur-xs opacity-90 shadow-[0_0_35px_#38bdf8]" />
        <div className="absolute text-5xl animate-bounce">🌊 🌊 🌊</div>
      </div>
    );
  }

  // 16. 근원의파동 (Origin Pulse) - Converging azure laser needles
  if (moveId === 'origin_pulse' || moveName === '근원의파동') {
    return (
      <div className="relative flex items-center justify-center animate-shake-heavy">
        <div className="w-44 h-44 bg-cyan-400 rounded-full blur-lg animate-pulse" />
        <div className="absolute w-40 h-40 border-4 border-cyan-200 rounded-full animate-spin" />
        <div className="absolute font-black text-3xl text-cyan-100 animate-scale-up drop-shadow-[0_0_20px_#06b6d4]">
          ORIGIN PULSE!
        </div>
      </div>
    );
  }

  // 17. 10만볼트 (Thunderbolt) - Zigzag electric lightning discharge
  if (moveId === 'thunderbolt' || moveName === '10만볼트') {
    return (
      <div className="relative flex items-center justify-center animate-lightning-strike">
        <div className="w-44 h-44 bg-yellow-300 rounded-full blur-md animate-ping opacity-90" />
        <Zap className="absolute w-32 h-32 text-yellow-300 filter drop-shadow-[0_0_25px_#fde047]" />
        <div className="absolute flex gap-2 font-black text-3xl text-yellow-100">
          ⚡ ⚡ ⚡
        </div>
      </div>
    );
  }

  // 18. 번개 (Thunder) - Divine vertical lightning pillar from the sky
  if (moveId === 'thunder' || moveName === '번개') {
    return (
      <div className="relative flex flex-col items-center justify-center animate-lightning-strike">
        <div className="w-24 h-64 bg-gradient-to-b from-white via-yellow-300 to-yellow-500 blur-xs shadow-[0_0_40px_#fef08a]" />
        <Zap className="absolute w-36 h-36 text-white filter drop-shadow-[0_0_30px_#fff]" />
        <div className="absolute font-black text-4xl text-yellow-300 drop-shadow-[3px_3px_0px_#000]">
          THUNDER!
        </div>
      </div>
    );
  }

  // 19. 리프블레이드 (Leaf Blade) / 시저크로스 (X-Scissor) - Sharp X-Slash
  if (
    moveId === 'leaf_blade' ||
    moveName === '리프블레이드' ||
    moveId === 'x_scissor' ||
    moveName === '시저크로스'
  ) {
    return (
      <div className="relative flex items-center justify-center animate-slash-cross">
        <div className="w-40 h-8 bg-gradient-to-r from-emerald-300 via-green-500 to-emerald-300 rounded-full blur-xs rotate-45 shadow-[0_0_25px_#22c55e]" />
        <div className="w-40 h-8 bg-gradient-to-r from-emerald-300 via-green-500 to-emerald-300 rounded-full blur-xs -rotate-45 shadow-[0_0_25px_#22c55e]" />
        <div className="absolute flex gap-2 font-black text-3xl text-green-200">
          🍃 ⚔️ 🍃
        </div>
      </div>
    );
  }

  // 20. 리프스톰 (Leaf Storm) - Giant swirling leaf cyclone
  if (moveId === 'leaf_storm' || moveName === '리프스톰') {
    return (
      <div className="relative flex items-center justify-center animate-shake">
        <div className="w-48 h-48 border-8 border-green-400 rounded-full animate-spin border-dashed" />
        <div className="absolute flex gap-3 font-black text-3xl text-emerald-300 animate-spin">
          🌿 🍃 🌿 🍃
        </div>
      </div>
    );
  }

  // 21. 냉동빔 (Ice Beam) - Crystalline ice freeze block
  if (moveId === 'ice_beam' || moveName === '냉동빔') {
    return (
      <div className="relative flex items-center justify-center animate-ice-freeze">
        <div className="w-40 h-40 bg-cyan-300/80 border-4 border-white rounded-xl shadow-[0_0_35px_#38bdf8] flex items-center justify-center">
          <Snowflake className="w-24 h-24 text-white animate-spin" />
        </div>
        <div className="absolute font-black text-2xl text-white drop-shadow-[2px_2px_0px_#0284c7]">
          FREEZE!
        </div>
      </div>
    );
  }

  // 22. 눈보라 (Blizzard) / 고드름떨구기 (Icicle Crash)
  if (moveId === 'blizzard' || moveName === '눈보라' || moveId === 'icicle_crash' || moveName === '고드름떨구기') {
    return (
      <div className="relative flex items-center justify-center animate-shake-heavy">
        <div className="w-48 h-48 bg-cyan-400/60 rounded-full blur-lg animate-ping" />
        <div className="absolute flex gap-3 font-black text-3xl text-white animate-bounce">
          ❄️ 🧊 ❄️ 🧊
        </div>
        <Snowflake className="absolute w-28 h-28 text-white animate-spin" />
      </div>
    );
  }

  // 23. 인파이트 (Close Combat) - Flurry of rapid comic punch bursts
  if (moveId === 'close_combat' || moveName === '인파이트') {
    return (
      <div className="relative flex items-center justify-center animate-flurry-hits">
        <div className="w-48 h-48 bg-red-600 rounded-full blur-md animate-ping opacity-90" />
        <div className="absolute text-5xl font-black text-yellow-300 drop-shadow-[4px_4px_0px_#000]">
          ORA ORA!
        </div>
        <div className="absolute flex gap-4 text-3xl animate-bounce">
          🥊 💥 👊 💥
        </div>
      </div>
    );
  }

  // 24. 파동탄 (Aura Sphere) - Expanding aura burst
  if (moveId === 'aura_sphere' || moveName === '파동탄') {
    return (
      <div className="relative flex items-center justify-center animate-shake">
        <div className="w-40 h-40 bg-gradient-to-r from-cyan-300 via-blue-500 to-indigo-600 rounded-full blur-md animate-ping" />
        <div className="absolute w-32 h-32 border-4 border-cyan-200 rounded-full animate-spin" />
        <div className="absolute font-black text-3xl text-white drop-shadow-[2px_2px_0px_#0891b2]">
          AURA BURST!
        </div>
      </div>
    );
  }

  // 25. 지진 (Earthquake) - Screen-shattering fissure and rock eruption
  if (moveId === 'earthquake' || moveName === '지진') {
    return (
      <div className="relative flex flex-col items-center justify-center animate-fissure-erupt">
        <div className="w-56 h-36 bg-amber-950/80 rounded-full blur-sm border-b-8 border-amber-600 animate-pulse shadow-[0_0_35px_#78350f]" />
        <div className="absolute flex gap-3 text-4xl animate-bounce">
          🪨 🌋 🪨
        </div>
        <div className="absolute font-black text-3xl text-amber-200 drop-shadow-[3px_3px_0px_#000]">
          EARTHQUAKE!
        </div>
      </div>
    );
  }

  // 26. 단애의칼 (Precipice Blades) - Jagged red magma stone blades
  if (moveId === 'precipice_blades' || moveName === '단애의칼') {
    return (
      <div className="relative flex items-center justify-center animate-fissure-erupt">
        <div className="w-48 h-48 bg-red-700 rounded-full blur-md animate-ping" />
        <div className="absolute flex gap-2 font-black text-4xl text-yellow-300">
          ⛰️ 🗡️ ⛰️
        </div>
        <div className="absolute font-black text-2xl text-red-100 drop-shadow-[2px_2px_0px_#000]">
          PRECIPICE BLADES!
        </div>
      </div>
    );
  }

  // 27. 스톤에지 (Stone Edge) - Sharp rock monolith spikes
  if (moveId === 'stone_edge' || moveName === '스톤에지') {
    return (
      <div className="relative flex items-center justify-center animate-fissure-erupt">
        <div className="w-44 h-44 bg-amber-800 rounded-full blur-md animate-ping" />
        <div className="absolute flex gap-2 text-4xl animate-bounce">
          🪨 🪨 🪨
        </div>
        <div className="absolute font-black text-2xl text-amber-100 drop-shadow-[2px_2px_0px_#000]">
          CRITICAL SPIKE!
        </div>
      </div>
    );
  }

  // 28. 브레이브버드 (Brave Bird) - Majestic phoenix dive explosion
  if (moveId === 'brave_bird' || moveName === '브레이브버드') {
    return (
      <div className="relative flex items-center justify-center animate-shake-heavy">
        <div className="w-48 h-48 bg-gradient-to-r from-blue-500 via-indigo-600 to-red-500 rounded-full blur-md animate-ping" />
        <div className="absolute font-black text-3xl text-yellow-300 drop-shadow-[3px_3px_0px_#000]">
          BRAVE BIRD!
        </div>
        <div className="absolute flex gap-2 text-3xl animate-spin">
          🦅 🪶 🦅
        </div>
      </div>
    );
  }

  // 29. 사이코키네시스 (Psychic) / 사이코브레이크 (Psystrike) / 꿈먹기 (Dream Eater)
  if (
    moveId === 'psychic' ||
    moveName === '사이코키네시스' ||
    moveId === 'psystrike' ||
    moveName === '사이코브레이크' ||
    moveId === 'dream_eater' ||
    moveName === '꿈먹기'
  ) {
    return (
      <div className="relative flex items-center justify-center animate-warp-space">
        <div className="w-48 h-48 bg-pink-600 rounded-full blur-lg animate-pulse" />
        <div className="absolute w-36 h-36 border-4 border-pink-300 rounded-full animate-spin" />
        <Eye className="absolute w-24 h-24 text-white filter drop-shadow-[0_0_20px_#ec4899]" />
        <div className="absolute font-black text-2xl text-pink-100 drop-shadow-[2px_2px_0px_#000]">
          {moveId === 'dream_eater' || moveName === '꿈먹기' ? 'DREAM EATER!' : 'PSYCHIC!'}
        </div>
      </div>
    );
  }

  // 30. 섀도볼 (Shadow Ball) / 야습 (Shadow Sneak) - Dark matter explosion
  if (moveId === 'shadow_ball' || moveName === '섀도볼' || moveId === 'shadow_sneak' || moveName === '야습') {
    return (
      <div className="relative flex items-center justify-center animate-shake">
        <div className="w-44 h-44 bg-purple-950 rounded-full blur-md animate-ping opacity-95" />
        <div className="absolute flex gap-2 font-black text-4xl text-purple-300 animate-pulse">
          👻 😈 👻
        </div>
      </div>
    );
  }

  // 31. 용성군 (Draco Meteor) - Meteor rain bombardment
  if (moveId === 'draco_meteor' || moveName === '용성군') {
    return (
      <div className="relative flex flex-col items-center justify-center animate-meteor-rain">
        <div className="w-56 h-56 bg-gradient-to-r from-orange-600 via-indigo-600 to-purple-700 rounded-full blur-lg opacity-90" />
        <div className="absolute flex gap-3 text-4xl animate-bounce">
          ☄️ ☄️ ☄️
        </div>
        <div className="absolute font-black text-3xl text-yellow-300 drop-shadow-[3px_3px_0px_#000]">
          DRACO METEOR!
        </div>
      </div>
    );
  }

  // 32. 역린 (Outrage) / 드래곤크루 (Dragon Claw) - Dragon claw slash
  if (moveId === 'outrage' || moveName === '역린' || moveId === 'dragon_claw' || moveName === '드래곤크루') {
    return (
      <div className="relative flex items-center justify-center animate-slash-diagonal">
        <div className="w-44 h-44 bg-indigo-700 rounded-full blur-md animate-ping" />
        <div className="absolute flex gap-2 font-black text-4xl text-cyan-300">
          🐉 ⚔️ 🐉
        </div>
      </div>
    );
  }

  // 33. 악의파동 (Dark Pulse) - Concentric dark ripple rings
  if (moveId === 'dark_pulse' || moveName === '악의파동') {
    return (
      <div className="relative flex items-center justify-center animate-sonic-ripple">
        <div className="w-40 h-40 border-8 border-purple-900 rounded-full animate-ping" />
        <div className="absolute font-black text-3xl text-purple-400">
          DARK PULSE!
        </div>
      </div>
    );
  }

  // 34. 깨물어부수기 (Crunch) - Giant dark beast jaws snapping shut
  if (moveId === 'crunch' || moveName === '깨물어부수기') {
    return (
      <div className="relative flex flex-col items-center justify-center animate-shake-heavy">
        <div className="animate-bite-top font-black text-5xl text-purple-400 drop-shadow-[3px_3px_0px_#000]">
          ▼ ▼ ▼ ▼
        </div>
        <div className="font-black text-3xl text-red-500 bg-black px-3 py-1 border-2 border-white my-1">
          CRUNCH!
        </div>
        <div className="animate-bite-bottom font-black text-5xl text-purple-400 drop-shadow-[3px_3px_0px_#000]">
          ▲ ▲ ▲ ▲
        </div>
      </div>
    );
  }

  // 35. 암흑강타 (Wicked Blow) - Martial arts ink slash
  if (moveId === 'wicked_blow' || moveName === '암흑강타') {
    return (
      <div className="relative flex items-center justify-center animate-ink-stroke">
        <div className="w-48 h-12 bg-black border-2 border-red-600 rounded-sm rotate-[-25deg] shadow-[0_0_30px_#ef4444]" />
        <div className="absolute font-black text-4xl text-red-500 drop-shadow-[3px_3px_0px_#fff]">
          一撃必殺!
        </div>
      </div>
    );
  }

  // 36. 거수참 (Behemoth Blade) - Massive Zacian giant energy blade cleave
  if (moveId === 'behemoth_blade' || moveName === '거수참') {
    return (
      <div className="relative flex items-center justify-center animate-cleave-slash">
        <div className="w-16 h-64 bg-gradient-to-b from-cyan-200 via-blue-500 to-indigo-700 border-2 border-white rounded-md shadow-[0_0_40px_#38bdf8]" />
        <div className="absolute font-black text-4xl text-cyan-200 drop-shadow-[3px_3px_0px_#000]">
          BEHEMOTH BLADE!
        </div>
      </div>
    );
  }

  // 37. 문포스 (Moonblast) - Radiant lunar moon explosion
  if (moveId === 'moonblast' || moveName === '문포스') {
    return (
      <div className="relative flex flex-col items-center justify-center animate-moon-rise">
        <div className="w-48 h-48 bg-gradient-to-r from-pink-300 via-purple-400 to-pink-200 rounded-full blur-md shadow-[0_0_40px_#f472b6] flex items-center justify-center">
          <Moon className="w-28 h-28 text-white animate-spin" />
        </div>
        <div className="absolute font-black text-3xl text-white drop-shadow-[2px_2px_0px_#db2777]">
          MOONBLAST!
        </div>
      </div>
    );
  }

  // 38. 치근거리기 (Play Rough) - Cartoon brawl smoke cloud
  if (moveId === 'play_rough' || moveName === '치근거리기') {
    return (
      <div className="relative flex items-center justify-center animate-shake">
        <div className="w-44 h-44 bg-pink-300 rounded-full blur-md animate-ping" />
        <div className="absolute flex gap-2 font-black text-3xl animate-bounce">
          ⭐ 💖 💥 💫
        </div>
        <div className="absolute font-black text-2xl text-pink-600 bg-white px-2 border-2 border-black">
          POW! BAM!
        </div>
      </div>
    );
  }

  // 39. 벌레의야단법석 (Bug Buzz) / 폭음파 (Boomburst)
  if (
    moveId === 'bug_buzz' ||
    moveName === '벌레의야단법석' ||
    moveId === 'boomburst' ||
    moveName === '폭음파'
  ) {
    return (
      <div className="relative flex items-center justify-center animate-sonic-ripple">
        <div className="w-52 h-52 border-8 border-lime-400 rounded-full animate-ping" />
        <div className="absolute font-black text-3xl text-lime-300">
          🔊 BOOM SOUND! 🔊
        </div>
      </div>
    );
  }

  // 40. 오물폭탄 (Sludge Bomb) / 맹독 (Toxic) - Toxic sludge bubble
  if (moveId === 'sludge_bomb' || moveName === '오물폭탄' || moveId === 'toxic' || moveName === '맹독') {
    return (
      <div className="relative flex items-center justify-center animate-bubble-pop">
        <div className="w-44 h-44 bg-purple-700 rounded-full blur-md animate-ping" />
        <div className="absolute flex gap-2 font-black text-3xl text-purple-200">
          ☠️ 🧪 ☠️
        </div>
        <Skull className="absolute w-20 h-20 text-purple-200 animate-pulse" />
      </div>
    );
  }

  // 41. 심판의뭉치 (Judgment) - Divine golden orbital bombardment
  if (moveId === 'judgment' || moveName === '심판의뭉치') {
    return (
      <div className="relative flex flex-col items-center justify-center animate-lightning-strike">
        <div className="w-56 h-56 bg-yellow-300 rounded-full blur-lg animate-ping" />
        <div className="absolute font-black text-4xl text-yellow-400 drop-shadow-[4px_4px_0px_#000]">
          JUDGMENT!
        </div>
        <div className="absolute flex gap-3 text-4xl animate-bounce">
          ✨ 👑 ✨
        </div>
      </div>
    );
  }

  // 42. 트라이어택 (Tri Attack) - Fire, Ice, Electric triad
  if (moveId === 'tri_attack' || moveName === '트라이어택') {
    return (
      <div className="relative flex items-center justify-center animate-shake">
        <div className="absolute -translate-y-8 text-4xl animate-bounce">🔥</div>
        <div className="absolute -translate-x-8 translate-y-6 text-4xl animate-bounce">⚡</div>
        <div className="absolute translate-x-8 translate-y-6 text-4xl animate-bounce">❄️</div>
        <div className="w-36 h-36 border-4 border-yellow-300 rounded-full animate-spin" />
      </div>
    );
  }

  // 43. 신속 (Extreme Speed) - Sonic boom impact
  if (moveId === 'extreme_speed' || moveName === '신속') {
    return (
      <div className="relative flex items-center justify-center animate-sonic-ripple">
        <div className="w-48 h-48 bg-slate-200 rounded-full blur-sm animate-ping" />
        <div className="absolute font-black text-3xl text-slate-900 bg-yellow-400 px-3 py-1 border-3 border-black uppercase">
          SONIC SPEED!
        </div>
      </div>
    );
  }

  // Generic Fallback Impact Renderers by Type
  switch (type) {
    case '불꽃':
      return (
        <div className="relative flex items-center justify-center animate-shake">
          <div className="w-40 h-40 bg-gradient-to-r from-orange-500 via-red-600 to-yellow-400 rounded-full blur-md animate-ping opacity-90" />
          <div className="absolute flex gap-2 font-black text-2xl text-yellow-300 animate-bounce">
            🔥 🔥 🔥
          </div>
        </div>
      );
    case '물':
      return (
        <div className="relative flex items-center justify-center animate-shake">
          <div className="w-40 h-40 bg-blue-500 rounded-full blur-md animate-ping opacity-90" />
          <div className="absolute flex gap-2 font-black text-2xl text-cyan-200 animate-bounce">
            🌊 💦 🌊
          </div>
        </div>
      );
    case '전기':
      return (
        <div className="relative flex items-center justify-center animate-shake">
          <div className="w-40 h-40 bg-yellow-400 rounded-full blur-md animate-ping opacity-90" />
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
          <div className="absolute flex gap-2 font-black text-2xl text-green-200 animate-spin">
            🍃 🌿 🍃
          </div>
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

// =========================================================================
// CUSTOM STATUS & BUFF / RECOVERY ANIMATIONS (변화기 & 회복기)
// =========================================================================
function renderCustomStatusEffect(moveId: string, moveName: string, type: PokemonType) {
  // 1. 칼춤 (Swords Dance) - Multiple spinning swords ascending
  if (moveId === 'swords_dance' || moveName === '칼춤') {
    return (
      <div className="relative flex flex-col items-center justify-center animate-slide-up">
        <div className="w-36 h-36 border-4 border-yellow-400 border-dashed rounded-full animate-orbit-spin flex items-center justify-center">
          <Swords className="w-16 h-16 text-yellow-300 filter drop-shadow-[0_0_15px_#fde047]" />
        </div>
        <div className="bg-slate-950 px-3 py-1 border-2 border-black text-xs font-black text-yellow-300 shadow-[3px_3px_0px_#000] -mt-4">
          ⚔️ 공격력 2랭크 상승!
        </div>
      </div>
    );
  }

  // 2. 용의춤 (Dragon Dance) - Coiling dragon spirit
  if (moveId === 'dragon_dance' || moveName === '용의춤') {
    return (
      <div className="relative flex flex-col items-center justify-center animate-slide-up">
        <div className="w-36 h-36 bg-gradient-to-t from-indigo-700/60 via-cyan-400/60 to-transparent rounded-full animate-pulse blur-xs" />
        <div className="absolute text-4xl animate-bounce">🐉 ✨</div>
        <div className="bg-slate-950 px-3 py-1 border-2 border-black text-xs font-black text-cyan-300 shadow-[3px_3px_0px_#000]">
          공격 & 스피드 1랭크 상승!
        </div>
      </div>
    );
  }

  // 3. 나비춤 (Quiver Dance) - Fluttering butterfly wings
  if (moveId === 'quiver_dance' || moveName === '나비춤') {
    return (
      <div className="relative flex flex-col items-center justify-center animate-slide-up">
        <div className="w-36 h-36 bg-gradient-to-t from-lime-400/60 via-pink-300/60 to-transparent rounded-full animate-pulse blur-xs" />
        <div className="absolute text-4xl animate-bounce">🦋 ✨ 🌸</div>
        <div className="bg-slate-950 px-3 py-1 border-2 border-black text-xs font-black text-lime-300 shadow-[3px_3px_0px_#000]">
          특공/특방/스피드 상승!
        </div>
      </div>
    );
  }

  // 4. 껍질깨기 (Shell Smash) - Shell shatter + massive boost
  if (moveId === 'shell_smash' || moveName === '껍질깨기') {
    return (
      <div className="relative flex flex-col items-center justify-center animate-slide-up">
        <div className="w-36 h-36 border-4 border-red-500 border-dashed rounded-full animate-spin flex items-center justify-center">
          <Shield className="w-16 h-16 text-red-400 animate-pulse" />
        </div>
        <div className="bg-slate-950 px-3 py-1 border-2 border-black text-xs font-black text-red-400 shadow-[3px_3px_0px_#000] -mt-2">
          💥 방어 하락 & 공/특공/스피드 2랭크 UP!
        </div>
      </div>
    );
  }

  // 5. 배북 (Belly Drum) - Max attack buff
  if (moveId === 'belly_drum' || moveName === '배북') {
    return (
      <div className="relative flex flex-col items-center justify-center animate-slide-up">
        <div className="w-36 h-36 bg-red-600/70 rounded-full animate-ping flex items-center justify-center" />
        <div className="absolute text-4xl animate-bounce">🥁 💥 🥊</div>
        <div className="bg-slate-950 px-3 py-1 border-2 border-black text-xs font-black text-yellow-300 shadow-[3px_3px_0px_#000]">
          공격력 6랭크 (최대치) 상승!
        </div>
      </div>
    );
  }

  // 6. 명상 (Calm Mind) - Serene blue lotus mandala
  if (moveId === 'calm_mind' || moveName === '명상') {
    return (
      <div className="relative flex flex-col items-center justify-center animate-slide-up">
        <div className="w-32 h-32 border-4 border-cyan-300 rounded-full animate-spin flex items-center justify-center">
          <Sparkles className="w-12 h-12 text-cyan-200" />
        </div>
        <div className="bg-slate-950 px-3 py-1 border-2 border-black text-xs font-black text-cyan-300 shadow-[3px_3px_0px_#000] -mt-2">
          🧘 마음의 평정 (특공/특방 UP)
        </div>
      </div>
    );
  }

  // 7. 나쁜음모 (Nasty Plot) - Dark devious aura
  if (moveId === 'nasty_plot' || moveName === '나쁜음모') {
    return (
      <div className="relative flex flex-col items-center justify-center animate-slide-up">
        <div className="w-32 h-32 bg-purple-950/80 rounded-full blur-xs animate-pulse" />
        <div className="absolute text-4xl animate-bounce">😈 💡</div>
        <div className="bg-slate-950 px-3 py-1 border-2 border-black text-xs font-black text-purple-300 shadow-[3px_3px_0px_#000]">
          특수공격 2랭크 대폭 상승!
        </div>
      </div>
    );
  }

  // 8. 지오컨트롤 (Geomancy) - Xerneas fairy power
  if (moveId === 'geomancy' || moveName === '지오컨트롤') {
    return (
      <div className="relative flex flex-col items-center justify-center animate-slide-up">
        <div className="w-40 h-40 bg-gradient-to-t from-pink-500 via-cyan-400 to-yellow-300 rounded-full blur-xs animate-spin opacity-80" />
        <div className="absolute text-4xl animate-bounce">🦌 🌈 ✨</div>
        <div className="bg-slate-950 px-3 py-1 border-2 border-black text-xs font-black text-pink-300 shadow-[3px_3px_0px_#000]">
          지오컨트롤 (특공/특방/스피드 2랭크 UP!)
        </div>
      </div>
    );
  }

  // 9. 도깨비불 (Will-O-Wisp) / 전기자석파 (Thunder Wave) / 최면술 (Hypnosis) / 다크홀 (Dark Void)
  if (moveId === 'will_o_wisp' || moveName === '도깨비불') {
    return (
      <div className="relative flex items-center justify-center animate-orbit-spin">
        <div className="absolute -translate-y-8 text-3xl animate-pulse">🔥</div>
        <div className="absolute -translate-x-8 translate-y-6 text-3xl animate-pulse">🔥</div>
        <div className="absolute translate-x-8 translate-y-6 text-3xl animate-pulse">🔥</div>
      </div>
    );
  }

  if (moveId === 'thunder_wave' || moveName === '전기자석파') {
    return (
      <div className="relative flex items-center justify-center animate-sonic-ripple">
        <div className="w-36 h-36 border-4 border-yellow-300 rounded-full animate-ping" />
        <div className="absolute text-3xl animate-bounce">⚡ 마비 ⚡</div>
      </div>
    );
  }

  if (moveId === 'hypnosis' || moveName === '최면술') {
    return (
      <div className="relative flex items-center justify-center animate-orbit-spin">
        <div className="w-36 h-36 border-4 border-pink-400 border-dashed rounded-full animate-spin" />
        <div className="absolute text-3xl font-black text-pink-300 animate-pulse">💤 Zzz...</div>
      </div>
    );
  }

  // 10. HP Recovery Moves (Recover, Roost, Slack Off, Lunar Blessing, etc.)
  const isHeal =
    moveName.includes('회복') ||
    moveName.includes('쉬기') ||
    moveName.includes('태만함') ||
    moveName.includes('드레인') ||
    moveName.includes('기도') ||
    moveId === 'recover' ||
    moveId === 'roost' ||
    moveId === 'slack_off' ||
    moveId === 'lunar_blessing';

  if (isHeal) {
    return (
      <div className="relative flex flex-col items-center justify-center animate-slide-up">
        <div className="w-32 h-32 bg-green-400/50 rounded-full blur-xs animate-pulse" />
        <div className="absolute flex flex-col items-center gap-1 font-black text-green-300">
          <span className="text-4xl animate-bounce">💚 ✨</span>
          <span className="bg-slate-950 px-3 py-1 border-2 border-black text-xs font-black text-green-400 shadow-[3px_3px_0px_#000]">
            HP 대량 회복!
          </span>
        </div>
      </div>
    );
  }

  // Default Stat Buff / Debuff
  return (
    <div className="relative flex flex-col items-center justify-center animate-slide-up">
      <div className="w-28 h-40 bg-gradient-to-t from-yellow-400/60 via-red-500/60 to-transparent rounded-full blur-xs animate-pulse" />
      <div className="absolute flex flex-col items-center gap-1 font-black text-yellow-300">
        <span className="text-3xl animate-bounce">⚔️ 🔺 🔺</span>
        <span className="bg-slate-950 px-3 py-1 border-2 border-black text-xs font-black text-yellow-400 shadow-[3px_3px_0px_#000]">
          능력치 변화!
        </span>
      </div>
    </div>
  );
}
