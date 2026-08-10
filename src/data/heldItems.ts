import { HeldItem, PokemonData } from '../types/pokemon';

export const ALL_HELD_ITEMS: HeldItem[] = [
  // --- 1. 방어 / 내구 ---
  {
    id: 'focus_sash',
    name: '기합의띠',
    nameEn: 'Focus Sash',
    icon: '🎗️',
    category: 'defensive',
    description: '체력이 100% 가득 찬 상태에서 기절할 위력의 일격을 받으면 HP 1을 남기고 무조건 버텨낸다. (1회용)',
    triggerTiming: '일격 치명타 피격 시 (1회용)',
    isConsumable: true,
    color: 'border-amber-400 bg-amber-950/60 text-amber-300',
  },
  {
    id: 'assault_vest',
    name: '돌격조끼',
    nameEn: 'Assault Vest',
    icon: '🦺',
    category: 'defensive',
    description: '특수방어가 1.5배(50%) 상승하지만, 변화 기술(상태이상/랭크업/회복)을 사용할 수 없게 된다.',
    triggerTiming: '상시 적용 (특수방어 +50%)',
    isConsumable: false,
    color: 'border-blue-400 bg-blue-950/60 text-blue-300',
  },
  {
    id: 'light_clay',
    name: '빛의점토',
    nameEn: 'Light Clay',
    icon: '🧱',
    category: 'defensive',
    description: '빛의 보호막으로 감싸여 적에게 받는 물리 및 특수 공격 데미지를 15% 항시 경감한다.',
    triggerTiming: '피격 시 데미지 경감',
    isConsumable: false,
    color: 'border-yellow-300 bg-yellow-950/60 text-yellow-200',
  },

  // --- 2. 화력 / 공격 강화 ---
  {
    id: 'life_orb',
    name: '생명의구슬',
    nameEn: 'Life Orb',
    icon: '🔮',
    category: 'offensive',
    description: '모든 공격 기술의 위력이 1.3배(30%) 상승하지만, 공격할 때마다 자신의 최대 HP의 10%를 반동으로 잃는다.',
    triggerTiming: '공격 시 (+30% 위력 / 반동 10%)',
    isConsumable: false,
    color: 'border-purple-400 bg-purple-950/60 text-purple-300',
  },
  {
    id: 'expert_belt',
    name: '달인의띠',
    nameEn: 'Expert Belt',
    icon: '🥋',
    category: 'offensive',
    description: '상대의 약점을 찌르는 효과가 굉장한 기술을 사용할 때, 반동 페널티 없이 데미지가 1.2배(20%) 증가한다.',
    triggerTiming: '약점 공격 시 (+20% 위력)',
    isConsumable: false,
    color: 'border-red-400 bg-red-950/60 text-red-300',
  },
  {
    id: 'scope_lens',
    name: '초점렌즈',
    nameEn: 'Scope Lens',
    icon: '🎯',
    category: 'offensive',
    description: '급소 조준율이 1랭크 상승하여 크리티컬 히트 확률이 대폭 증가한다. (기본 6.25% ➜ 25%)',
    triggerTiming: '공격 시 (급소율 +1랭크)',
    isConsumable: false,
    color: 'border-orange-400 bg-orange-950/60 text-orange-300',
  },
  {
    id: 'legendary_plate',
    name: '타입강화 플레이트',
    nameEn: 'Type Plate',
    icon: '⚡',
    category: 'offensive',
    description: '자신의 본래 타입(자속성)과 일치하는 모든 공격 기술의 위력이 1.2배(20%) 증가한다.',
    triggerTiming: '자속 공격 기술 사용 시 (+20% 위력)',
    isConsumable: false,
    color: 'border-emerald-400 bg-emerald-950/60 text-emerald-300',
  },

  // --- 3. 구애 시리즈 ---
  {
    id: 'choice_band',
    name: '구애머리띠',
    nameEn: 'Choice Band',
    icon: '🤼',
    category: 'choice',
    description: '물리 공격력이 1.5배(50%) 강력해지지만, 교체하기 전까지 처음에 선택한 한 가지 기술만 연속해서 써야 한다.',
    triggerTiming: '상시 적용 (물리공격 +50% / 기술 고정)',
    isConsumable: false,
    color: 'border-red-500 bg-red-950/60 text-red-300',
  },
  {
    id: 'choice_specs',
    name: '구애안경',
    nameEn: 'Choice Specs',
    icon: '👓',
    category: 'choice',
    description: '특수공격력이 1.5배(50%) 강력해지지만, 교체하기 전까지 처음에 선택한 한 가지 기술만 연속해서 써야 한다.',
    triggerTiming: '상시 적용 (특수공격 +50% / 기술 고정)',
    isConsumable: false,
    color: 'border-cyan-400 bg-cyan-950/60 text-cyan-300',
  },
  {
    id: 'choice_scarf',
    name: '구애스카프',
    nameEn: 'Choice Scarf',
    icon: '🧣',
    category: 'choice',
    description: '실제 스피드가 1.5배(50%) 빨라져 상대보다 먼저 공격할 수 있지만, 교체 전까지 한 기술만 연속해서 써야 한다.',
    triggerTiming: '상시 적용 (스피드 +50% / 기술 고정)',
    isConsumable: false,
    color: 'border-teal-400 bg-teal-950/60 text-teal-300',
  },

  // --- 4. 회복 / 열매 ---
  {
    id: 'leftovers',
    name: '먹다남은음식',
    nameEn: 'Leftovers',
    icon: '🍎',
    category: 'recovery',
    description: '매 턴이 끝날 때마다 자신의 최대 체력의 1/16 (약 6.25%)을 지속적으로 회복한다.',
    triggerTiming: '매 턴 종료 시 (HP 회복)',
    isConsumable: false,
    color: 'border-green-400 bg-green-950/60 text-green-300',
  },
  {
    id: 'sitrus_berry',
    name: '자뭉열매',
    nameEn: 'Sitrus Berry',
    icon: '🍋',
    category: 'recovery',
    description: '체력이 절반(50%) 이하로 떨어졌을 때 즉시 열매를 먹고 최대 HP의 25%를 즉각 회복한다. (1회용)',
    triggerTiming: 'HP 50% 이하 도달 시 (1회용)',
    isConsumable: true,
    color: 'border-lime-400 bg-lime-950/60 text-lime-300',
  },
  {
    id: 'lum_berry',
    name: '리샘열매',
    nameEn: 'Lum Berry',
    icon: '🍇',
    category: 'recovery',
    description: '화상, 마비, 독, 수면, 동상 등 모든 상태이상에 걸리는 순간 즉시 스스로 치유한다. (1회용)',
    triggerTiming: '상태이상 감염 시 즉시 치유 (1회용)',
    isConsumable: true,
    color: 'border-violet-400 bg-violet-950/60 text-violet-300',
  },

  // --- 5. 전술 / 특수 ---
  {
    id: 'rocky_helmet',
    name: '울퉁불퉁멧',
    nameEn: 'Rocky Helmet',
    icon: '⛑️',
    category: 'tactical',
    description: '상대에게 물리 접촉 공격을 받았을 때, 가시가 돋쳐 공격한 상대에게 상대 최대 HP의 1/6 데미지를 반사한다.',
    triggerTiming: '물리 접촉 공격 피격 시 반사',
    isConsumable: false,
    color: 'border-amber-600 bg-amber-950/60 text-amber-200',
  },
  {
    id: 'weakness_policy',
    name: '약점보험',
    nameEn: 'Weakness Policy',
    icon: '🛡️',
    category: 'tactical',
    description: '약점(효과가 굉장한) 공격을 맞고 살아남으면, 공격력과 특수공격력이 즉시 2랭크씩 폭발적으로 상승한다. (1회용)',
    triggerTiming: '약점 공격 피격 후 생존 시 (1회용)',
    isConsumable: true,
    color: 'border-indigo-400 bg-indigo-950/60 text-indigo-300',
  },
  {
    id: 'air_balloon',
    name: '풍선',
    nameEn: 'Air Balloon',
    icon: '🎈',
    category: 'tactical',
    description: '공중에 둥둥 떠올라 땅 타입 기술에 완전 면역이 된다. 단, 임의의 직접 공격을 받으면 풍선이 터져 사라진다.',
    triggerTiming: '상시 (땅 면역) ➜ 피격 시 터짐',
    isConsumable: true,
    color: 'border-pink-400 bg-pink-950/60 text-pink-300',
  },
  {
    id: 'quick_claw',
    name: '선제공격손톱',
    nameEn: 'Quick Claw',
    icon: '🐾',
    category: 'tactical',
    description: '매 턴 20%의 확률로 손톱이 번쩍이며 스피드와 상관없이 상대보다 먼저 선제공격한다.',
    triggerTiming: '턴 시작 시 (20% 확률 선공)',
    isConsumable: false,
    color: 'border-yellow-400 bg-yellow-950/60 text-yellow-300',
  },
  {
    id: 'white_herb',
    name: '하양허브',
    nameEn: 'White Herb',
    icon: '🌿',
    category: 'tactical',
    description: '위협 특성이나 자해 반동 기술(인파이트, 오버히트, 용성군)로 능력치가 떨어졌을 때 원래대로 되돌린다. (1회용)',
    triggerTiming: '랭크 하락 발생 시 원복 (1회용)',
    isConsumable: true,
    color: 'border-emerald-300 bg-emerald-950/60 text-emerald-200',
  },
];

