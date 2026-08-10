import { PokemonData, EliteFourMaster, Move, PokemonType } from '../types/pokemon';
import { getTypeEffectiveness } from '../data/typeChart';

export interface LocalOakContext {
  currentStage: number;
  masterName: string;
  masterTypes: PokemonType[];
  activePlayer: {
    name: string;
    types: PokemonType[];
    hp: string;
    moves: { name: string; type: PokemonType; power: number; category: string }[];
  } | null;
  activeOpponent: {
    name: string;
    types: PokemonType[];
    hp: string;
  } | null;
  partyMembers: {
    name: string;
    types: PokemonType[];
    hp: string;
    currentHpNum: number;
    maxHpNum: number;
  }[];
}

// Generates intelligent, instant tactical advice without any network fetch
export function generateLocalOakAdvice(
  userQuery: string,
  context?: LocalOakContext | null,
  activePlayerPokemon?: PokemonData | null,
  activeOpponentPokemon?: PokemonData | null,
  currentMaster?: EliteFourMaster | null,
  playerParty?: PokemonData[]
): string {
  const query = userQuery.trim().toLowerCase();

  // If in active battle with active Pokemon
  if (activePlayerPokemon && activeOpponentPokemon && currentMaster) {
    const oppTypes = activeOpponentPokemon.types;
    const playerTypes = activePlayerPokemon.types;

    // Check query specifics
    if (query.includes('기술') || query.includes('어떤') || query.includes('공격') || query.includes('효과')) {
      // Analyze active player's moves against opponent
      const moveEvaluations = activePlayerPokemon.moves.map((move) => {
        const eff = getTypeEffectiveness(move.type, oppTypes);
        const isStab = playerTypes.includes(move.type);
        const effectivePower = (move.power || 0) * eff * (isStab ? 1.5 : 1);
        return { move, eff, isStab, effectivePower };
      });

      moveEvaluations.sort((a, b) => b.effectivePower - a.effectivePower);
      const bestMove = moveEvaluations[0];

      let advice = `👨‍🔬 **오박사의 기술 전술 분석!**\n\n`;
      advice += `현재 상대인 **${activeOpponentPokemon.name}**(${oppTypes.join('/')})을 상대로는:\n\n`;

      if (bestMove && bestMove.effectivePower > 0) {
        advice += `⭐ **최우선 추천 기술:** **[${bestMove.move.name}]** (타입: ${bestMove.move.type}, 위력: ${bestMove.move.power})\n`;
        if (bestMove.eff >= 2) {
          advice += `🔥 **상성 배율: ${bestMove.eff}배 약점 찌르기!** ${bestMove.isStab ? '(자속 보정 1.5배 포함)' : ''}\n`;
        } else if (bestMove.eff === 1) {
          advice += `✔️ 상성 배율: 1.0배 정타 ${bestMove.isStab ? '(자속 보정 1.5배로 고위력)' : ''}\n`;
        } else {
          advice += `⚠️ 상성 배율이 ${bestMove.eff}배로 반감되니 주의하게나.\n`;
        }
      }

      advice += `\n💡 **기술 목록별 상성 효율:**\n`;
      moveEvaluations.forEach((item) => {
        const effText =
          item.eff >= 4
            ? '🔥 4배 초극딜'
            : item.eff === 2
            ? '⚡ 2배 약점'
            : item.eff === 1
            ? '🔹 1배 보통'
            : item.eff === 0.5
            ? '🔻 0.5배 반감'
            : item.eff === 0.25
            ? '🔻 0.25배 급감'
            : '❌ 0배 무효';
        advice += `- **${item.move.name}** (${item.move.type}): ${effText}\n`;
      });

      return advice;
    }

    if (query.includes('교체') || query.includes('막는') || query.includes('누구') || query.includes('카운터')) {
      // Find best bench pokemon against opponent
      const bench = (playerParty || []).filter((p) => p.currentHp > 0 && p.id !== activePlayerPokemon.id);
      
      let advice = `👨‍🔬 **오박사의 교체 전술 추천!**\n\n`;
      advice += `상대 **${activeOpponentPokemon.name}**(${oppTypes.join('/')})을 가장 안전하게 제압할 수 있는 파티원:\n\n`;

      if (bench.length === 0) {
        advice += `⚠️ 현재 교체 가능한 대기 포켓몬이 없네! ${activePlayerPokemon.name}의 혼신의 일격으로 돌파하게나!\n`;
      } else {
        const benchEvaluations = bench.map((pkmn) => {
          let defenseScore = 0; // lower damage received is better
          oppTypes.forEach((t) => {
            const incomingEff = getTypeEffectiveness(t, pkmn.types);
            if (incomingEff <= 0.5) defenseScore += 2;
            if (incomingEff === 0) defenseScore += 3;
            if (incomingEff >= 2) defenseScore -= 2;
          });

          // check offensive moves
          let bestOffense = 0;
          pkmn.moves.forEach((m) => {
            const offEff = getTypeEffectiveness(m.type, oppTypes);
            if (offEff > bestOffense) bestOffense = offEff;
          });

          return { pkmn, defenseScore, bestOffense, totalScore: defenseScore * 1.5 + bestOffense * 2 };
        });

        benchEvaluations.sort((a, b) => b.totalScore - a.totalScore);
        const top = benchEvaluations[0];

        advice += `🏆 **1순위 교체 추천: [${top.pkmn.name}]** (타입: ${top.pkmn.types.join('/')}, HP: ${top.pkmn.currentHp}/${top.pkmn.stats.hp})\n`;
        if (top.bestOffense >= 2) {
          advice += `⚔️ 상대 약점을 찌르는 **${top.bestOffense}배 고위력 기술**을 보유하고 있네!\n`;
        }
        if (top.defenseScore > 0) {
          advice += `🛡️ 상대의 자속 공격을 효과적으로 반감/무효화할 수 있는 든든한 방패일세!\n`;
        }
      }

      return advice;
    }

    if (query.includes('공략') || query.includes('팁') || query.includes('사천왕') || query.includes('주의')) {
      return `👨‍🔬 **[${currentMaster.name} 사천왕전 핵심 브리핑]**\n\n` +
        `🚩 **관문 특화 타입:** ${currentMaster.specialtyTypes.join(', ')}\n` +
        `📝 **전술 지침:**\n` +
        `1. ${currentMaster.name}은(는) 주로 **${currentMaster.specialtyTypes.join(' & ')}** 타입 기술을 구사하네.\n` +
        `2. 상대 에이스 포켓몬의 위협적인 랭크업 기술(칼춤, 용의춤, 나비춤)을 허용하지 않도록 빠른 스피드로 선제공격하거나 약점 기술로 한 방에 쓰러뜨리는 것이 정석일세!\n` +
        `3. 특히 우리 파티의 약점 타입이 찔릴 때는 무리하게 버티지 말고, 반감으로 받아낼 수 있는 파티원으로 스마트하게 교체하게나!`;
    }
  }

  // General Pokemon knowledge & advice fallback
  if (query.includes('밸런스') || query.includes('파티') || query.includes('평가')) {
    const party = playerParty || [];
    const typeCount: Record<string, number> = {};
    party.forEach((p) => p.types.forEach((t) => (typeCount[t] = (typeCount[t] || 0) + 1)));
    const coveredTypes = Object.keys(typeCount);

    return `👨‍🔬 **오박사의 엔트리 6마리 밸런스 평가!**\n\n` +
      `📊 **현재 파티 속성 다양성:** ${coveredTypes.length}/18개 타입 보유 중\n` +
      `✔️ **포함된 타입들:** ${coveredTypes.join(', ')}\n\n` +
      `💡 **조언:**\n` +
      `- 사천왕 4명을 모두 돌파하려면 **격투/땅(바위 저격), 불꽃/전기(얼음/물 저격), 악/고스트(고스트 저격), 얼음/페어리/드래곤(용 저격)** 기술이 고루 분포되어 있어야 수월하다네!\n` +
      `- 한 타입에 3마리 이상 겹치지 않도록 방어 상성의 분산을 항상 체크하게나!`;
  }

  if (query.includes('상성') || query.includes('약점') || query.includes('배율')) {
    return `👨‍🔬 **오박사의 타입 상성 정밀 가이드!**\n\n` +
      `포켓몬 배틀의 승패는 **타입 상성**이 90%를 결정한다네!\n\n` +
      `🔥 **공격 배율:**\n` +
      `- **4배 초효과:** 복합 타입의 두 약점이 모두 겹칠 때 (예: 한카리아스(드래곤/땅)에게 얼음 공격)\n` +
      `- **2배 효과 발군:** 상대의 약점 타입으로 공격\n` +
      `- **1.5배 자속 보정(STAB):** 내 포켓몬의 타입과 사용하는 공격 기술의 타입이 일치할 때 데미지 +50%!\n` +
      `- **0.5배 / 0.25배 반감:** 상대가 저항하는 타입\n` +
      `- **0배 무효:** 노말↔고스트, 땅↔비행, 전기↔땅, 드래곤↔페어리, 독↔강철, 에스퍼↔악 등!\n\n` +
      `언제든 상단 헤더의 **[상성표]** 버튼을 눌러 전체 18타입 매트릭스를 확인하게나!`;
  }

  // Natural response for miscellaneous queries
  return `👨‍🔬 **오박사의 전술 조언:**\n\n` +
    `허허! 좋은 질문일세! "${userQuery}"에 대해 답변해주겠네.\n\n` +
    `1. **레벨 50 고정 룰:** 모든 포켓몬은 Lv.50 플랫 룰이 적용되므로, 순수 스탯과 스피드 우선권, 기술 위력이 승부를 좌우하네.\n` +
    `2. **선공권의 중요성:** 스피드가 빠른 포켓몬(팬텀, 포푸니라, 한카리아스)으로 먼저 약점을 찌르는 것이 가장 안전한 승리 공식일세!\n` +
    `3. **선공기 활용:** '아쿠아제트', '마탄펀치', '야습', '신속' 같은 우선도 +1 선공기는 딸피로 남은 상대를 마무리할 때 최고의 무기라네!\n\n` +
    `자네의 건승을 빌겠네! 힘내게나!`;
}
