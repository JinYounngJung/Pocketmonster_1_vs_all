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
  // Choice Scarf item boosts Speed by 50%
  if (pokemon.item === 'choice_scarf' && !pokemon.fainted) {
    speed *= 1.5;
  }
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
  move: Move,
  options?: {
    isAttackerPlayer?: boolean;
    difficulty?: 'casual' | 'normal' | 'hardcore';
  }
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

  // Air Balloon item gives full immunity to Ground attacks until popped
  if (
    move.type === '땅' &&
    defender.item === 'air_balloon' &&
    !defender.itemConsumed
  ) {
    return {
      damage: 0,
      typeEffectiveness: 0,
      isCrit: false,
      isImmune: true,
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

  // STAB (Same-Type Attack Bonus)
  const isStab = attacker.types.includes(move.type);
  let stabMultiplier = isStab ? 1.5 : 1.0;
  // Type plate boosts STAB moves by additional 20%
  if (isStab && attacker.item === 'legendary_plate') {
    stabMultiplier *= 1.2;
  }

  // Critical hit check (Scope Lens item boosts crit rate)
  const isScopeLens = attacker.item === 'scope_lens';
  const critRate = isScopeLens
    ? move.critBoost
      ? 0.50
      : 0.25
    : move.critBoost
    ? 0.125
    : 0.0625;
  const isCrit = Math.random() < critRate;
  const critMultiplier = isCrit ? 1.5 : 1.0;

  // Stats calculation with stages & Held Items
  let attackStat = 0;
  let defenseStat = 0;

  if (move.category === 'physical') {
    attackStat = attacker.stats.attack * getStageMultiplier(attacker.statStages.attack);
    defenseStat = defender.stats.defense * getStageMultiplier(defender.statStages.defense);

    // Choice Band boosts Physical Attack by 50%
    if (attacker.item === 'choice_band') {
      attackStat *= 1.5;
    }

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

    // Choice Specs boosts Special Attack by 50%
    if (attacker.item === 'choice_specs') {
      attackStat *= 1.5;
    }

    // Psyshock hits physical defense
    if (move.id === 'psyshock') {
      defenseStat = defender.stats.defense * getStageMultiplier(defender.statStages.defense);
    } else {
      defenseStat = defender.stats.spDefense * getStageMultiplier(defender.statStages.spDefense);

      // Assault Vest boosts Special Defense by 50%
      if (defender.item === 'assault_vest') {
        defenseStat *= 1.5;
      }
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

  // Difficulty & Fairness balance scaling
  const difficulty = options?.difficulty || 'normal';
  const isPlayer = options?.isAttackerPlayer ?? true;

  let balanceMultiplier = 1.0;
  if (!isPlayer) {
    if (difficulty === 'casual') {
      balanceMultiplier = 0.70;
    } else if (difficulty === 'normal') {
      balanceMultiplier = 0.82;
    } else {
      balanceMultiplier = 1.0; // Hardcore
    }
  } else {
    if (difficulty === 'casual') {
      balanceMultiplier = 1.20;
    } else if (difficulty === 'normal') {
      balanceMultiplier = 1.05;
    } else {
      balanceMultiplier = 1.0;
    }
  }

  // Held Item Damage Multipliers:
  // 1. Life Orb (+30% all damage)
  let itemDmgMultiplier = 1.0;
  if (attacker.item === 'life_orb') {
    itemDmgMultiplier *= 1.3;
  }
  // 2. Expert Belt (+20% super-effective damage)
  if (attacker.item === 'expert_belt' && typeEffectiveness > 1) {
    itemDmgMultiplier *= 1.2;
  }
  // 3. Light Clay (Defender takes 15% reduced damage)
  if (defender.item === 'light_clay') {
    itemDmgMultiplier *= 0.85;
  }

  let totalDamage = Math.floor(
    baseDamage *
      stabMultiplier *
      typeEffectiveness *
      critMultiplier *
      randomMultiplier *
      abilityDefMultiplier *
      balanceMultiplier *
      itemDmgMultiplier
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

export type TurnOrderReason =
  | 'player_priority'
  | 'opponent_priority'
  | 'player_speed'
  | 'opponent_speed'
  | 'player_quick_claw'
  | 'opponent_quick_claw'
  | 'speed_tie';

export interface TurnOrderResult {
  firstAttacker: 'player' | 'opponent';
  reason: TurnOrderReason;
  playerSpeed: number;
  opponentSpeed: number;
  playerPriority: number;
  opponentPriority: number;
}

export function determineTurnOrder(
  player: PokemonData,
  opponent: PokemonData,
  playerMove: Move,
  opponentMove: Move
): TurnOrderResult {
  let playerPriority = playerMove.priority || 0;
  let opponentPriority = opponentMove.priority || 0;
  const playerSpeed = getEffectiveSpeed(player);
  const opponentSpeed = getEffectiveSpeed(opponent);

  // Quick Claw item (20% chance to grant top priority bracket)
  const playerQuickClaw = player.item === 'quick_claw' && Math.random() < 0.20;
  const opponentQuickClaw = opponent.item === 'quick_claw' && Math.random() < 0.20;

  if (playerQuickClaw && !opponentQuickClaw) {
    return {
      firstAttacker: 'player',
      reason: 'player_quick_claw',
      playerSpeed,
      opponentSpeed,
      playerPriority: playerPriority + 1,
      opponentPriority,
    };
  } else if (opponentQuickClaw && !playerQuickClaw) {
    return {
      firstAttacker: 'opponent',
      reason: 'opponent_quick_claw',
      playerSpeed,
      opponentSpeed,
      playerPriority,
      opponentPriority: opponentPriority + 1,
    };
  }

  // 1. Move Priority has absolute top precedence
  if (playerPriority !== opponentPriority) {
    if (playerPriority > opponentPriority) {
      return {
        firstAttacker: 'player',
        reason: 'player_priority',
        playerSpeed,
        opponentSpeed,
        playerPriority,
        opponentPriority,
      };
    } else {
      return {
        firstAttacker: 'opponent',
        reason: 'opponent_priority',
        playerSpeed,
        opponentSpeed,
        playerPriority,
        opponentPriority,
      };
    }
  }

  // 2. Strict Effective Speed comparison (Higher Speed moves FIRST)
  if (playerSpeed > opponentSpeed) {
    return {
      firstAttacker: 'player',
      reason: 'player_speed',
      playerSpeed,
      opponentSpeed,
      playerPriority,
      opponentPriority,
    };
  } else if (opponentSpeed > playerSpeed) {
    return {
      firstAttacker: 'opponent',
      reason: 'opponent_speed',
      playerSpeed,
      opponentSpeed,
      playerPriority,
      opponentPriority,
    };
  }

  // 3. Exact Speed Tie (50% coin flip)
  const isPlayerFirst = Math.random() < 0.5;
  return {
    firstAttacker: isPlayerFirst ? 'player' : 'opponent',
    reason: 'speed_tie',
    playerSpeed,
    opponentSpeed,
    playerPriority,
    opponentPriority,
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
    itemConsumed: false,
    choiceLockedMoveId: undefined,
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
