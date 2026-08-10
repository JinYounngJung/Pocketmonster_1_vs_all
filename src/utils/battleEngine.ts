import { PokemonData, Move, StatusCondition, BattleLog } from '../types/pokemon';
import { getTypeEffectiveness } from '../data/typeChart';

// Stat stage multiplier table (-6 to +6)
export function getStageMultiplier(stage: number): number {
  const clamped = Math.max(-6, Math.min(6, stage));
  if (clamped >= 0) {
    return (2 + clamped) / 2; // +1 -> 1.5, +2 -> 2.0, +3 -> 2.5, +6 -> 4.0
  } else {
    return 2 / (2 - clamped); // -1 -> 0.67, -2 -> 0.5, -3 -> 0.4, -6 -> 0.25
  }
}

export function getEffectiveSpeed(pokemon: PokemonData): number {
  let speed = pokemon.stats.speed * getStageMultiplier(pokemon.statStages.speed);
  if (pokemon.status === 'paralysis') {
    speed *= 0.5;
  }
  return Math.floor(speed);
}

export interface DamageResult {
  damage: number;
  typeEffectiveness: number;
  isCrit: boolean;
  isImmune: boolean;
  isSuperEffective: boolean;
  isNotVeryEffective: boolean;
  disguiseBroken?: boolean;
}

export function calculateDamage(
  attacker: PokemonData,
  defender: PokemonData,
  move: Move
): DamageResult {
  if (move.category === 'status' || move.power === 0) {
    return {
      damage: 0,
      typeEffectiveness: 1,
      isCrit: false,
      isImmune: false,
      isSuperEffective: false,
      isNotVeryEffective: false,
    };
  }

  // Type effectiveness
  const typeEffectiveness = getTypeEffectiveness(move.type, defender.types);

  if (typeEffectiveness === 0) {
    return {
      damage: 0,
      typeEffectiveness: 0,
      isCrit: false,
      isImmune: true,
      isSuperEffective: false,
      isNotVeryEffective: false,
    };
  }

  // Mimikyu Disguise Check
  if (defender.dexNumber === 778 && defender.ability.name === '탈' && !defender.fainted) {
    // Only block once per match
    // Handled in battle flow
  }

  // STAB
  const isStab = attacker.types.includes(move.type);
  const stabMultiplier = isStab ? 1.5 : 1.0;

  // Critical hit check (1/16 normal, 1/8 if critBoost)
  const critRate = move.critBoost ? 0.125 : 0.0625;
  const isCrit = Math.random() < critRate;
  const critMultiplier = isCrit ? 1.5 : 1.0;

  // Stats calculation with stages
  let attackStat = 0;
  let defenseStat = 0;

  if (move.category === 'physical') {
    attackStat = attacker.stats.attack * getStageMultiplier(attacker.statStages.attack);
    defenseStat = defender.stats.defense * getStageMultiplier(defender.statStages.defense);

    // Azumarill Huge Power (천하장사)
    if (attacker.ability.name === '천하장사') {
      attackStat *= 2;
    }
    // Burn penalty for physical attacks
    if (attacker.status === 'burn') {
      attackStat *= 0.5;
    }
  } else {
    // Special attack
    attackStat = attacker.stats.spAttack * getStageMultiplier(attacker.statStages.spAttack);
    // Psyshock hits physical defense
    if (move.id === 'psyshock') {
      defenseStat = defender.stats.defense * getStageMultiplier(defender.statStages.defense);
    } else {
      defenseStat = defender.stats.spDefense * getStageMultiplier(defender.statStages.spDefense);
    }
  }

  // Multiscale (멀티스케일) ability if full HP
  let abilityDefMultiplier = 1.0;
  if (defender.ability.name === '멀티스케일' && defender.currentHp === defender.stats.hp) {
    abilityDefMultiplier = 0.5;
  }

  // Standard Pokemon Lv 50 damage formula
  const level = 50;
  const baseDamage = Math.floor(
    (Math.floor((2 * level) / 5 + 2) * move.power * (attackStat / Math.max(1, defenseStat))) / 50 + 2
  );

  const randomMultiplier = 0.85 + Math.random() * 0.15;

  let totalDamage = Math.floor(
    baseDamage * stabMultiplier * typeEffectiveness * critMultiplier * randomMultiplier * abilityDefMultiplier
  );

  totalDamage = Math.max(1, totalDamage);

  return {
    damage: totalDamage,
    typeEffectiveness,
    isCrit,
    isImmune: false,
    isSuperEffective: typeEffectiveness > 1,
    isNotVeryEffective: typeEffectiveness < 1 && typeEffectiveness > 0,
  };
}

