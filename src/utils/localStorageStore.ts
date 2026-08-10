import { PokemonData, BaseStats, Move, EliteFourMaster, PokemonType } from '../types/pokemon';
import { ALL_POKEMON_DEFS, createPokemonInstance, calculateLv50Stats } from '../data/pokemonList';
import { MOVES_DATABASE } from '../data/moves';
import { getEliteFourMasters as getDefaultEliteMasters } from '../data/eliteFour';

// Storage Keys
const SETTINGS_KEY = 'pkmn_league_settings_v1';
const CUSTOM_POKEMON_KEY = 'pkmn_league_custom_pokemon_v1';
const CUSTOM_MOVES_KEY = 'pkmn_league_custom_moves_v1';
const ELITE_MASTERS_KEY = 'pkmn_league_elite_masters_v1';
const HALL_OF_FAME_KEY = 'pkmn_league_hall_of_fame_v1';

export interface GameSettings {
  levelRule: number; // e.g. 50
  difficulty: 'normal' | 'hardcore' | 'casual';
  autoHealBetweenStages: boolean; // true = full heal, false = nuzlocke survival
  battleSpeed: 'normal' | 'fast' | 'instant';
  permanentWeather: 'none' | 'sun' | 'rain' | 'sandstorm' | 'snow';
  soundMuted: boolean;
}

export interface HallOfFameEntry {
  id: string;
  clearedAt: string;
  totalTurns: number;
  difficulty: string;
  team: {
    id: string;
    dexNumber: number;
    name: string;
    types: PokemonType[];
    spriteFront: string;
  }[];
  mvpPokemonName: string;
}

export interface RawPokemonCustomDef {
  id: string;
  dexNumber: number;
  name: string;
  nameEn: string;
  types: PokemonType[];
  baseStats: BaseStats;
  moveKeys: string[];
  ability: { name: string; description: string };
  isCustom?: boolean;
}

const DEFAULT_SETTINGS: GameSettings = {
  levelRule: 50,
  difficulty: 'normal',
  autoHealBetweenStages: true,
  battleSpeed: 'normal',
  permanentWeather: 'none',
  soundMuted: false,
};

// Safe LocalStorage helpers
function readStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch (e) {
    console.warn(`Failed to parse localStorage key ${key}`, e);
    return fallback;
  }
}

function writeStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`Failed to write localStorage key ${key}`, e);
  }
}

// 1. Settings
export function getGameSettings(): GameSettings {
  return readStorage<GameSettings>(SETTINGS_KEY, DEFAULT_SETTINGS);
}

export function saveGameSettings(settings: Partial<GameSettings>): GameSettings {
  const current = getGameSettings();
  const updated = { ...current, ...settings };
  writeStorage(SETTINGS_KEY, updated);
  return updated;
}

// 2. Custom Moves
export function getAllMovesMap(): Record<string, Move> {
  const customMoves = readStorage<Record<string, Move>>(CUSTOM_MOVES_KEY, {});
  return { ...MOVES_DATABASE, ...customMoves };
}

export function saveCustomMove(move: Move): void {
  const current = readStorage<Record<string, Move>>(CUSTOM_MOVES_KEY, {});
  current[move.id] = move;
  writeStorage(CUSTOM_MOVES_KEY, current);
}

export function deleteCustomMove(moveId: string): void {
  const current = readStorage<Record<string, Move>>(CUSTOM_MOVES_KEY, {});
  delete current[moveId];
  writeStorage(CUSTOM_MOVES_KEY, current);
}

export function resetMovesToDefault(): void {
  localStorage.removeItem(CUSTOM_MOVES_KEY);
}

// 3. Pokemon Definitions & Instances
export function getAllPokemonDefs(): RawPokemonCustomDef[] {
  const customDefs = readStorage<RawPokemonCustomDef[]>(CUSTOM_POKEMON_KEY, []);
  
  // Base map of default pokemon
  const defsMap = new Map<string, RawPokemonCustomDef>();
  for (const def of ALL_POKEMON_DEFS) {
    defsMap.set(def.id, { ...def, isCustom: false });
  }

  // Override or add custom ones
  for (const custom of customDefs) {
    defsMap.set(custom.id, { ...custom, isCustom: true });
  }

  return Array.from(defsMap.values());
}

