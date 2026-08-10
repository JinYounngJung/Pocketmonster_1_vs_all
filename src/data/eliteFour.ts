import { EliteFourMaster, PokemonData } from '../types/pokemon';
import { calculateLv50Stats } from './pokemonList';
import { MOVES_DATABASE } from './moves';

function makeElitePokemon(
  id: string,
  dexNumber: number,
  name: string,
  nameEn: string,
  types: ('노말' | '불꽃' | '물' | '풀' | '전기' | '얼음' | '격투' | '독' | '땅' | '비행' | '에스퍼' | '벌레' | '바위' | '고스트' | '드래곤' | '악' | '강철' | '페어리')[],
  baseStats: { hp: number; attack: number; defense: number; spAttack: number; spDefense: number; speed: number },
  moveKeys: string[],
  ability: { name: string; description: string }
): PokemonData {
  const stats = calculateLv50Stats(baseStats);
  const moves = moveKeys.map((key) => {
    const moveDef = MOVES_DATABASE[key] || MOVES_DATABASE.body_slam;
    return { ...moveDef, pp: moveDef.maxPp };
  });

  return {
    id: `elite_${id}`,
    dexNumber,
    name,
    nameEn,
    types,
    baseStats,
    stats,
    moves,
    currentHp: stats.hp,
    ability,
    spriteFront: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${dexNumber}.png`,
    spriteBack: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/back/${dexNumber}.png`,
    officialArtwork: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${dexNumber}.png`,
    status: 'none',
    statusTurns: 0,
    statStages: {
      attack: 0,
      defense: 0,
      spAttack: 0,
      spDefense: 0,
      speed: 0,
      accuracy: 0,
      evasion: 0,
    },
  };
}

export function getEliteFourMasters(): EliteFourMaster[] {
  return [
    {
      id: 'elite_1_bruno',
      stage: 1,
      name: '시바 (Bruno)',
      title: '제1관문: 불굴의 강권 사천왕',
      specialty: '바위 & 격투',
      specialtyTypes: ['바위', '격투'],
      avatar: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/trainers/bruno.png',
      themeColor: 'from-amber-600 to-stone-800',
      bgGradient: 'from-amber-950 via-stone-900 to-black',
      introQuote: '단련된 육체와 강철같은 정신이야말로 배틀의 본질이다! 나의 바위와 주먹을 뚫어보아라!',
      defeatQuote: '크윽...! 너와 네 포켓몬의 유대와 전술... 진정으로 훌륭했다!',
      badge: {
        name: '브레이브 배지',
        icon: 'ShieldAlert',
        color: '#d97706',
      },
      team: [
        makeElitePokemon(
          'hariyama',
          297,
          '하리뭉',
          'Hariyama',
          ['격투'],
          { hp: 144, attack: 120, defense: 60, spAttack: 40, spDefense: 60, speed: 50 },
          ['close_combat', 'knock_off', 'earthquake', 'bullet_punch'],
          { name: '두꺼운지방', description: '불꽃과 얼음 기술의 피해를 절반으로 줄인다.' }
        ),
        makeElitePokemon(
          'machamp',
          68,
          '괴력몬',
          'Machamp',
          ['격투'],
          { hp: 90, attack: 130, defense: 80, spAttack: 65, spDefense: 85, speed: 55 },
          ['dynamic_punch', 'stone_edge', 'poison_jab', 'bullet_punch'],
          { name: '노가드', description: '자신과 상대의 모든 기술이 필중한다.' }
        ),
        makeElitePokemon(
          'rhyperior',
          464,
          '거대코뿌리',
          'Rhyperior',
          ['땅', '바위'],
          { hp: 115, attack: 140, defense: 130, spAttack: 55, spDefense: 55, speed: 40 },
          ['earthquake', 'stone_edge', 'ice_shard', 'swords_dance'],
          { name: '하드록', description: '약점 공격으로 받는 피해를 25% 경감한다.' }
        ),
        makeElitePokemon(
          'lucario',
          448,
          '루카리오',
          'Lucario',
          ['격투', '강철'],
          { hp: 70, attack: 110, defense: 70, spAttack: 115, spDefense: 70, speed: 90 },
          ['aura_sphere', 'flash_cannon', 'bullet_punch', 'nasty_plot'],
          { name: '불굴의마음', description: '기세로 상대를 제압한다.' }
        ),
        makeElitePokemon(
          'tyranitar',
          248,
          '마기라스 (에이스)',
          'Tyranitar',
          ['바위', '악'],
          { hp: 100, attack: 134, defense: 110, spAttack: 95, spDefense: 100, speed: 61 },
          ['stone_edge', 'crunch', 'earthquake', 'dragon_dance'],
          { name: '모래날림', description: '모래바람으로 바위 타입 특방을 50% 상승시킨다.' }
        ),
      ],
    },
    {
      id: 'elite_2_lorelei',
      stage: 2,
      name: '칸나 (Lorelei)',
      title: '제2관문: 냉철한 빙설 사천왕',
      specialty: '얼음 & 물',
      specialtyTypes: ['얼음', '물'],
      avatar: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/trainers/lorelei.png',
      themeColor: 'from-cyan-500 to-blue-800',
      bgGradient: 'from-cyan-950 via-slate-900 to-black',
      introQuote: '얼음은 냉정하고 아름답지만, 방심하는 순간 온몸을 얼어붙게 만들죠. 어디 버텨보시겠어요?',
      defeatQuote: '내 얼음벽을 이토록 뜨거운 전략으로 녹여버리다니... 인정할 수밖에 없군요.',
      badge: {
        name: '글라시아 배지',
        icon: 'Snowflake',
        color: '#06b6d4',
      },
      team: [
        makeElitePokemon(
          'cloyster',
          91,
          '파르셀',
          'Cloyster',
          ['물', '얼음'],
          { hp: 50, attack: 95, defense: 180, spAttack: 85, spDefense: 45, speed: 70 },
          ['icicle_crash', 'hydro_pump', 'ice_shard', 'toxic'],
          { name: '스킬링크', description: '연속 공격기의 위력을 극한으로 끌어낸다.' }
        ),
        makeElitePokemon(
          'glaceon',
          471,
          '글레이시아',
          'Glaceon',
          ['얼음'],
          { hp: 65, attack: 60, defense: 110, spAttack: 130, spDefense: 95, speed: 65 },
          ['blizzard', 'shadow_ball', 'calm_mind', 'ice_beam'],
          { name: '눈숨기', description: '눈보라 속에서 회피율을 높인다.' }
        ),
        makeElitePokemon(
          'mamoswine',
          473,
          '맘모꾸리',
          'Mamoswine',
          ['얼음', '땅'],
          { hp: 110, attack: 130, defense: 80, spAttack: 70, spDefense: 60, speed: 80 },
          ['earthquake', 'icicle_crash', 'ice_shard', 'knock_off'],
          { name: '두꺼운지방', description: '불꽃과 얼음 피해를 50% 반감한다.' }
        ),
        makeElitePokemon(
          'azumarill',
          184,
          '마릴리',
          'Azumarill',
          ['물', '페어리'],
          { hp: 100, attack: 50, defense: 80, spAttack: 60, spDefense: 80, speed: 50 },
          ['play_rough', 'waterfall', 'aqua_jet', 'superpower'].map(k => k === 'superpower' ? 'close_combat' : k),
          { name: '천하장사', description: '물리 공격력이 2배로 폭증한다.' }
        ),
        makeElitePokemon(
          'lapras',
          131,
          '라프라스 (에이스)',
          'Lapras',
          ['물', '얼음'],
          { hp: 130, attack: 85, defense: 80, spAttack: 85, spDefense: 95, speed: 60 },
          ['hydro_pump', 'blizzard', 'thunderbolt', 'recover'],
          { name: '저수', description: '물 공격을 받으면 HP를 회복한다.' }
        ),
      ],
    },
    {
      id: 'elite_3_kage',
      stage: 3,
      name: '카게 (Shadow Ghost)',
      title: '제3관문: 심연의 그림자 사천왕',
      specialty: '고스트 & 악',
      specialtyTypes: ['고스트', '악'],
      avatar: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/trainers/agatha.png',
      themeColor: 'from-purple-600 to-violet-950',
      bgGradient: 'from-violet-950 via-neutral-900 to-black',
      introQuote: '어둠 속을 엿보는 자여... 네 등 뒤의 그림자가 삼켜지는 공포를 맛보게 해주마!',
      defeatQuote: '큭큭큭... 내 영혼의 환영마저 꿰뚫다니... 다음의 용족 패왕을 상대로도 통할까?!',
      badge: {
        name: '나이트메어 배지',
        icon: 'Ghost',
        color: '#9333ea',
      },
      team: [
        makeElitePokemon(
          'weavile',
          461,
          '포푸니라',
          'Weavile',
          ['악', '얼음'],
          { hp: 70, attack: 120, defense: 65, spAttack: 45, spDefense: 85, speed: 125 },
          ['knock_off', 'icicle_crash', 'ice_shard', 'swords_dance'],
          { name: '프레셔', description: '상대의 PP 소모를 가속화한다.' }
        ),
        makeElitePokemon(
          'chandelure',
          609,
          '샹델라',
          'Chandelure',
          ['고스트', '불꽃'],
          { hp: 60, attack: 55, defense: 90, spAttack: 145, spDefense: 90, speed: 80 },
          ['shadow_ball', 'fire_blast', 'energy_ball', 'calm_mind'],
          { name: '타오르는불꽃', description: '불꽃 공격을 무효화하고 위력을 강화한다.' }
        ),
        makeElitePokemon(
          'mimikyu',
          778,
          '따라큐',
          'Mimikyu',
          ['고스트', '페어리'],
          { hp: 55, attack: 90, defense: 80, spAttack: 50, spDefense: 105, speed: 96 },
          ['play_rough', 'shadow_claw', 'shadow_sneak', 'swords_dance'],
          { name: '탈', description: '첫 1회의 공격 피해를 완벽히 무효화한다.' }
        ),
        makeElitePokemon(
          'hydreigon',
          635,
          '삼삼드래',
          'Hydreigon',
          ['악', '드래곤'],
          { hp: 92, attack: 105, defense: 90, spAttack: 125, spDefense: 90, speed: 98 },
          ['dark_pulse', 'draco_meteor', 'flamethrower', 'nasty_plot'],
          { name: '부유', description: '땅 타입 공격을 일절 받지 않는다.' }
        ),
        makeElitePokemon(
          'gengar',
          94,
          '팬텀 (에이스)',
          'Gengar',
          ['고스트', '독'],
          { hp: 60, attack: 65, defense: 60, spAttack: 130, spDefense: 75, speed: 110 },
          ['shadow_ball', 'sludge_bomb', 'thunderbolt', 'dazzling_gleam'],
          { name: '저주받은바디', description: '공격한 상대의 기술을 봉쇄한다.' }
        ),
      ],
    },
    {
      id: 'elite_4_drake',
      stage: 4,
      name: '드라케 (Drake)',
      title: '최종관문: 용의 패왕 사천왕 수장',
      specialty: '드래곤 & 불꽃',
      specialtyTypes: ['드래곤', '불꽃'],
      avatar: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/trainers/lance.png',
      themeColor: 'from-red-600 via-indigo-600 to-purple-900',
      bgGradient: 'from-red-950 via-slate-900 to-indigo-950',
      introQuote: '여기까지 도달한 자는 드물다! 용의 포효와 타오르는 불꽃의 패도를 보여주겠다! 전력으로 덤벼라!',
      defeatQuote: '훌륭하다 도전자여! 너의 뛰어난 상성 전략과 포켓몬과의 결속이 용의 숨결을 뛰어넘었다! 챔피언의 탄생이다!',
      badge: {
        name: '드래곤 엠퍼러 배지',
        icon: 'Crown',
        color: '#dc2626',
      },
      team: [
        makeElitePokemon(
          'volcarona',
          637,
          '불카모스',
          'Volcarona',
          ['벌레', '불꽃'],
          { hp: 85, attack: 60, defense: 65, spAttack: 135, spDefense: 105, speed: 100 },
          ['fiery_dance', 'bug_buzz', 'quiver_dance', 'giga_drain'],
          { name: '불꽃몸', description: '접촉한 상대에게 화상을 입힌다.' }
        ),
        makeElitePokemon(
          'charizard',
          6,
          '리자몽',
          'Charizard',
          ['불꽃', '비행'],
          { hp: 78, attack: 84, defense: 78, spAttack: 109, spDefense: 85, speed: 100 },
          ['overheat', 'air_slash', 'dragon_pulse', 'roost'],
          { name: '맹화', description: '위급 시 불꽃 위력이 1.5배가 된다.' }
        ),
        makeElitePokemon(
          'salamence',
          373,
          '보만다',
          'Salamence',
          ['드래곤', '비행'],
          { hp: 95, attack: 135, defense: 80, spAttack: 110, spDefense: 80, speed: 100 },
          ['outrage', 'earthquake', 'dragon_dance', 'flamethrower'],
          { name: '위협', description: '등장 시 상대의 공격을 1랭크 깎는다.' }
        ),
        makeElitePokemon(
          'dragonite',
          149,
          '망나뇽',
          'Dragonite',
          ['드래곤', '비행'],
          { hp: 91, attack: 134, defense: 95, spAttack: 100, spDefense: 100, speed: 80 },
          ['extreme_speed', 'outrage', 'earthquake', 'dragon_dance'],
          { name: '멀티스케일', description: '만피 시 받는 피해를 50% 감소한다.' }
        ),
        makeElitePokemon(
          'metagross',
          376,
          '메타그로스',
          'Metagross',
          ['강철', '에스퍼'],
          { hp: 80, attack: 135, defense: 130, spAttack: 95, spDefense: 90, speed: 70 },
          ['meteor_mash', 'zen_headbutt', 'earthquake', 'bullet_punch'],
          { name: '클리어바디', description: '능력치가 깎이지 않는다.' }
        ),
        makeElitePokemon(
          'garchomp',
          445,
          '한카리아스 (최강 에이스)',
          'Garchomp',
          ['드래곤', '땅'],
          { hp: 108, attack: 130, defense: 95, spAttack: 80, spDefense: 85, speed: 102 },
          ['earthquake', 'outrage', 'stone_edge', 'swords_dance'],
          { name: '까칠한피부', description: '접촉한 상대에게 날카로운 반동 피해를 준다.' }
        ),
      ],
    },
  ];
}

export const ELITE_FOUR_MASTERS: EliteFourMaster[] = getEliteFourMasters();
