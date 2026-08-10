import React, { useState, useMemo } from 'react';
import { PokemonData, PokemonType } from '../types/pokemon';
import { ALL_PLAYABLE_POKEMON, getPokemonById } from '../data/pokemonList';
import { getPlayablePokemonList, getStoredPokemonById } from '../utils/localStorageStore';
import { getHeldItemById } from '../data/heldItems';
import { PokemonCard } from './PokemonCard';
import { TypeBadge } from './TypeBadge';
import { HeldItemBadge } from './HeldItemBadge';
import { HeldItemSelectModal } from './HeldItemSelectModal';
import {
  Swords,
  Sparkles,
  Search,
  CheckCircle2,
  Trash2,
  HelpCircle,
  Dices,
  Flame,
  ArrowRight,
  Shield,
  Zap,
  Settings,
  Package,
} from 'lucide-react';
import { sounds } from '../utils/soundEffects';

interface PartyBuilderProps {
  party: PokemonData[];
  onSelectPokemon: (pokemon: PokemonData) => void;
  onRemovePokemon: (index: number) => void;
  onReorderLead: (index: number) => void;
  onSetParty: (party: PokemonData[]) => void;
  onStartChallenge: () => void;
  onOpenDetail: (pokemon: PokemonData) => void;
  onOpenOakChat: () => void;
  onOpenAdmin?: () => void;
}

const ALL_TYPES: PokemonType[] = [
  '노말', '불꽃', '물', '풀', '전기', '얼음', '격투', '독',
  '땅', '비행', '에스퍼', '벌레', '바위', '고스트', '드래곤', '악', '강철', '페어리'
];

