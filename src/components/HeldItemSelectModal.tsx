import React, { useState, useMemo } from 'react';
import { PokemonData, HeldItem, HeldItemCategory } from '../types/pokemon';
import { ALL_HELD_ITEMS, getHeldItemById } from '../data/heldItems';
import { sounds } from '../utils/soundEffects';
import {
  X,
  Search,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Shield,
  Zap,
  Repeat,
  Trash2,
  Info,
} from 'lucide-react';

interface HeldItemSelectModalProps {
  pokemon: PokemonData;
  party: PokemonData[];
  onSelectHeldItem: (pokemonId: string, itemId: string | undefined, swappedPokemonId?: string) => void;
  onClose: () => void;
}

const CATEGORY_TABS: { id: HeldItemCategory | 'all'; name: string; icon: string }[] = [
  { id: 'all', name: '전체 도감', icon: '🎒' },
  { id: 'defensive', name: '방어/내구', icon: '🛡️' },
  { id: 'offensive', name: '화력/공격', icon: '⚔️' },
  { id: 'choice', name: '구애 시리즈', icon: '🥋' },
  { id: 'recovery', name: '회복/열매', icon: '🍎' },
  { id: 'tactical', name: '전술/특수', icon: '✨' },
];

export const HeldItemSelectModal: React.FC<HeldItemSelectModalProps> = ({
  pokemon,
  party,
  onSelectHeldItem,
  onClose,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<HeldItemCategory | 'all'>('all');

  const currentItem = getHeldItemById(pokemon.item);

  // Filtered items list
  const filteredItems = useMemo(() => {
    return ALL_HELD_ITEMS.filter((item) => {
      const matchesSearch =
        item.name.includes(searchTerm.trim()) ||
        item.nameEn.toLowerCase().includes(searchTerm.toLowerCase().trim()) ||
        item.description.includes(searchTerm.trim());
      const matchesCategory =
        selectedCategory === 'all' || item.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, selectedCategory]);

  // Find if this item is held by another team member
  const getHoldingMember = (itemId: string): PokemonData | undefined => {
    return party.find((p) => p.id !== pokemon.id && p.item === itemId);
  };

  const handleEquip = (item: HeldItem) => {
    sounds.playClick();
    const otherHolder = getHoldingMember(item.id);
    if (otherHolder) {
      // Swap item with the other Pokémon
      onSelectHeldItem(pokemon.id, item.id, otherHolder.id);
    } else {
      onSelectHeldItem(pokemon.id, item.id);
    }
    onClose();
  };

  const handleUnequip = () => {
    sounds.playClick();
    onSelectHeldItem(pokemon.id, undefined);
    onClose();
  };

  return (
    <div
      id="held-item-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-xs animate-fade-in"
      onClick={() => {
        sounds.playClick();
        onClose();
      }}
    >
      <div
        id="held-item-modal-content"
        className="relative w-full max-w-3xl bg-slate-900 border-4 border-black shadow-[8px_8px_0px_#000] text-slate-100 max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b-2 border-black bg-slate-950">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-900 border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_#000]">
              <img
                src={pokemon.officialArtwork}
                alt={pokemon.name}
                className="w-9 h-9 object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = pokemon.spriteFront;
                }}
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-white uppercase">
                  {pokemon.name} <span className="text-yellow-400">지닌물건 선택</span>
                </h3>
                <span className="text-[10px] font-mono px-1.5 py-0.2 bg-yellow-400 text-black font-black border border-black uppercase">
                  ITEM CLAUSE 적용
                </span>
              </div>
              <p className="text-xs text-slate-400">
                현재 장착: {currentItem ? `${currentItem.icon} ${currentItem.name}` : '장착된 아이템 없음 (빈 슬롯)'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {pokemon.item && (
              <button
                id="btn-unequip-item"
                onClick={handleUnequip}
                className="geo-btn px-2.5 py-1 bg-red-600 hover:bg-red-500 text-white text-xs font-black uppercase flex items-center gap-1 border-2 border-black cursor-pointer shadow-[2px_2px_0px_#000]"
                title="현재 장착된 아이템 해제"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>해제</span>
              </button>
            )}

            <button
              id="btn-close-item-modal"
              onClick={() => {
                sounds.playClick();
                onClose();
              }}
              className="p-1.5 bg-white hover:bg-slate-200 border-2 border-black text-black shadow-[2px_2px_0px_#000] cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Rule Banner */}
        <div className="bg-amber-950/70 border-b-2 border-black px-4 py-2 flex items-center justify-between text-xs text-amber-200">
          <div className="flex items-center gap-1.5">
            <Info className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              <strong>아이템 중복 금지 룰 (Item Clause):</strong> 파티 내 모든 포켓몬은 서로 다른 아이템을 지녀야 합니다.
            </span>
          </div>
          <span className="text-[11px] font-bold text-amber-300 hidden sm:inline">
            ※ 다른 포켓몬이 든 아이템 선택 시 1-클릭으로 안전하게 스왑됩니다.
          </span>
        </div>

        {/* Search & Category Filter */}
        <div className="p-4 bg-slate-950/80 border-b-2 border-black space-y-2.5">
          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="아이템 이름, 영문, 효과 키워드 검색 (예: 기합의띠, 스피드, 회복, 구애)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 bg-slate-900 border-2 border-black text-white placeholder:text-slate-500 text-xs font-bold focus:outline-hidden focus:border-yellow-400"
            />
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap items-center gap-1.5">
            {CATEGORY_TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  sounds.playClick();
                  setSelectedCategory(tab.id);
                }}
                className={`px-2.5 py-1 text-xs font-black border-2 border-black transition-all cursor-pointer flex items-center gap-1 ${
                  selectedCategory === tab.id
                    ? 'bg-yellow-400 text-black shadow-[2px_2px_0px_#000]'
                    : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Items Grid (Scrollable) */}
        <div className="p-4 overflow-y-auto space-y-2.5 flex-1 bg-slate-900">
          {filteredItems.length === 0 ? (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <p className="font-bold text-sm">검색 결과와 일치하는 지닌물건이 없습니다.</p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('all');
                }}
                className="text-xs text-yellow-400 hover:underline font-bold"
              >
                필터 초기화
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredItems.map((item) => {
                const isCurrent = pokemon.item === item.id;
                const otherHolder = getHoldingMember(item.id);

                return (
                  <div
                    key={item.id}
                    className={`p-3 border-2 transition-all flex flex-col justify-between space-y-2 shadow-[3px_3px_0px_#000] ${
                      isCurrent
                        ? 'bg-yellow-950/50 border-yellow-400'
                        : otherHolder
                        ? 'bg-slate-950 border-slate-700 opacity-90'
                        : 'bg-slate-950 border-black hover:border-slate-500'
                    }`}
                  >
                    {/* Item Title & Timing Badge */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl p-1 bg-slate-900 border border-black shadow-[1px_1px_0px_#000]">
                          {item.icon}
                        </span>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h4 className="text-sm font-black text-white">{item.name}</h4>
                            <span className="text-[10px] font-mono text-slate-400 font-bold">
                              ({item.nameEn})
                            </span>
                          </div>
                          <span className="text-[10px] font-bold text-yellow-400 block">
                            발동 타이밍: {item.triggerTiming}
                          </span>
                        </div>
                      </div>

                      {/* Consumable or Passive Tag */}
                      <span
                        className={`text-[9px] font-black px-1.5 py-0.5 border border-black uppercase shrink-0 ${
                          item.isConsumable
                            ? 'bg-red-500/80 text-white'
                            : 'bg-blue-500/80 text-white'
                        }`}
                      >
                        {item.isConsumable ? '소모성 (1회용)' : '상시 지속'}
                      </span>
                    </div>

                    {/* Description */}
                    <p className="text-xs text-slate-300 leading-relaxed font-medium bg-slate-900/90 p-2 border border-slate-800">
                      {item.description}
                    </p>

                    {/* Action Button & Status */}
                    <div className="flex items-center justify-between pt-1 border-t border-slate-800/80">
                      {isCurrent ? (
                        <div className="flex items-center gap-1 text-xs font-black text-yellow-400">
                          <CheckCircle2 className="w-4 h-4 text-yellow-400" />
                          <span>현재 장착 중</span>
                        </div>
                      ) : otherHolder ? (
                        <div className="flex items-center gap-1.5 text-xs text-amber-300">
                          <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                          <span className="font-bold text-[11px] truncate max-w-[120px]">
                            {otherHolder.name} 장착 중
                          </span>
                        </div>
                      ) : (
                        <span className="text-[11px] font-bold text-green-400">
                          ✓ 장착 가능 (미사용)
                        </span>
                      )}

                      <button
                        id={`btn-equip-${item.id}`}
                        onClick={() => handleEquip(item)}
                        className={`geo-btn px-3 py-1 text-xs font-black uppercase flex items-center gap-1 cursor-pointer transition-all border-2 border-black ${
                          isCurrent
                            ? 'bg-yellow-400 text-black shadow-[2px_2px_0px_#000]'
                            : otherHolder
                            ? 'bg-amber-500 hover:bg-amber-400 text-black shadow-[2px_2px_0px_#000]'
                            : 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-[2px_2px_0px_#000]'
                        }`}
                      >
                        {isCurrent ? (
                          '선택됨'
                        ) : otherHolder ? (
                          <>
                            <Repeat className="w-3 h-3" />
                            <span>스왑 장착</span>
                          </>
                        ) : (
                          <span>장착하기</span>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