export function getPlayablePokemonList(): PokemonData[] {
  const defs = getAllPokemonDefs();
  const movesMap = getAllMovesMap();

  return defs.map((raw) => {
    const stats = calculateLv50Stats(raw.baseStats);
    const moves: Move[] = raw.moveKeys.map((key) => {
      const moveDef = movesMap[key] || movesMap.body_slam || MOVES_DATABASE.body_slam;
      return { ...moveDef, pp: moveDef.maxPp };
    });

    return {
      id: raw.id,
      dexNumber: raw.dexNumber,
      name: raw.name,
      nameEn: raw.nameEn,
      types: [...raw.types],
      baseStats: { ...raw.baseStats },
      stats: { ...stats },
      moves,
      currentHp: stats.hp,
      ability: { ...raw.ability },
      spriteFront: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${raw.dexNumber}.png`,
      spriteBack: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/back/${raw.dexNumber}.png`,
      officialArtwork: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${raw.dexNumber}.png`,
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
  });
}

export function getPokemonByIdDynamic(id: string): PokemonData {
  const all = getPlayablePokemonList();
  const found = all.find((p) => p.id === id);
  if (found) return { ...found };
  return { ...all[0] };
}

export const getStoredPokemonById = getPokemonByIdDynamic;

export function savePokemonDef(pokemonDef: RawPokemonCustomDef): void {
  const current = readStorage<RawPokemonCustomDef[]>(CUSTOM_POKEMON_KEY, []);
  const existingIdx = current.findIndex((p) => p.id === pokemonDef.id);
  if (existingIdx >= 0) {
    current[existingIdx] = { ...pokemonDef, isCustom: true };
  } else {
    current.push({ ...pokemonDef, isCustom: true });
  }
  writeStorage(CUSTOM_POKEMON_KEY, current);
}

export function deleteCustomPokemon(id: string): void {
  const current = readStorage<RawPokemonCustomDef[]>(CUSTOM_POKEMON_KEY, []);
  const filtered = current.filter((p) => p.id !== id);
  writeStorage(CUSTOM_POKEMON_KEY, filtered);
}

export function resetPokemonToDefault(): void {
  localStorage.removeItem(CUSTOM_POKEMON_KEY);
}

// 4. Elite Four Masters
export function getStoredEliteMasters(): EliteFourMaster[] {
  const custom = readStorage<EliteFourMaster[] | null>(ELITE_MASTERS_KEY, null);
  if (custom && Array.isArray(custom) && custom.length === 4) {
    return custom;
  }
  return getDefaultEliteMasters();
}

export function saveEliteMasters(masters: EliteFourMaster[]): void {
  writeStorage(ELITE_MASTERS_KEY, masters);
}

export function resetEliteMasters(): void {
  localStorage.removeItem(ELITE_MASTERS_KEY);
}

// 5. Hall of Fame
export function getHallOfFameRecords(): HallOfFameEntry[] {
  return readStorage<HallOfFameEntry[]>(HALL_OF_FAME_KEY, []);
}

export function addHallOfFameRecord(record: Omit<HallOfFameEntry, 'id' | 'clearedAt'>): void {
  const current = getHallOfFameRecords();
  const newEntry: HallOfFameEntry = {
    ...record,
    id: `hof_${Date.now()}`,
    clearedAt: new Date().toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }),
  };
  current.unshift(newEntry);
  writeStorage(HALL_OF_FAME_KEY, current.slice(0, 50)); // store up to 50 runs
}

export function recordHallOfFameVictory(
  party: PokemonData[],
  totalTurns: number,
  difficulty: string
): void {
  const team = party.map((p) => ({
    id: p.id,
    dexNumber: p.dexNumber,
    name: p.name,
    types: p.types,
    spriteFront: p.spriteFront,
  }));
  addHallOfFameRecord({
    totalTurns,
    difficulty,
    team,
    mvpPokemonName: party[0]?.name || '챔피언',
  });
}

export function clearHallOfFameRecords(): void {
  localStorage.removeItem(HALL_OF_FAME_KEY);
}

// 6. Complete League Data Backup & Restore
export interface LeagueExportPackage {
  version: string;
  exportedAt: string;
  settings: GameSettings;
  customPokemon: RawPokemonCustomDef[];
  customMoves: Record<string, Move>;
  eliteMasters: EliteFourMaster[] | null;
  hallOfFame: HallOfFameEntry[];
}

export function exportAllLeagueData(): string {
  const pkg: LeagueExportPackage = {
    version: '1.0.0',
    exportedAt: new Date().toISOString(),
    settings: getGameSettings(),
    customPokemon: readStorage<RawPokemonCustomDef[]>(CUSTOM_POKEMON_KEY, []),
    customMoves: readStorage<Record<string, Move>>(CUSTOM_MOVES_KEY, {}),
    eliteMasters: readStorage<EliteFourMaster[] | null>(ELITE_MASTERS_KEY, null),
    hallOfFame: getHallOfFameRecords(),
  };
  return JSON.stringify(pkg, null, 2);
}

export function importAllLeagueData(jsonStr: string): { success: boolean; message: string } {
  try {
    const parsed = JSON.parse(jsonStr) as Partial<LeagueExportPackage>;
    if (!parsed) throw new Error('유효하지 않은 데이터 형식입니다.');

    if (parsed.settings) writeStorage(SETTINGS_KEY, parsed.settings);
    if (parsed.customPokemon) writeStorage(CUSTOM_POKEMON_KEY, parsed.customPokemon);
    if (parsed.customMoves) writeStorage(CUSTOM_MOVES_KEY, parsed.customMoves);
    if (parsed.eliteMasters) writeStorage(ELITE_MASTERS_KEY, parsed.eliteMasters);
    if (parsed.hallOfFame) writeStorage(HALL_OF_FAME_KEY, parsed.hallOfFame);

    return { success: true, message: '리그 데이터 및 관리자 설정이 성공적으로 복원되었습니다!' };
  } catch (e: any) {
    return { success: false, message: `복원 실패: ${e?.message || 'JSON 파싱 오류'}` };
  }
}

export function resetEntireLeagueToFactory(): void {
  localStorage.removeItem(SETTINGS_KEY);
  localStorage.removeItem(CUSTOM_POKEMON_KEY);
  localStorage.removeItem(CUSTOM_MOVES_KEY);
  localStorage.removeItem(ELITE_MASTERS_KEY);
  localStorage.removeItem(HALL_OF_FAME_KEY);
}