export const PartyBuilder: React.FC<PartyBuilderProps> = ({
  party,
  onSelectPokemon,
  onRemovePokemon,
  onReorderLead,
  onSetParty,
  onStartChallenge,
  onOpenDetail,
  onOpenOakChat,
  onOpenAdmin,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<PokemonType | '전체'>('전체');
  const [selectedGen, setSelectedGen] = useState<'all' | 'legendary' | 'gen4' | 'gen1_3' | 'gen5_8'>('all');
  const [itemModalPokemon, setItemModalPokemon] = useState<PokemonData | null>(null);

  // All playable pokemon from local persistence
  const allPokemonPool = useMemo(() => {
    return getPlayablePokemonList();
  }, []);

  // Filtered list
  const filteredPokemon = useMemo(() => {
    return allPokemonPool.filter((pokemon) => {
      const matchesSearch =
        pokemon.name.includes(searchTerm.trim()) ||
        pokemon.nameEn.toLowerCase().includes(searchTerm.toLowerCase().trim());
      const matchesType =
        selectedType === '전체' || pokemon.types.includes(selectedType);

      let matchesGen = true;
      if (selectedGen === 'legendary') {
        matchesGen = !!pokemon.isLegendary;
      } else if (selectedGen === 'gen4') {
        matchesGen = pokemon.dexNumber >= 387 && pokemon.dexNumber <= 493;
      } else if (selectedGen === 'gen1_3') {
        matchesGen = pokemon.dexNumber <= 386;
      } else if (selectedGen === 'gen5_8') {
        matchesGen = pokemon.dexNumber >= 494;
      }

      return matchesSearch && matchesType && matchesGen;
    });
  }, [allPokemonPool, searchTerm, selectedType, selectedGen]);

  // Type coverage calculation for team
  const teamTypeCoverage = useMemo(() => {
    const coveredTypes = new Set<PokemonType>();
    party.forEach((p) => {
      p.moves.forEach((m) => {
        if (m.power > 0) {
          coveredTypes.add(m.type);
        }
      });
    });
    return Array.from(coveredTypes);
  }, [party]);

  // Handle equipping or swapping a held item
  const handleSelectHeldItem = (pokemonId: string, itemId: string | undefined, swappedPokemonId?: string) => {
    const targetMember = party.find((p) => p.id === pokemonId);
    const oldItem = targetMember?.item;

    const nextParty = party.map((p) => {
      if (p.id === pokemonId) {
        return { ...p, item: itemId, itemConsumed: false, choiceLockedMoveId: undefined };
      }
      if (swappedPokemonId && p.id === swappedPokemonId) {
        return { ...p, item: oldItem, itemConsumed: false, choiceLockedMoveId: undefined };
      }
      return p;
    });

    onSetParty(nextParty);
  };

  // Preset party generator with diverse held items
  const handleApplyPreset = (presetName: string) => {
    sounds.playClick();
    let ids: string[] = [];
    let defaultItems: { [id: string]: string } = {};

    if (presetName === 'legendary') {
      // Legendary and Mythical Gods
      ids = ['mewtwo', 'rayquaza', 'dialga', 'kyogre', 'zacian', 'arceus'];
      defaultItems = {
        mewtwo: 'choice_specs',
        rayquaza: 'life_orb',
        dialga: 'adamant_orb',
        kyogre: 'choice_scarf',
        zacian: 'focus_sash',
        arceus: 'leftovers',
      };
    } else if (presetName === 'sinnoh_allstar') {
      // 4th Generation Sinnoh Champions
      ids = ['infernape', 'empoleon', 'torterra', 'garchomp', 'lucario', 'roserade'];
      defaultItems = {
        infernape: 'choice_band',
        empoleon: 'leftovers',
        torterra: 'sitrus_berry',
        garchomp: 'life_orb',
        lucario: 'focus_sash',
        roserade: 'choice_specs',
      };
    } else if (presetName === 'balance') {
      // Balanced powerhouse
      ids = ['garchomp', 'charizard', 'lucario', 'milotic', 'mimikyu', 'volcarona'];
      defaultItems = {
        garchomp: 'life_orb',
        charizard: 'choice_specs',
        lucario: 'focus_sash',
        milotic: 'leftovers',
        mimikyu: 'lum_berry',
        volcarona: 'heavy_duty_boots',
      };
    } else if (presetName === 'hyper_offense') {
      // Fast sweeping offense
      ids = ['dragapult', 'weavile', 'cinderace', 'greninja', 'gengar', 'metagross'];
      defaultItems = {
        dragapult: 'choice_band',
        weavile: 'life_orb',
        cinderace: 'focus_sash',
        greninja: 'expert_belt',
        gengar: 'choice_specs',
        metagross: 'assault_vest',
      };
    } else if (presetName === 'anti_elite') {
      // Specifically tailored against the 4 Elite Four masters
      ids = ['lucario', 'gardevoir', 'tyranitar', 'mamoswine', 'chandelure', 'dragonite'];
      defaultItems = {
        lucario: 'focus_sash',
        gardevoir: 'choice_specs',
        tyranitar: 'smooth_rock',
        mamoswine: 'life_orb',
        chandelure: 'choice_scarf',
        dragonite: 'lum_berry',
      };
    } else if (presetName === 'random') {
      // 6 random unique
      const shuffled = [...allPokemonPool].sort(() => Math.random() - 0.5);
      const selected = shuffled.slice(0, 6);
      const itemsList = ['life_orb', 'focus_sash', 'leftovers', 'choice_band', 'choice_specs', 'lum_berry'];
      onSetParty(selected.map((p, idx) => ({ ...p, item: itemsList[idx], itemConsumed: false, choiceLockedMoveId: undefined })));
      return;
    }

    const newParty: PokemonData[] = [];
    ids.forEach((id) => {
      const base = getStoredPokemonById(id) || getPokemonById(id);
      if (base) {
        const item = defaultItems[id];
        newParty.push({ ...base, item, itemConsumed: false, choiceLockedMoveId: undefined });
      }
    });

    if (newParty.length === 6) {
      onSetParty(newParty);
    }
  };

  return (
    <div id="party-builder-view" className="w-full max-w-7xl mx-auto px-4 py-6 space-y-8 animate-fade-in">
      {/* Hero Welcome Banner with Geometric Balance styling */}
      <div className="relative bg-slate-900 border-4 border-black p-6 sm:p-8 shadow-[8px_8px_0px_#000] text-white">
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-8 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-yellow-400 border-2 border-black text-black text-xs font-black uppercase shadow-[2px_2px_0px_#000]">
                <Sparkles className="w-3.5 h-3.5" />
                <span>사천왕 리그 도장깨기 규칙 안내</span>
              </div>

              {onOpenAdmin && (
                <button
                  id="btn-hero-admin-open"
                  onClick={() => {
                    sounds.playClick();
                    onOpenAdmin();
                  }}
                  className="geo-btn inline-flex items-center gap-2 px-3.5 py-1.5 bg-yellow-400 hover:bg-yellow-300 border-2 border-black text-black text-xs font-black uppercase shadow-[3px_3px_0px_#000] cursor-pointer"
                >
                  <Settings className="w-4 h-4 text-black animate-spin-slow" />
                  <span>⚙️ 관리자 대시보드 (스탯/기술/사천왕 편집)</span>
                </button>
              )}
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
              도감에서 <span className="text-yellow-400">6마리의 정예 포켓몬</span>을 선택하세요!
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed font-medium">
              모든 포켓몬은 <strong className="text-yellow-400">Lv.50 고정 룰</strong>로 맞춰집니다.
              연이어 등장하는 4명의 사천왕(바위/격투 ➜ 얼음/물 ➜ 고스트/악 ➜ 드래곤/불꽃)의 상성을
              고려하여 공수 밸런스를 갖춘 파티를 편성하세요.
              <span className="text-green-400 font-bold block mt-1">
                ✓ 각 사천왕 격파 시 모든 파티원의 체력(HP)과 기술 PP가 100% 전자동 회복됩니다.
              </span>
            </p>

            {/* Quick Preset Buttons */}
            <div className="flex flex-wrap items-center gap-2 pt-2">
              <span className="text-xs text-yellow-400 font-black uppercase mr-1">빠른 추천 파티:</span>
              <button
                id="btn-preset-legendary"
                onClick={() => handleApplyPreset('legendary')}
                className="geo-btn px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-xs font-black uppercase text-black cursor-pointer shadow-[3px_3px_0px_#000] border-2 border-black"
              >
                👑 전설의 신화
              </button>
              <button
                id="btn-preset-sinnoh"
                onClick={() => handleApplyPreset('sinnoh_allstar')}
                className="geo-btn px-3 py-1.5 bg-yellow-400 hover:bg-yellow-300 text-xs font-black uppercase text-black cursor-pointer shadow-[3px_3px_0px_#000]"
              >
                ⭐ 4세대 신오
              </button>
              <button
                id="btn-preset-balance"
                onClick={() => handleApplyPreset('balance')}
                className="geo-btn px-3 py-1.5 bg-white hover:bg-yellow-400 text-xs font-black uppercase text-black cursor-pointer"
              >
                🏆 밸런스 정예
              </button>
              <button
                id="btn-preset-anti"
                onClick={() => handleApplyPreset('anti_elite')}
                className="geo-btn px-3 py-1.5 bg-white hover:bg-yellow-400 text-xs font-black uppercase text-black cursor-pointer"
              >
                🎯 사천왕 저격
              </button>
              <button
                id="btn-preset-offense"
                onClick={() => handleApplyPreset('hyper_offense')}
                className="geo-btn px-3 py-1.5 bg-white hover:bg-red-400 text-xs font-black uppercase text-black cursor-pointer"
              >
                ⚡ 고스핏 어태커
              </button>
              <button
                id="btn-preset-random"
                onClick={() => handleApplyPreset('random')}
                className="geo-btn px-3 py-1.5 bg-white hover:bg-slate-200 text-xs font-black uppercase text-black cursor-pointer flex items-center gap-1"
              >
                <Dices className="w-3.5 h-3.5 text-black" /> 랜덤 6마리
              </button>
            </div>
          </div>

          {/* Elite Four Road Preview */}
          <div className="lg:col-span-4 bg-slate-950 border-2 border-black p-4 shadow-[4px_4px_0px_#000] space-y-2.5">
            <span className="text-xs font-black text-yellow-400 uppercase block mb-1">격파할 4명의 사천왕 관문:</span>
            <div className="space-y-1.5 text-xs font-bold">
              <div className="flex items-center justify-between p-2 bg-stone-900 border border-black text-white">
                <span className="font-black text-amber-300">1관문: 시바</span>
                <div className="flex gap-1">
                  <TypeBadge type="바위" size="sm" />
                  <TypeBadge type="격투" size="sm" />
                </div>
              </div>
              <div className="flex items-center justify-between p-2 bg-slate-900 border border-black text-white">
                <span className="font-black text-cyan-300">2관문: 칸나</span>
                <div className="flex gap-1">
                  <TypeBadge type="얼음" size="sm" />
                  <TypeBadge type="물" size="sm" />
                </div>
              </div>
              <div className="flex items-center justify-between p-2 bg-purple-950 border border-black text-white">
                <span className="font-black text-purple-300">3관문: 카게</span>
                <div className="flex gap-1">
                  <TypeBadge type="고스트" size="sm" />
                  <TypeBadge type="악" size="sm" />
                </div>
              </div>
              <div className="flex items-center justify-between p-2 bg-red-950 border border-black text-white">
                <span className="font-black text-red-300">최종관문: 드라케</span>
                <div className="flex gap-1">
                  <TypeBadge type="드래곤" size="sm" />
                  <TypeBadge type="불꽃" size="sm" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Selected Team Dock (6 Slots) */}
      <div className="bg-slate-900 border-4 border-black p-5 shadow-[8px_8px_0px_#000]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-yellow-400 border-2 border-black text-black flex items-center justify-center font-black shadow-[2px_2px_0px_#000]">
              6
            </div>
            <div>
              <h3 className="text-base font-black text-white uppercase flex items-center gap-2">
                나의 출전 엔트리
                <span
                  className={`text-xs font-black px-2 py-0.5 border border-black uppercase ${
                    party.length === 6
                      ? 'bg-green-500 text-black shadow-[1px_1px_0px_#000]'
                      : 'bg-yellow-400 text-black shadow-[1px_1px_0px_#000]'
                  }`}
                >
                  {party.length} / 6 선택됨
                </span>
              </h3>
              <p className="text-xs text-slate-300 font-medium">
                1번 슬롯이 첫 선발 포켓몬으로 출전합니다. 카드를 클릭해 선발로 변경하거나 제외할 수 있습니다.
              </p>
            </div>
          </div>

          {/* Start Challenge CTA */}
          <div className="flex items-center gap-2">
            {party.length > 0 && (
              <button
                id="btn-clear-party"
                onClick={() => {
                  sounds.playClick();
                  onSetParty([]);
                }}
                className="geo-btn p-2.5 bg-red-600 hover:bg-red-500 text-white cursor-pointer"
                title="파티 비우기"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}

            <button
              id="btn-start-challenge"
              onClick={() => {
                sounds.playVictory();
                onStartChallenge();
              }}
              disabled={party.length !== 6}
              className={`px-6 py-3 font-black text-sm uppercase flex items-center gap-2 transition-all border-4 border-black ${
                party.length === 6
                  ? 'bg-yellow-400 hover:bg-yellow-300 text-black shadow-[6px_6px_0px_#000] active:translate-x-1 active:translate-y-1 active:shadow-[2px_2px_0px_#000] cursor-pointer'
                  : 'bg-slate-800 text-slate-500 border-slate-700 cursor-not-allowed opacity-50'
              }`}
            >
              <span>사천왕 도장깨기 도전 시작!</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 6 Slots Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {[0, 1, 2, 3, 4, 5].map((slotIdx) => {
            const member = party[slotIdx];
            return (
              <div
                key={slotIdx}
                className={`relative p-3 border-2 border-black transition-all flex flex-col items-center justify-between min-h-[140px] text-center shadow-[4px_4px_0px_#000] ${
                  member
                    ? slotIdx === 0
                      ? 'bg-amber-950/80 border-4 border-yellow-400'
                      : 'bg-slate-800'
                    : 'bg-slate-950/60 border-dashed border-slate-700 flex items-center justify-center'
                }`}
              >
                {member ? (
                  <>
                    {/* Slot badge */}
                    <div className="w-full flex items-center justify-between mb-1">
                      <span
                        className={`text-[9px] font-black px-1.5 py-0.2 border border-black uppercase ${
                          slotIdx === 0
                            ? 'bg-yellow-400 text-black'
                            : 'bg-slate-700 text-slate-200'
                        }`}
                      >
                        {slotIdx === 0 ? '★ 선발 1' : `#${slotIdx + 1}`}
                      </span>

                      <button
                        onClick={() => {
                          sounds.playClick();
                          onRemovePokemon(slotIdx);
                        }}
                        className="p-0.5 bg-red-600 hover:bg-red-500 border border-black text-white cursor-pointer"
                        title="파티에서 제외"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Member image */}
                    <div
                      className="cursor-pointer group relative my-1"
                      onClick={() => {
                        sounds.playClick();
                        onReorderLead(slotIdx);
                      }}
                      title="클릭하여 선발(1번)로 지정"
                    >
                      <img
                        src={member.officialArtwork}
                        alt={member.name}
                        className="w-16 h-16 object-contain group-hover:scale-110 transition-transform filter drop-shadow-xs"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = member.spriteFront;
                        }}
                      />
                    </div>

                    {/* Name & types */}
                    <div className="w-full">
                      <h4 className="text-xs font-black text-white truncate">{member.name}</h4>
                      <div className="flex justify-center gap-1 mt-1">
                        {member.types.map((t) => (
                          <TypeBadge key={t} type={t} size="sm" />
                        ))}
                      </div>
                    </div>

                    {/* Held Item Slot Button */}
                    <div className="w-full mt-2 pt-1.5 border-t border-slate-700/80">
                      {member.item ? (
                        <button
                          id={`btn-slot-item-${slotIdx}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            sounds.playClick();
                            setItemModalPokemon(member);
                          }}
                          className="w-full py-1 px-1.5 bg-slate-900 hover:bg-slate-800 border border-yellow-400/80 text-yellow-300 text-[10px] font-black flex items-center justify-between gap-1 cursor-pointer transition-colors shadow-[1px_1px_0px_#000]"
                          title="지닌물건 변경하기"
                        >
                          <span className="truncate flex items-center gap-1">
                            <span>{getHeldItemById(member.item)?.icon || '🎒'}</span>
                            <span className="truncate">{getHeldItemById(member.item)?.name || member.item}</span>
                          </span>
                          <span className="text-[8px] bg-yellow-400 text-black px-1 py-0.2 uppercase shrink-0 font-bold">
                            변경
                          </span>
                        </button>
                      ) : (
                        <button
                          id={`btn-slot-item-${slotIdx}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            sounds.playClick();
                            setItemModalPokemon(member);
                          }}
                          className="w-full py-1 px-1.5 bg-slate-900/90 hover:bg-yellow-400 hover:text-black text-slate-300 border border-dashed border-slate-500 text-[10px] font-black flex items-center justify-center gap-1 cursor-pointer transition-colors"
                          title="지닌물건 장착하기"
                        >
                          <Package className="w-3 h-3 text-yellow-400" />
                          <span>+ 아이템 장착</span>
                        </button>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center text-slate-500 space-y-1 py-4">
                    <span className="text-xl font-black">#{slotIdx + 1}</span>
                    <span className="text-[11px] font-bold uppercase">빈 슬롯</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Team Type Coverage Summary */}
        {party.length > 0 && (
          <div className="mt-4 pt-3 border-t-2 border-slate-700 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-300 font-bold">파티 공격 기술 커버리지 ({teamTypeCoverage.length}/18):</span>
              <div className="flex flex-wrap gap-1">
                {teamTypeCoverage.map((type) => (
                  <TypeBadge key={type} type={type} size="sm" />
                ))}
              </div>
            </div>

            <button
              onClick={onOpenOakChat}
              className="text-yellow-400 hover:text-yellow-300 font-black flex items-center gap-1 hover:underline cursor-pointer uppercase"
            >
              <Sparkles className="w-3.5 h-3.5" /> 오박사에게 파티 상성 평가받기
            </button>
          </div>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border-2 border-black p-4 shadow-[4px_4px_0px_#000] space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
            <input
              id="input-pokemon-search"
              type="text"
              placeholder="포켓몬 이름 / 영문 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-100 border-2 border-black text-black placeholder:text-slate-500 text-sm font-bold focus:outline-hidden focus:bg-white"
            />
          </div>

          {/* Counts */}
          <span className="text-xs font-black text-black uppercase">
            총 <strong className="text-red-600">{filteredPokemon.length}</strong>마리 포켓몬 이용 가능
          </span>
        </div>

        {/* Generation Filter Tabs */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-200">
          <span className="text-xs font-black text-slate-700 uppercase">분류 필터:</span>
          <button
            onClick={() => {
              sounds.playClick();
              setSelectedGen('all');
            }}
            className={`px-2.5 py-1 text-xs font-black uppercase border-2 border-black shadow-[2px_2px_0px_#000] cursor-pointer transition-all ${
              selectedGen === 'all'
                ? 'bg-slate-900 text-white'
                : 'bg-white hover:bg-slate-100 text-black'
            }`}
          >
            전체 도감 (100마리)
          </button>
          <button
            onClick={() => {
              sounds.playClick();
              setSelectedGen('legendary');
            }}
            className={`px-2.5 py-1 text-xs font-black uppercase border-2 border-black shadow-[2px_2px_0px_#000] cursor-pointer transition-all ${
              selectedGen === 'legendary'
                ? 'bg-amber-400 text-black font-extrabold scale-105 shadow-[3px_3px_0px_#000]'
                : 'bg-amber-100 hover:bg-amber-200 text-black'
            }`}
          >
            👑 전설/환상 포켓몬
          </button>
          <button
            onClick={() => {
              sounds.playClick();
              setSelectedGen('gen4');
            }}
            className={`px-2.5 py-1 text-xs font-black uppercase border-2 border-black shadow-[2px_2px_0px_#000] cursor-pointer transition-all ${
              selectedGen === 'gen4'
                ? 'bg-yellow-400 text-black font-extrabold scale-105'
                : 'bg-white hover:bg-slate-100 text-black'
            }`}
          >
            ⭐ 4세대 신오
          </button>
          <button
            onClick={() => {
              sounds.playClick();
              setSelectedGen('gen1_3');
            }}
            className={`px-2.5 py-1 text-xs font-black uppercase border-2 border-black shadow-[2px_2px_0px_#000] cursor-pointer transition-all ${
              selectedGen === 'gen1_3'
                ? 'bg-slate-900 text-white'
                : 'bg-white hover:bg-slate-100 text-black'
            }`}
          >
            1~3세대 클래식
          </button>
          <button
            onClick={() => {
              sounds.playClick();
              setSelectedGen('gen5_8');
            }}
            className={`px-2.5 py-1 text-xs font-black uppercase border-2 border-black shadow-[2px_2px_0px_#000] cursor-pointer transition-all ${
              selectedGen === 'gen5_8'
                ? 'bg-slate-900 text-white'
                : 'bg-white hover:bg-slate-100 text-black'
            }`}
          >
            5~9세대
          </button>
        </div>

        {/* Type Filter Pills */}
        <div className="flex flex-wrap gap-1.5 pb-1">
          <button
            onClick={() => {
              sounds.playClick();
              setSelectedType('전체');
            }}
            className={`px-3 py-1 text-xs font-black uppercase border-2 border-black shadow-[2px_2px_0px_#000] cursor-pointer transition-all ${
              selectedType === '전체'
                ? 'bg-yellow-400 text-black scale-105'
                : 'bg-white hover:bg-slate-100 text-black'
            }`}
          >
            전체 타입
          </button>
          {ALL_TYPES.map((type) => (
            <button
              key={type}
              onClick={() => {
                sounds.playClick();
                setSelectedType(type);
              }}
              className={`cursor-pointer transition-all ${
                selectedType === type ? 'scale-110' : 'opacity-85 hover:opacity-100'
              }`}
            >
              <TypeBadge type={type} size="sm" />
            </button>
          ))}
        </div>
      </div>

      {/* Pokemon Cards Roster Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        {filteredPokemon.map((pokemon) => {
          const partyIndex = party.findIndex((p) => p.id === pokemon.id);
          const isSelected = partyIndex !== -1;
          const isPartyFull = party.length >= 6;

          return (
            <PokemonCard
              key={pokemon.id}
              pokemon={pokemon}
              isSelected={isSelected}
              partyIndex={partyIndex}
              isPartyFull={isPartyFull}
              onToggleSelect={(p) => {
                if (isSelected) {
                  onRemovePokemon(partyIndex);
                } else {
                  onSelectPokemon(p);
                }
              }}
              onOpenDetail={onOpenDetail}
            />
          );
        })}
      </div>

      {/* Held Item Select Modal */}
      {itemModalPokemon && (
        <HeldItemSelectModal
          pokemon={itemModalPokemon}
          party={party}
          onSelectHeldItem={handleSelectHeldItem}
          onClose={() => setItemModalPokemon(null)}
        />
      )}
    </div>
  );
};