export function getHeldItemById(id?: string): HeldItem | undefined {
  if (!id) return undefined;
  return ALL_HELD_ITEMS.find((item) => item.id === id);
}

// Check if an item is already equipped by any other party member (Item Clause validation)
export function isItemEquippedInParty(
  itemId: string,
  party: PokemonData[],
  excludePokemonId?: string
): boolean {
  return party.some(
    (p) => p.id !== excludePokemonId && p.item === itemId
  );
}

// Find which Pokemon has this item equipped
export function getEquippedPokemonName(
  itemId: string,
  party: PokemonData[]
): string | undefined {
  const found = party.find((p) => p.item === itemId);
  return found?.name;
}

// Intelligent optimal item recommendation based on Pokemon stats and roles (No Duplicates)
export function getOptimalHeldItem(
  pokemon: PokemonData,
  alreadyEquippedItems: string[]
): HeldItem {
  const availableItems = ALL_HELD_ITEMS.filter(
    (item) => !alreadyEquippedItems.includes(item.id)
  );

  if (availableItems.length === 0) {
    return ALL_HELD_ITEMS[0];
  }

  const { attack, spAttack, speed, hp, defense, spDefense } = pokemon.stats;
  const isPhysical = attack > spAttack + 15;
  const isSpecial = spAttack > attack + 15;
  const isTank = hp >= 90 || (defense >= 100 && spDefense >= 90);
  const isFastAttacker = speed >= 100 && (attack >= 110 || spAttack >= 110);
  const hasWeakDefense = defense < 75 && spDefense < 75;

  // Specific Pokemon tailored setups
  const name = pokemon.name;

  const tryPick = (id: string): HeldItem | undefined => {
    return availableItems.find((i) => i.id === id);
  };

  // 1. Fragile glass cannons -> Focus Sash or Life Orb
  if (['팬텀', '개굴닌자', '포푸니라', '드래펄트', '루카리오'].includes(name) || hasWeakDefense) {
    const sash = tryPick('focus_sash');
    if (sash) return sash;
    const orb = tryPick('life_orb');
    if (orb) return orb;
  }

  // 2. Heavy bulky sweepers -> Weakness Policy or Assault Vest or Leftovers
  if (['한카리아스', '망나뇽', '마기라스', '메타그로스', '디아루가'].includes(name)) {
    const policy = tryPick('weakness_policy');
    if (policy) return policy;
    const scarf = tryPick('choice_scarf');
    if (scarf) return scarf;
    const vest = tryPick('assault_vest');
    if (vest) return vest;
  }

  // 3. Bulky Walls / Tanks -> Leftovers, Rocky Helmet, Sitrus Berry
  if (['밀로틱', '잠만보', '하마돈', '야도란', '너트령', '거북왕', '이상해꽃'].includes(name) || isTank) {
    const lefties = tryPick('leftovers');
    if (lefties) return lefties;
    const helmet = tryPick('rocky_helmet');
    if (helmet) return helmet;
    const sitrus = tryPick('sitrus_berry');
    if (sitrus) return sitrus;
  }

  // 4. Mimikyu / Setup Sweepers -> Life Orb, Lum Berry
  if (name === '따라큐' || name === '불카모스') {
    const orb = tryPick('life_orb');
    if (orb) return orb;
    const lum = tryPick('lum_berry');
    if (lum) return lum;
  }

  // 5. Huge Power Azumarill -> Choice Band or Sitrus Berry
  if (name === '마릴리') {
    const band = tryPick('choice_band');
    if (band) return band;
    const sitrus = tryPick('sitrus_berry');
    if (sitrus) return sitrus;
  }

  // 6. Fast Attackers
  if (isFastAttacker) {
    if (isPhysical) {
      const band = tryPick('choice_band');
      if (band) return band;
      const orb = tryPick('life_orb');
      if (orb) return orb;
      const belt = tryPick('expert_belt');
      if (belt) return belt;
    } else if (isSpecial) {
      const specs = tryPick('choice_specs');
      if (specs) return specs;
      const orb = tryPick('life_orb');
      if (orb) return orb;
    }
  }

  // 7. General offensive priority
  if (isPhysical) {
    const band = tryPick('choice_band') || tryPick('expert_belt') || tryPick('legendary_plate');
    if (band) return band;
  } else if (isSpecial) {
    const specs = tryPick('choice_specs') || tryPick('expert_belt') || tryPick('legendary_plate');
    if (specs) return specs;
  }

  // 8. General defensive / survival
  const fallback =
    tryPick('lum_berry') ||
    tryPick('sitrus_berry') ||
    tryPick('quick_claw') ||
    tryPick('scope_lens') ||
    tryPick('light_clay') ||
    availableItems[0];

  return fallback;
}

// Automatically equips unique, top-tier competitive items across the entire 6-member party (Strict Item Clause)
export function autoEquipOptimalPartyItems(party: PokemonData[]): PokemonData[] {
  const equippedItemIds: string[] = [];

  return party.map((member) => {
    const bestItem = getOptimalHeldItem(member, equippedItemIds);
    equippedItemIds.push(bestItem.id);
    return {
      ...member,
      item: bestItem.id,
      itemConsumed: false,
    };
  });
}