// AI Move Choice Logic
export function selectBestAIMove(aiPokemon: PokemonData, playerPokemon: PokemonData): Move {
  const availableMoves = aiPokemon.moves.filter((m) => m.pp > 0);
  if (availableMoves.length === 0) {
    return aiPokemon.moves[0]; // fallback struggle
  }

  let bestMove = availableMoves[0];
  let highestScore = -999;

  for (const move of availableMoves) {
    let score = 0;

    if (move.category === 'status') {
      // Setup moves like Dragon Dance, Swords Dance, Nasty Plot, Quiver Dance
      if (move.statChanges && move.statChanges.some((sc) => sc.target === 'self')) {
        const canBoost = move.statChanges.some(
          (sc) => (aiPokemon.statStages[sc.stat] || 0) < 3
        );
        if (canBoost && aiPokemon.currentHp / aiPokemon.stats.hp > 0.6) {
          score += 65;
        } else {
          score -= 40;
        }
      }
      // Status afflictions (Will-o-wisp, Thunder wave, Toxic)
      if (move.statusEffect) {
        if (playerPokemon.status === 'none') {
          score += 50;
        } else {
          score -= 100; // already has status
        }
      }
      // Healing moves (Recover, Roost)
      if (move.healRatio) {
        const missingHpRatio = 1 - aiPokemon.currentHp / aiPokemon.stats.hp;
        if (missingHpRatio > 0.45) {
          score += missingHpRatio * 120;
        } else {
          score -= 50;
        }
      }
    } else {
      // Damage calculation
      const dmgRes = calculateDamage(aiPokemon, playerPokemon, move);
      score += dmgRes.damage;

      // Bonus if can knockout
      if (dmgRes.damage >= playerPokemon.currentHp) {
        score += 300;
      }

      // Type advantage bonus
      if (dmgRes.isSuperEffective) {
        score += 80 * dmgRes.typeEffectiveness;
      } else if (dmgRes.isImmune) {
        score -= 500;
      } else if (dmgRes.isNotVeryEffective) {
        score -= 40;
      }

      // Priority finish bonus
      if (move.priority && move.priority > 0 && playerPokemon.currentHp < 45) {
        score += 150;
      }
    }

    // Add slight random flavor (0~15)
    score += Math.random() * 15;

    if (score > highestScore) {
      highestScore = score;
      bestMove = move;
    }
  }

  return bestMove;
}

// Reset all Pokemon in party to full HP, PP, and cleared status (For stage clears)
export function fullHealPokemon(pokemon: PokemonData): PokemonData {
  return {
    ...pokemon,
    currentHp: pokemon.stats.hp,
    status: 'none',
    statusTurns: 0,
    fainted: false,
    statStages: {
      attack: 0,
      defense: 0,
      spAttack: 0,
      spDefense: 0,
      speed: 0,
      accuracy: 0,
      evasion: 0,
    },
    moves: pokemon.moves.map((m) => ({ ...m, pp: m.maxPp })),
  };
}

export function fullHealParty(party: PokemonData[]): PokemonData[] {
  return party.map(fullHealPokemon);
}
