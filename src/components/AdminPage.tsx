import React, { useState, useEffect, useMemo } from 'react';
import {
  PokemonData,
  Move,
  PokemonType,
  BaseStats,
  EliteFourMaster,
} from '../types/pokemon';
import {
  getGameSettings,
  saveGameSettings,
  GameSettings,
  getAllPokemonDefs,
  savePokemonDef,
  deleteCustomPokemon,
  resetPokemonToDefault,
  RawPokemonCustomDef,
  getAllMovesMap,
  saveCustomMove,
  deleteCustomMove,
  resetMovesToDefault,
  getStoredEliteMasters,
  saveEliteMasters,
  resetEliteMasters,
  getHallOfFameRecords,
  clearHallOfFameRecords,
  HallOfFameEntry,
  exportAllLeagueData,
  importAllLeagueData,
  resetEntireLeagueToFactory,
} from '../utils/localStorageStore';
import { calculateLv50Stats } from '../data/pokemonList';
import { TypeBadge } from './TypeBadge';
import { sounds } from '../utils/soundEffects';
import { bgmEngine, BGM_TRACKS } from '../utils/bgmEngine';
import { BgmPlayerWidget } from './BgmPlayerWidget';
import {
  Settings,
  Shield,
  Zap,
  Crown,
  Trophy,
  Save,
  RotateCcw,
  Plus,
  Trash2,
  Download,
  Upload,
  Search,
  CheckCircle,
  AlertTriangle,
  ArrowLeft,
  Sliders,
  Flame,
  Droplets,
  Wind,
  Snowflake,
  Sun,
  Edit3,
  Music,
  Play,
  Pause,
  Volume2,
  VolumeX,
} from 'lucide-react';

const ALL_TYPES: PokemonType[] = [
  '노말', '불꽃', '물', '풀', '전기', '얼음', '격투', '독', '땅',
  '비행', '에스퍼', '벌레', '바위', '고스트', '드래곤', '악', '강철', '페어리',
];

interface AdminPageProps {
  onBackToGame: () => void;
  onDataChanged: () => void;
}

type AdminTab = 'rules' | 'pokemon' | 'moves' | 'elite' | 'records';

export const AdminPage: React.FC<AdminPageProps> = ({ onBackToGame, onDataChanged }) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('rules');
  const [saveToast, setSaveToast] = useState<string | null>(null);

  // 1. Settings state
  const [settings, setSettings] = useState<GameSettings>(getGameSettings());

  // 2. Pokemon state
  const [pokemonList, setPokemonList] = useState<RawPokemonCustomDef[]>(getAllPokemonDefs());
  const [selectedPkmnId, setSelectedPkmnId] = useState<string>(pokemonList[0]?.id || 'garchomp');
  const [pkmnSearch, setPkmnSearch] = useState('');
  const [pkmnTypeFilter, setPkmnTypeFilter] = useState<PokemonType | '전체'>('전체');

  // Currently edited Pokemon
  const editingPokemon = useMemo(() => {
    return pokemonList.find((p) => p.id === selectedPkmnId) || pokemonList[0];
  }, [pokemonList, selectedPkmnId]);

  const [editPkmnName, setEditPkmnName] = useState(editingPokemon?.name || '');
  const [editPkmnNameEn, setEditPkmnNameEn] = useState(editingPokemon?.nameEn || '');
  const [editPkmnDex, setEditPkmnDex] = useState(editingPokemon?.dexNumber || 1);
  const [editPkmnTypes, setEditPkmnTypes] = useState<PokemonType[]>(editingPokemon?.types || ['노말']);
  const [editBaseStats, setEditBaseStats] = useState<BaseStats>(editingPokemon?.baseStats || {
    hp: 100, attack: 100, defense: 100, spAttack: 100, spDefense: 100, speed: 100,
  });
  const [editMoveKeys, setEditMoveKeys] = useState<string[]>(editingPokemon?.moveKeys || []);
  const [editAbilityName, setEditAbilityName] = useState(editingPokemon?.ability?.name || '');
  const [editAbilityDesc, setEditAbilityDesc] = useState(editingPokemon?.ability?.description || '');

  // 3. Moves state
  const [movesMap, setMovesMap] = useState<Record<string, Move>>(getAllMovesMap());
  const [selectedMoveId, setSelectedMoveId] = useState<string>('earthquake');
  const [moveSearch, setMoveSearch] = useState('');
  const [moveTypeFilter, setMoveTypeFilter] = useState<PokemonType | '전체'>('전체');

  const editingMove = useMemo(() => {
    return movesMap[selectedMoveId] || Object.values(movesMap)[0];
  }, [movesMap, selectedMoveId]);

  const [editMoveName, setEditMoveName] = useState(editingMove?.name || '');
  const [editMoveType, setEditMoveType] = useState<PokemonType>(editingMove?.type || '노말');
  const [editMoveCategory, setEditMoveCategory] = useState<'physical' | 'special' | 'status'>(editingMove?.category || 'physical');
  const [editMovePower, setEditMovePower] = useState<number>(editingMove?.power || 80);
  const [editMoveAccuracy, setEditMoveAccuracy] = useState<number>(editingMove?.accuracy || 100);
  const [editMovePp, setEditMovePp] = useState<number>(editingMove?.pp || 15);
  const [editMovePriority, setEditMovePriority] = useState<number>(editingMove?.priority || 0);
  const [editMoveDesc, setEditMoveDesc] = useState<string>(editingMove?.description || '');

  // 4. Elite Masters state
  const [eliteMasters, setEliteMasters] = useState<EliteFourMaster[]>(getStoredEliteMasters());
  const [selectedMasterIdx, setSelectedMasterIdx] = useState<number>(0);

  // 5. Hall of fame state
  const [hallOfFame, setHallOfFame] = useState<HallOfFameEntry[]>(getHallOfFameRecords());
  const [importJsonText, setImportJsonText] = useState('');

  // Sync editing forms when selection changes
  useEffect(() => {
    if (editingPokemon) {
      setEditPkmnName(editingPokemon.name);
      setEditPkmnNameEn(editingPokemon.nameEn);
      setEditPkmnDex(editingPokemon.dexNumber);
      setEditPkmnTypes([...editingPokemon.types]);
      setEditBaseStats({ ...editingPokemon.baseStats });
      setEditMoveKeys([...editingPokemon.moveKeys]);
      setEditAbilityName(editingPokemon.ability.name);
      setEditAbilityDesc(editingPokemon.ability.description);
    }
  }, [editingPokemon]);

  useEffect(() => {
    if (editingMove) {
      setEditMoveName(editingMove.name);
      setEditMoveType(editingMove.type);
      setEditMoveCategory(editingMove.category);
      setEditMovePower(editingMove.power || 0);
      setEditMoveAccuracy(editingMove.accuracy || 100);
      setEditMovePp(editingMove.pp || 15);
      setEditMovePriority(editingMove.priority || 0);
      setEditMoveDesc(editingMove.description || '');
    }
  }, [editingMove]);

  const showToast = (msg: string) => {
    setSaveToast(msg);
    setTimeout(() => setSaveToast(null), 3000);
  };

  // 1. Settings Save
  const handleSaveSettings = () => {
    sounds.playClick();
    saveGameSettings(settings);
    onDataChanged();
    showToast('⚙️ 게임 규칙 및 시스템 설정이 저장되었습니다!');
  };

  // 2. Pokemon Save
  const handleSavePokemon = () => {
    sounds.playClick();
    if (!editPkmnName.trim()) {
      alert('포켓몬 이름을 입력해주세요.');
      return;
    }

    const updatedDef: RawPokemonCustomDef = {
      id: editingPokemon.id,
      dexNumber: editPkmnDex,
      name: editPkmnName.trim(),
      nameEn: editPkmnNameEn.trim() || editPkmnName.trim(),
      types: editPkmnTypes.length > 0 ? editPkmnTypes : ['노말'],
      baseStats: editBaseStats,
      moveKeys: editMoveKeys.length > 0 ? editMoveKeys : ['body_slam'],
      ability: {
        name: editAbilityName.trim() || '특성',
        description: editAbilityDesc.trim() || '포켓몬의 고유 특성입니다.',
      },
      isCustom: true,
    };

    savePokemonDef(updatedDef);
    setPokemonList(getAllPokemonDefs());
    onDataChanged();
    showToast(`🐉 ${updatedDef.name}의 스탯 및 정보가 저장되었습니다!`);
  };

  const handleAddNewPokemon = () => {
    sounds.playClick();
    const newId = `custom_pkmn_${Date.now()}`;
    const newDef: RawPokemonCustomDef = {
      id: newId,
      dexNumber: 999,
      name: '새 커스텀 포켓몬',
      nameEn: 'New Custom Pokemon',
      types: ['드래곤', '불꽃'],
      baseStats: { hp: 100, attack: 120, defense: 90, spAttack: 120, spDefense: 90, speed: 100 },
      moveKeys: ['earthquake', 'flamethrower', 'outrage', 'swords_dance'],
      ability: { name: '초월적기세', description: '모든 공격의 위력이 1.2배 상승한다.' },
      isCustom: true,
    };

    savePokemonDef(newDef);
    const updated = getAllPokemonDefs();
    setPokemonList(updated);
    setSelectedPkmnId(newId);
    onDataChanged();
    showToast('✨ 새로운 커스텀 포켓몬이 등록되었습니다!');
  };

  const handleDeletePokemon = (id: string) => {
    sounds.playClick();
    if (confirm('이 커스텀 포켓몬을 삭제하시겠습니까?')) {
      deleteCustomPokemon(id);
      const updated = getAllPokemonDefs();
      setPokemonList(updated);
      setSelectedPkmnId(updated[0]?.id || 'charizard');
      onDataChanged();
      showToast('🗑️ 커스텀 포켓몬이 삭제되었습니다.');
    }
  };

  const handleResetPokemonDefaults = () => {
    sounds.playClick();
    if (confirm('모든 포켓몬 데이터를 원본 기본 데이터로 초기화하시겠습니까?')) {
      resetPokemonToDefault();
      const updated = getAllPokemonDefs();
      setPokemonList(updated);
      setSelectedPkmnId(updated[0]?.id || 'charizard');
      onDataChanged();
      showToast('🔄 모든 포켓몬이 원본 기본값으로 복원되었습니다.');
    }
  };

  // 3. Move Save
  const handleSaveMove = () => {
    sounds.playClick();
    if (!editMoveName.trim()) {
      alert('기술 이름을 입력해주세요.');
      return;
    }

    const updatedMove: Move = {
      ...editingMove,
      name: editMoveName.trim(),
      type: editMoveType,
      category: editMoveCategory,
      power: editMoveCategory === 'status' ? 0 : editMovePower,
      accuracy: editMoveAccuracy,
      pp: editMovePp,
      maxPp: editMovePp,
      priority: editMovePriority,
      description: editMoveDesc.trim(),
    };

    saveCustomMove(updatedMove);
    const updatedMoves = getAllMovesMap();
    setMovesMap(updatedMoves);
    onDataChanged();
    showToast(`⚡ 기술 [${updatedMove.name}]의 위력 및 정보가 저장되었습니다!`);
  };

  const handleAddNewMove = () => {
    sounds.playClick();
    const newId = `custom_move_${Date.now()}`;
    const newMove: Move = {
      id: newId,
      name: '새 커스텀 기술',
      type: '드래곤',
      category: 'physical',
      power: 120,
      accuracy: 100,
      pp: 10,
      maxPp: 10,
      priority: 0,
      description: '강력한 에너지를 실어 상대에게 막대한 피해를 입힌다.',
    };

    saveCustomMove(newMove);
    const updatedMoves = getAllMovesMap();
    setMovesMap(updatedMoves);
    setSelectedMoveId(newId);
    onDataChanged();
    showToast('✨ 새로운 커스텀 기술이 추가되었습니다!');
  };

  const handleDeleteMove = (id: string) => {
    sounds.playClick();
    if (confirm('이 기술을 삭제하시겠습니까?')) {
      deleteCustomMove(id);
      const updatedMoves = getAllMovesMap();
      setMovesMap(updatedMoves);
      setSelectedMoveId(Object.keys(updatedMoves)[0] || 'earthquake');
      onDataChanged();
      showToast('🗑️ 기술이 삭제되었습니다.');
    }
  };

  const handleResetMovesDefaults = () => {
    sounds.playClick();
    if (confirm('모든 기술 데이터를 원본 기본값으로 초기화하시겠습니까?')) {
      resetMovesToDefault();
      const updatedMoves = getAllMovesMap();
      setMovesMap(updatedMoves);
      setSelectedMoveId('earthquake');
      onDataChanged();
      showToast('🔄 모든 기술이 원본 기본값으로 복원되었습니다.');
    }
  };

  // 4. Elite Masters Save
  const handleSaveEliteMasters = () => {
    sounds.playClick();
    saveEliteMasters(eliteMasters);
    onDataChanged();
    showToast('👑 사천왕 엔트리 및 관문 데이터가 저장되었습니다!');
  };

  const handleResetEliteMasters = () => {
    sounds.playClick();
    if (confirm('사천왕 팀 구성을 원본 기본값으로 초기화하시겠습니까?')) {
      resetEliteMasters();
      setEliteMasters(getStoredEliteMasters());
      onDataChanged();
      showToast('🔄 사천왕 엔트리가 기본값으로 복원되었습니다.');
    }
  };

  // 5. Hall of Fame & JSON Export/Import
  const handleExportJson = () => {
    sounds.playClick();
    const json = exportAllLeagueData();
    navigator.clipboard.writeText(json);
    showToast('📋 전체 리그 설정 JSON이 클립보드에 복사되었습니다!');
  };

  const handleImportJson = () => {
    sounds.playClick();
    if (!importJsonText.trim()) {
      alert('복원할 JSON 데이터를 붙여넣어주세요.');
      return;
    }
    const result = importAllLeagueData(importJsonText);
    if (result.success) {
      setSettings(getGameSettings());
      setPokemonList(getAllPokemonDefs());
      setMovesMap(getAllMovesMap());
      setEliteMasters(getStoredEliteMasters());
      setHallOfFame(getHallOfFameRecords());
      onDataChanged();
      showToast(result.message);
      setImportJsonText('');
    } else {
      alert(result.message);
    }
  };

  const handleFactoryReset = () => {
    sounds.playClick();
    if (
      confirm(
        '⚠️ 경고: 모든 커스텀 포켓몬, 기술, 사천왕 수정사항, 명예의 전당 기록이 완전히 삭제되고 초기 상태로 복구됩니다. 계속하시겠습니까?'
      )
    ) {
      resetEntireLeagueToFactory();
      setSettings(getGameSettings());
      setPokemonList(getAllPokemonDefs());
      setMovesMap(getAllMovesMap());
      setEliteMasters(getStoredEliteMasters());
      setHallOfFame([]);
      onDataChanged();
      showToast('🚀 리그가 완전 초기화되었습니다.');
    }
  };

  // Filtered Pokemon List
  const filteredPokemonList = useMemo(() => {
    return pokemonList.filter((p) => {
      const matchSearch =
        p.name.toLowerCase().includes(pkmnSearch.toLowerCase()) ||
        p.nameEn.toLowerCase().includes(pkmnSearch.toLowerCase());
      const matchType = pkmnTypeFilter === '전체' || p.types.includes(pkmnTypeFilter);
      return matchSearch && matchType;
    });
  }, [pokemonList, pkmnSearch, pkmnTypeFilter]);

  // Filtered Moves List
  const allMovesArray = useMemo(() => Object.values(movesMap), [movesMap]);
  const filteredMovesList = useMemo(() => {
    return allMovesArray.filter((m) => {
      const matchSearch = m.name.toLowerCase().includes(moveSearch.toLowerCase());
      const matchType = moveTypeFilter === '전체' || m.type === moveTypeFilter;
      return matchSearch && matchType;
    });
  }, [allMovesArray, moveSearch, moveTypeFilter]);

  // Real-time calculated stats for preview
  const liveLv50Stats = useMemo(() => {
    return calculateLv50Stats(editBaseStats);
  }, [editBaseStats]);

  return (
    <div
      id="admin-dashboard-root"
      className="w-full max-w-7xl mx-auto px-4 py-6 animate-fade-in space-y-6 text-slate-100"
    >
      {/* Top Header Card */}
      <div className="bg-slate-900 border-4 border-black p-6 shadow-[8px_8px_0px_#000] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-yellow-400 border-4 border-black flex items-center justify-center shadow-[3px_3px_0px_#000] shrink-0">
            <Settings className="w-7 h-7 text-black stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-white uppercase tracking-tight">
                포켓몬 리그 <span className="text-yellow-400">관리자 대시보드</span>
              </h1>
              <span className="px-2 py-0.5 bg-yellow-400 border-2 border-black text-black font-black text-xs uppercase shadow-[1px_1px_0px_#000]">
                LOCAL PERSISTENCE
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 font-medium mt-0.5">
              게임 규칙, 포켓몬 종족값/기술, 사천왕 엔트리를 브라우저 localStorage에 실시간 저장 & 커스텀 관리
            </p>
          </div>
        </div>

        {/* Back to Game Button */}
        <button
          id="btn-admin-back-to-game"
          onClick={() => {
            sounds.playClick();
            onBackToGame();
          }}
          className="geo-btn flex items-center justify-center gap-2 px-5 py-3 bg-red-600 hover:bg-red-500 text-white font-black text-sm uppercase cursor-pointer shadow-[4px_4px_0px_#000] active:translate-x-0.5 active:translate-y-0.5"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>게임 화면으로 복귀</span>
        </button>
      </div>

      {/* Save Notification Toast */}
      {saveToast && (
        <div className="p-3 bg-green-500 border-2 border-black text-black font-black text-xs sm:text-sm flex items-center gap-2 shadow-[4px_4px_0px_#000] animate-bounce">
          <CheckCircle className="w-5 h-5" />
          <span>{saveToast}</span>
        </div>
      )}

      {/* Main Tab Navigation Buttons */}
      <div className="flex flex-wrap gap-2 border-b-2 border-black pb-2">
        <button
          id="tab-btn-rules"
          onClick={() => {
            sounds.playClick();
            setActiveTab('rules');
          }}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-black uppercase border-2 border-black shadow-[3px_3px_0px_#000] cursor-pointer transition-all ${
            activeTab === 'rules'
              ? 'bg-yellow-400 text-black scale-105 shadow-[4px_4px_0px_#000]'
              : 'bg-slate-900 text-white hover:bg-slate-800'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>1. 리그 규칙 & 시스템</span>
        </button>

        <button
          id="tab-btn-pokemon"
          onClick={() => {
            sounds.playClick();
            setActiveTab('pokemon');
          }}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-black uppercase border-2 border-black shadow-[3px_3px_0px_#000] cursor-pointer transition-all ${
            activeTab === 'pokemon'
              ? 'bg-yellow-400 text-black scale-105 shadow-[4px_4px_0px_#000]'
              : 'bg-slate-900 text-white hover:bg-slate-800'
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>2. 포켓몬 스탯/기술 편집기 ({pokemonList.length})</span>
        </button>

        <button
          id="tab-btn-moves"
          onClick={() => {
            sounds.playClick();
            setActiveTab('moves');
          }}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-black uppercase border-2 border-black shadow-[3px_3px_0px_#000] cursor-pointer transition-all ${
            activeTab === 'moves'
              ? 'bg-yellow-400 text-black scale-105 shadow-[4px_4px_0px_#000]'
              : 'bg-slate-900 text-white hover:bg-slate-800'
          }`}
        >
          <Zap className="w-4 h-4" />
          <span>3. 기술 위력 & 효과 편집기 ({Object.keys(movesMap).length})</span>
        </button>

        <button
          id="tab-btn-elite"
          onClick={() => {
            sounds.playClick();
            setActiveTab('elite');
          }}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-black uppercase border-2 border-black shadow-[3px_3px_0px_#000] cursor-pointer transition-all ${
            activeTab === 'elite'
              ? 'bg-yellow-400 text-black scale-105 shadow-[4px_4px_0px_#000]'
              : 'bg-slate-900 text-white hover:bg-slate-800'
          }`}
        >
          <Crown className="w-4 h-4" />
          <span>4. 사천왕 엔트리 커스텀 (4관문)</span>
        </button>

        <button
          id="tab-btn-records"
          onClick={() => {
            sounds.playClick();
            setActiveTab('records');
          }}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-black uppercase border-2 border-black shadow-[3px_3px_0px_#000] cursor-pointer transition-all ${
            activeTab === 'records'
              ? 'bg-yellow-400 text-black scale-105 shadow-[4px_4px_0px_#000]'
              : 'bg-slate-900 text-white hover:bg-slate-800'
          }`}
        >
          <Trophy className="w-4 h-4" />
          <span>5. 명예의 전당 & 백업/복원</span>
        </button>
      </div>

      {/* TAB 1: GAME RULES & SETTINGS */}
      {activeTab === 'rules' && (
        <div className="bg-slate-900 border-4 border-black p-6 shadow-[8px_8px_0px_#000] space-y-6">
          <div className="flex items-center justify-between border-b-2 border-black pb-3">
            <div>
              <h2 className="text-lg font-black text-white uppercase flex items-center gap-2">
                <Sliders className="w-5 h-5 text-yellow-400" />
                <span>포켓몬 리그 규칙 및 배틀 시스템 환경설정</span>
              </h2>
              <p className="text-xs text-slate-300 font-medium">
                원하는 리그 룰을 선택하면 실시간으로 배틀 계산식과 시스템에 적용됩니다.
              </p>
            </div>
            <button
              onClick={handleSaveSettings}
              className="geo-btn flex items-center gap-1.5 px-4 py-2 bg-yellow-400 hover:bg-yellow-300 text-black font-black text-xs uppercase cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>설정 저장하기</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Level Rule */}
            <div className="p-4 bg-slate-950 border-2 border-black shadow-[3px_3px_0px_#000] space-y-2">
              <label className="block text-xs font-black text-yellow-400 uppercase">
                포켓몬 레벨 플랫 규칙 (Level Cap)
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[50, 70, 100].map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => {
                      sounds.playClick();
                      setSettings((prev) => ({ ...prev, levelRule: lvl }));
                    }}
                    className={`py-2 text-xs font-black uppercase border-2 border-black shadow-[2px_2px_0px_#000] cursor-pointer ${
                      settings.levelRule === lvl
                        ? 'bg-yellow-400 text-black font-extrabold'
                        : 'bg-slate-900 text-white hover:bg-slate-800'
                    }`}
                  >
                    Lv.{lvl} {lvl === 50 ? '(표준 룰)' : lvl === 100 ? '(최대 레벨)' : ''}
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-slate-400">
                표준 포켓몬 리그 대회는 Lv.50 플랫 룰로 진행됩니다.
              </p>
            </div>

            {/* Difficulty Level */}
            <div className="p-4 bg-slate-950 border-2 border-black shadow-[3px_3px_0px_#000] space-y-2">
              <label className="block text-xs font-black text-yellow-400 uppercase">
                리그 난이도 설정 (Difficulty)
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['casual', 'normal', 'hardcore'] as const).map((diff) => (
                  <button
                    key={diff}
                    onClick={() => {
                      sounds.playClick();
                      setSettings((prev) => ({ ...prev, difficulty: diff }));
                    }}
                    className={`py-2 text-xs font-black uppercase border-2 border-black shadow-[2px_2px_0px_#000] cursor-pointer ${
                      settings.difficulty === diff
                        ? diff === 'hardcore'
                          ? 'bg-red-500 text-white'
                          : 'bg-yellow-400 text-black font-extrabold'
                        : 'bg-slate-900 text-white hover:bg-slate-800'
                    }`}
                  >
                    {diff === 'casual' ? '🌱 캐주얼 (쉬움)' : diff === 'normal' ? '⚔️ 일반 (밸런스)' : '🔥 하드코어 (극악)'}
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-slate-400">
                하드코어 모드에서는 사천왕 AI가 최적의 약점 공격과 교체 예측을 적극적으로 감행합니다.
              </p>
            </div>

            {/* Stage Auto-Heal Rule */}
            <div className="p-4 bg-slate-950 border-2 border-black shadow-[3px_3px_0px_#000] space-y-2">
              <label className="block text-xs font-black text-yellow-400 uppercase">
                관문 클리어 시 파티 회복 룰 (Stage Recovery)
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    sounds.playClick();
                    setSettings((prev) => ({ ...prev, autoHealBetweenStages: true }));
                  }}
                  className={`py-2 text-xs font-black uppercase border-2 border-black shadow-[2px_2px_0px_#000] cursor-pointer ${
                    settings.autoHealBetweenStages
                      ? 'bg-green-500 text-black font-extrabold'
                      : 'bg-slate-900 text-white hover:bg-slate-800'
                  }`}
                >
                  💚 100% 풀회복 (HP & PP 완치)
                </button>
                <button
                  onClick={() => {
                    sounds.playClick();
                    setSettings((prev) => ({ ...prev, autoHealBetweenStages: false }));
                  }}
                  className={`py-2 text-xs font-black uppercase border-2 border-black shadow-[2px_2px_0px_#000] cursor-pointer ${
                    !settings.autoHealBetweenStages
                      ? 'bg-red-600 text-white font-extrabold'
                      : 'bg-slate-900 text-white hover:bg-slate-800'
                  }`}
                >
                  💀 너즐록 생존 모드 (회복 없음!)
                </button>
              </div>
              <p className="text-[11px] text-slate-400">
                너즐록 생존 모드는 4명의 사천왕을 깰 때까지 HP와 PP가 회복되지 않는 하드코어 룰입니다.
              </p>
            </div>

            {/* Battle Speed */}
            <div className="p-4 bg-slate-950 border-2 border-black shadow-[3px_3px_0px_#000] space-y-2">
              <label className="block text-xs font-black text-yellow-400 uppercase">
                배틀 연출 및 턴 진행 속도 (Battle Speed)
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['normal', 'fast', 'instant'] as const).map((spd) => (
                  <button
                    key={spd}
                    onClick={() => {
                      sounds.playClick();
                      setSettings((prev) => ({ ...prev, battleSpeed: spd }));
                    }}
                    className={`py-2 text-xs font-black uppercase border-2 border-black shadow-[2px_2px_0px_#000] cursor-pointer ${
                      settings.battleSpeed === spd
                        ? 'bg-yellow-400 text-black font-extrabold'
                        : 'bg-slate-900 text-white hover:bg-slate-800'
                    }`}
                  >
                    {spd === 'normal' ? '보통 (1.0x)' : spd === 'fast' ? '⚡ 빠름 (1.5x)' : '🚀 즉시 (2.5x)'}
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-slate-400">
                스킬 이펙트 연출과 텍스트 출력 대기시간을 조절합니다.
              </p>
            </div>
          </div>

          {/* 4th Gen Sinnoh BGM System Card */}
          <div className="p-4 bg-slate-950 border-2 border-yellow-400/80 shadow-[4px_4px_0px_#000] space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <Music className="w-5 h-5 text-yellow-400" />
                <h3 className="text-sm font-black text-yellow-400 uppercase">
                  4세대 신오 BGM 사운드트랙 환경설정 (Web Audio Synthesizer)
                </h3>
              </div>
              <span className="text-[10px] font-black px-2 py-0.5 bg-yellow-400 text-black border border-black uppercase">
                PROCEDURAL CHIPTUNE
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Track Selector & Live Play */}
              <div className="space-y-2">
                <span className="text-xs font-black text-slate-300 block">트랙 즉시 듣기 & 기본 BGM 지정:</span>
                <div className="space-y-1.5">
                  {BGM_TRACKS.map((track) => (
                    <button
                      key={track.id}
                      onClick={() => {
                        sounds.playClick();
                        bgmEngine.setTrack(track.id);
                        bgmEngine.play(track.id);
                      }}
                      className="w-full text-left p-2 bg-slate-900 hover:bg-slate-800 border-2 border-black flex items-center justify-between text-xs text-white cursor-pointer shadow-[2px_2px_0px_#000]"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{track.icon}</span>
                        <div>
                          <div className="font-black text-yellow-300">{track.name}</div>
                          <div className="text-[10px] text-slate-400">{track.description}</div>
                        </div>
                      </div>
                      <span className="text-[10px] font-black px-2 py-0.5 bg-slate-800 border border-slate-700 text-slate-300">
                        {track.bpm} BPM
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Live Equalizer & Volume */}
              <div className="p-4 bg-slate-900 border-2 border-black flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-black text-yellow-400 uppercase">BGM 컨트롤러</span>
                    <span className="text-[11px] font-bold text-slate-400">
                      상태: {bgmEngine.getIsPlaying() ? '▶ 재생 중' : '⏸ 일시 정지'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed mb-3">
                    Web Audio API 기반 8비트/16비트 사운드 신디사이저로 외부 파일 다운로드 없이 끊김 없는 루프 재생을 지원합니다.
                  </p>
                </div>

                <div className="flex items-center gap-3 pt-2 border-t border-slate-800">
                  <button
                    onClick={() => {
                      sounds.playClick();
                      bgmEngine.togglePlayPause();
                    }}
                    className="geo-btn px-4 py-2 bg-yellow-400 hover:bg-yellow-300 text-black font-black text-xs uppercase flex items-center gap-1.5 cursor-pointer shadow-[2px_2px_0px_#000]"
                  >
                    {bgmEngine.getIsPlaying() ? <Pause className="w-4 h-4 fill-black" /> : <Play className="w-4 h-4 fill-black" />}
                    <span>{bgmEngine.getIsPlaying() ? '일시정지' : 'BGM 재생'}</span>
                  </button>

                  <button
                    onClick={() => {
                      sounds.playClick();
                      bgmEngine.toggleMute();
                    }}
                    className="geo-btn px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white font-black text-xs uppercase flex items-center gap-1 cursor-pointer border border-slate-700"
                  >
                    {bgmEngine.getIsMuted() ? <VolumeX className="w-4 h-4 text-red-500" /> : <Volume2 className="w-4 h-4 text-green-400" />}
                    <span>{bgmEngine.getIsMuted() ? '음소거 해제' : '음소거'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Speed & Damage Formula Balance Explainer Card */}
          <div className="p-4 bg-slate-950 border-2 border-yellow-400/80 shadow-[4px_4px_0px_#000] space-y-3">
            <h3 className="text-xs font-black text-yellow-400 uppercase flex items-center gap-2">
              <Zap className="w-4 h-4 text-yellow-400" />
              <span>개선된 포켓몬 배틀 공식 및 실시간 스피드 판정 시스템 안내</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-slate-300">
              <div className="p-3 bg-slate-900 border border-slate-700">
                <div className="font-black text-white mb-1 flex items-center gap-1.5 text-[11px]">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  1. 실시간 스피드 선공 보장
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  스피드가 1이라도 높은 포켓몬이 반드시 먼저 공격합니다. 배틀 화면 상단에 실시간 스피드 비교 HUD가 표시됩니다.
                </p>
              </div>

              <div className="p-3 bg-slate-900 border border-slate-700">
                <div className="font-black text-white mb-1 flex items-center gap-1.5 text-[11px]">
                  <span className="w-2 h-2 rounded-full bg-yellow-400"></span>
                  2. 사천왕 공격력 밸런스 조정
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  상대 공격 데미지를 82%(캐주얼 70%)로 적정 보정하여 억울한 원킬을 방지하고, 전략적인 카운터가 가능하도록 개선되었습니다.
                </p>
              </div>

              <div className="p-3 bg-slate-900 border border-slate-700">
                <div className="font-black text-white mb-1 flex items-center gap-1.5 text-[11px]">
                  <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                  3. 기합의 버티기 & 클린 교체
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  만피 상태에서 즉사급 공격을 받아도 HP 1로 근성 버티기가 발동하며, 기절 후 새 포켓몬 투입 시 적 공격 없이 즉시 선공이 가능합니다.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: POKEMON & BASE STATS EDITOR */}
      {activeTab === 'pokemon' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Pokemon List */}
          <div className="lg:col-span-5 bg-slate-900 border-4 border-black p-4 shadow-[8px_8px_0px_#000] flex flex-col h-[700px]">
            <div className="flex items-center justify-between pb-3 border-b-2 border-black">
              <h3 className="text-sm font-black text-white uppercase flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-yellow-400" />
                <span>포켓몬 목록 ({filteredPokemonList.length})</span>
              </h3>
              <div className="flex gap-1.5">
                <button
                  onClick={handleAddNewPokemon}
                  className="geo-btn px-2.5 py-1 bg-yellow-400 hover:bg-yellow-300 text-black font-black text-[11px] uppercase cursor-pointer"
                  title="새 포켓몬 등록"
                >
                  <Plus className="w-3.5 h-3.5 inline mr-1" />
                  새 등록
                </button>
                <button
                  onClick={handleResetPokemonDefaults}
                  className="geo-btn px-2 py-1 bg-slate-800 hover:bg-slate-700 text-white font-black text-[11px] uppercase cursor-pointer"
                  title="원본 기본값 초기화"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Search and Filters */}
            <div className="py-2 space-y-2 border-b-2 border-black">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="포켓몬 이름 검색..."
                  value={pkmnSearch}
                  onChange={(e) => setPkmnSearch(e.target.value)}
                  className="w-full bg-slate-950 border-2 border-black text-xs text-white pl-9 pr-3 py-2 focus:outline-hidden focus:border-yellow-400"
                />
              </div>

              {/* Type filter scroll */}
              <div className="flex gap-1 overflow-x-auto pb-1 text-[10px]">
                <button
                  onClick={() => setPkmnTypeFilter('전체')}
                  className={`px-2 py-0.5 font-black border border-black uppercase cursor-pointer ${
                    pkmnTypeFilter === '전체' ? 'bg-yellow-400 text-black' : 'bg-slate-950 text-white'
                  }`}
                >
                  전체
                </button>
                {ALL_TYPES.map((t) => (
                  <button
                    key={t}
                    onClick={() => setPkmnTypeFilter(t)}
                    className={`px-2 py-0.5 font-black border border-black uppercase cursor-pointer whitespace-nowrap ${
                      pkmnTypeFilter === t ? 'bg-yellow-400 text-black' : 'bg-slate-950 text-white'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Pokemon Scroll List */}
            <div className="flex-1 overflow-y-auto space-y-1.5 pt-2 pr-1">
              {filteredPokemonList.map((p) => {
                const isSelected = p.id === selectedPkmnId;
                return (
                  <div
                    key={p.id}
                    onClick={() => {
                      sounds.playClick();
                      setSelectedPkmnId(p.id);
                    }}
                    className={`p-2 border-2 border-black flex items-center justify-between cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-yellow-400 text-black font-black shadow-[3px_3px_0px_#000] translate-x-1'
                        : 'bg-slate-950 text-slate-200 hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <img
                        src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${p.dexNumber}.png`}
                        alt={p.name}
                        className="w-9 h-9 object-contain bg-slate-900 border border-black shrink-0"
                        loading="lazy"
                        referrerPolicy="no-referrer"
                      />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-black">{p.name}</span>
                          {p.isCustom && (
                            <span className="text-[9px] px-1 bg-red-600 text-white font-black uppercase">
                              커스텀
                            </span>
                          )}
                        </div>
                        <div className="flex gap-1 mt-0.5">
                          {p.types.map((t) => (
                            <span
                              key={t}
                              className="text-[9px] px-1.5 py-0.2 border border-black bg-slate-800 text-white font-bold"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] font-mono block">
                        합계:{' '}
                        {p.baseStats.hp +
                          p.baseStats.attack +
                          p.baseStats.defense +
                          p.baseStats.spAttack +
                          p.baseStats.spDefense +
                          p.baseStats.speed}
                      </span>
                      <span className="text-[9px] text-slate-400 font-mono">스피드: {p.baseStats.speed}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Pokemon Detail & Stat Editor */}
          <div className="lg:col-span-7 bg-slate-900 border-4 border-black p-6 shadow-[8px_8px_0px_#000] space-y-6">
            <div className="flex items-center justify-between border-b-2 border-black pb-4">
              <div className="flex items-center gap-3">
                <img
                  src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${editPkmnDex}.png`}
                  alt={editPkmnName}
                  className="w-14 h-14 object-contain bg-slate-950 border-2 border-black shadow-[2px_2px_0px_#000]"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <h2 className="text-lg font-black text-white uppercase flex items-center gap-2">
                    <span>{editPkmnName}</span>
                    <span className="text-xs text-yellow-400 font-mono">#{editPkmnDex}</span>
                  </h2>
                  <div className="flex gap-1 mt-1">
                    {editPkmnTypes.map((t) => (
                      <TypeBadge key={t} type={t} size="sm" />
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {editingPokemon?.isCustom && (
                  <button
                    onClick={() => handleDeletePokemon(editingPokemon.id)}
                    className="geo-btn px-3 py-2 bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase cursor-pointer"
                    title="커스텀 포켓몬 삭제"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={handleSavePokemon}
                  className="geo-btn flex items-center gap-1.5 px-4 py-2 bg-yellow-400 hover:bg-yellow-300 text-black font-black text-xs uppercase cursor-pointer shadow-[3px_3px_0px_#000]"
                >
                  <Save className="w-4 h-4" />
                  <span>스탯 & 기술 저장</span>
                </button>
              </div>
            </div>

            {/* Basic Info Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-slate-950 border-2 border-black">
              <div>
                <label className="text-[11px] font-black text-yellow-400 uppercase block mb-1">한글 이름</label>
                <input
                  type="text"
                  value={editPkmnName}
                  onChange={(e) => setEditPkmnName(e.target.value)}
                  className="w-full bg-slate-900 border-2 border-black px-2.5 py-1.5 text-xs text-white"
                />
              </div>

              <div>
                <label className="text-[11px] font-black text-yellow-400 uppercase block mb-1">영문 이름</label>
                <input
                  type="text"
                  value={editPkmnNameEn}
                  onChange={(e) => setEditPkmnNameEn(e.target.value)}
                  className="w-full bg-slate-900 border-2 border-black px-2.5 py-1.5 text-xs text-white"
                />
              </div>

              <div>
                <label className="text-[11px] font-black text-yellow-400 uppercase block mb-1">전국도감 번호</label>
                <input
                  type="number"
                  value={editPkmnDex}
                  onChange={(e) => setEditPkmnDex(Number(e.target.value) || 1)}
                  className="w-full bg-slate-900 border-2 border-black px-2.5 py-1.5 text-xs text-white font-mono"
                />
              </div>
            </div>

            {/* Type Selector */}
            <div className="p-3 bg-slate-950 border-2 border-black space-y-2">
              <label className="text-[11px] font-black text-yellow-400 uppercase block">
                포켓몬 타입 선택 (최대 2개): 현재 [{editPkmnTypes.join(' / ')}]
              </label>
              <div className="flex flex-wrap gap-1.5">
                {ALL_TYPES.map((t) => {
                  const isSelected = editPkmnTypes.includes(t);
                  return (
                    <button
                      key={t}
                      type="button"
                      onClick={() => {
                        sounds.playClick();
                        if (isSelected) {
                          if (editPkmnTypes.length > 1) {
                            setEditPkmnTypes(editPkmnTypes.filter((x) => x !== t));
                          }
                        } else {
                          if (editPkmnTypes.length < 2) {
                            setEditPkmnTypes([...editPkmnTypes, t]);
                          } else {
                            setEditPkmnTypes([editPkmnTypes[0], t]);
                          }
                        }
                      }}
                      className={`px-2.5 py-1 text-xs font-black border-2 border-black cursor-pointer uppercase ${
                        isSelected ? 'bg-yellow-400 text-black font-extrabold shadow-[2px_2px_0px_#000]' : 'bg-slate-900 text-white'
                      }`}
                    >
                      {t}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Base Stats Sliders with Live Lv.50 Preview */}
            <div className="p-4 bg-slate-950 border-2 border-black space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs font-black text-yellow-400 uppercase">종족값 (Base Stats) & 실능력치 (Lv.50)</span>
                <span className="text-xs font-mono text-slate-300">
                  종족값 총합: <strong className="text-yellow-400">{editBaseStats.hp + editBaseStats.attack + editBaseStats.defense + editBaseStats.spAttack + editBaseStats.spDefense + editBaseStats.speed}</strong>
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* HP */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-bold">
                    <span>HP (체력)</span>
                    <span className="font-mono text-yellow-400">종족값 {editBaseStats.hp} ➔ 실능력치 {liveLv50Stats.hp}</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="255"
                    value={editBaseStats.hp}
                    onChange={(e) => setEditBaseStats({ ...editBaseStats, hp: Number(e.target.value) })}
                    className="w-full accent-yellow-400 cursor-pointer"
                  />
                </div>

                {/* Attack */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-bold">
                    <span>공격 (물리)</span>
                    <span className="font-mono text-yellow-400">종족값 {editBaseStats.attack} ➔ 실능력치 {liveLv50Stats.attack}</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="255"
                    value={editBaseStats.attack}
                    onChange={(e) => setEditBaseStats({ ...editBaseStats, attack: Number(e.target.value) })}
                    className="w-full accent-yellow-400 cursor-pointer"
                  />
                </div>

                {/* Defense */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-bold">
                    <span>방어 (물리)</span>
                    <span className="font-mono text-yellow-400">종족값 {editBaseStats.defense} ➔ 실능력치 {liveLv50Stats.defense}</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="255"
                    value={editBaseStats.defense}
                    onChange={(e) => setEditBaseStats({ ...editBaseStats, defense: Number(e.target.value) })}
                    className="w-full accent-yellow-400 cursor-pointer"
                  />
                </div>

                {/* Sp.Attack */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-bold">
                    <span>특수공격 (특수)</span>
                    <span className="font-mono text-yellow-400">종족값 {editBaseStats.spAttack} ➔ 실능력치 {liveLv50Stats.spAttack}</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="255"
                    value={editBaseStats.spAttack}
                    onChange={(e) => setEditBaseStats({ ...editBaseStats, spAttack: Number(e.target.value) })}
                    className="w-full accent-yellow-400 cursor-pointer"
                  />
                </div>

                {/* Sp.Defense */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-bold">
                    <span>특수방어 (특수)</span>
                    <span className="font-mono text-yellow-400">종족값 {editBaseStats.spDefense} ➔ 실능력치 {liveLv50Stats.spDefense}</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="255"
                    value={editBaseStats.spDefense}
                    onChange={(e) => setEditBaseStats({ ...editBaseStats, spDefense: Number(e.target.value) })}
                    className="w-full accent-yellow-400 cursor-pointer"
                  />
                </div>

                {/* Speed */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-bold">
                    <span>스피드 (선공권)</span>
                    <span className="font-mono text-yellow-400">종족값 {editBaseStats.speed} ➔ 실능력치 {liveLv50Stats.speed}</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="255"
                    value={editBaseStats.speed}
                    onChange={(e) => setEditBaseStats({ ...editBaseStats, speed: Number(e.target.value) })}
                    className="w-full accent-yellow-400 cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Movepool Selection */}
            <div className="p-4 bg-slate-950 border-2 border-black space-y-3">
              <span className="text-xs font-black text-yellow-400 uppercase block">
                배틀 기술 4가지 선택 (Movepool: 4 Moves)
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[0, 1, 2, 3].map((slotIdx) => {
                  const currentMoveKey = editMoveKeys[slotIdx] || 'body_slam';
                  return (
                    <div key={slotIdx} className="space-y-1">
                      <label className="text-[10px] text-slate-400 font-black uppercase">슬롯 {slotIdx + 1}</label>
                      <select
                        value={currentMoveKey}
                        onChange={(e) => {
                          const next = [...editMoveKeys];
                          next[slotIdx] = e.target.value;
                          setEditMoveKeys(next);
                        }}
                        className="w-full bg-slate-900 border-2 border-black px-2.5 py-1.5 text-xs text-white font-medium"
                      >
                        {allMovesArray.map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.name} ({m.type} / 위력:{m.power || 0} / 명중:{m.accuracy || 100})
                          </option>
                        ))}
                      </select>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: MOVES & POWERS EDITOR */}
      {activeTab === 'moves' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Moves List Left Column */}
          <div className="lg:col-span-5 bg-slate-900 border-4 border-black p-4 shadow-[8px_8px_0px_#000] flex flex-col h-[700px]">
            <div className="flex items-center justify-between pb-3 border-b-2 border-black">
              <h3 className="text-sm font-black text-white uppercase flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-yellow-400" />
                <span>기술 데이터베이스 ({filteredMovesList.length})</span>
              </h3>
              <div className="flex gap-1.5">
                <button
                  onClick={handleAddNewMove}
                  className="geo-btn px-2.5 py-1 bg-yellow-400 hover:bg-yellow-300 text-black font-black text-[11px] uppercase cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 inline mr-1" />
                  새 기술
                </button>
                <button
                  onClick={handleResetMovesDefaults}
                  className="geo-btn px-2 py-1 bg-slate-800 hover:bg-slate-700 text-white font-black text-[11px] uppercase cursor-pointer"
                  title="원본 복원"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Search & Type Filter */}
            <div className="py-2 space-y-2 border-b-2 border-black">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="기술 이름 검색..."
                  value={moveSearch}
                  onChange={(e) => setMoveSearch(e.target.value)}
                  className="w-full bg-slate-950 border-2 border-black text-xs text-white pl-9 pr-3 py-2 focus:outline-hidden focus:border-yellow-400"
                />
              </div>
            </div>

            {/* Scrollable moves list */}
            <div className="flex-1 overflow-y-auto space-y-1.5 pt-2 pr-1">
              {filteredMovesList.map((m) => {
                const isSelected = m.id === selectedMoveId;
                return (
                  <div
                    key={m.id}
                    onClick={() => {
                      sounds.playClick();
                      setSelectedMoveId(m.id);
                    }}
                    className={`p-2.5 border-2 border-black flex items-center justify-between cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-yellow-400 text-black font-black shadow-[3px_3px_0px_#000] translate-x-1'
                        : 'bg-slate-950 text-slate-200 hover:bg-slate-800'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black">{m.name}</span>
                        <span className="text-[10px] px-1.5 bg-slate-900 text-white border border-black font-bold">
                          {m.type}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        {m.category === 'physical' ? '물리' : m.category === 'special' ? '특수' : '변화'} • PP:{m.pp}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-mono font-black">
                        위력: {m.power ? m.power : '-'}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono block">명중: {m.accuracy}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Move Editor */}
          <div className="lg:col-span-7 bg-slate-900 border-4 border-black p-6 shadow-[8px_8px_0px_#000] space-y-6">
            <div className="flex items-center justify-between border-b-2 border-black pb-4">
              <div>
                <h2 className="text-lg font-black text-white uppercase flex items-center gap-2">
                  <span>{editMoveName}</span>
                  <span className="text-xs text-yellow-400 font-mono">({editMoveType})</span>
                </h2>
                <p className="text-xs text-slate-300 font-medium mt-0.5">
                  기술 위력, 명중률, PP, 우선도, 분류 등을 자유롭게 수정할 수 있습니다.
                </p>
              </div>

              <div className="flex gap-2">
                {editingMove?.id?.startsWith('custom_move_') && (
                  <button
                    onClick={() => handleDeleteMove(editingMove.id)}
                    className="geo-btn px-3 py-2 bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={handleSaveMove}
                  className="geo-btn flex items-center gap-1.5 px-4 py-2 bg-yellow-400 hover:bg-yellow-300 text-black font-black text-xs uppercase cursor-pointer shadow-[3px_3px_0px_#000]"
                >
                  <Save className="w-4 h-4" />
                  <span>기술 저장</span>
                </button>
              </div>
            </div>

            {/* Move Attributes Form */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-slate-950 border-2 border-black">
              <div>
                <label className="text-xs font-black text-yellow-400 uppercase block mb-1">기술 이름</label>
                <input
                  type="text"
                  value={editMoveName}
                  onChange={(e) => setEditMoveName(e.target.value)}
                  className="w-full bg-slate-900 border-2 border-black px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="text-xs font-black text-yellow-400 uppercase block mb-1">기술 타입</label>
                <select
                  value={editMoveType}
                  onChange={(e) => setEditMoveType(e.target.value as PokemonType)}
                  className="w-full bg-slate-900 border-2 border-black px-3 py-2 text-xs text-white"
                >
                  {ALL_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-black text-yellow-400 uppercase block mb-1">공격 분류</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['physical', 'special', 'status'] as const).map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => {
                        sounds.playClick();
                        setEditMoveCategory(cat);
                      }}
                      className={`py-1.5 text-xs font-black uppercase border-2 border-black cursor-pointer ${
                        editMoveCategory === cat ? 'bg-yellow-400 text-black font-extrabold' : 'bg-slate-900 text-white'
                      }`}
                    >
                      {cat === 'physical' ? '물리' : cat === 'special' ? '특수' : '변화'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-black text-yellow-400 uppercase block mb-1">
                  기술 위력 (Power: 0~250)
                </label>
                <input
                  type="number"
                  min="0"
                  max="250"
                  value={editMovePower}
                  onChange={(e) => setEditMovePower(Number(e.target.value) || 0)}
                  disabled={editMoveCategory === 'status'}
                  className="w-full bg-slate-900 border-2 border-black px-3 py-2 text-xs text-white font-mono disabled:opacity-50"
                />
              </div>

              <div>
                <label className="text-xs font-black text-yellow-400 uppercase block mb-1">
                  명중률 (Accuracy: 1~100%)
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={editMoveAccuracy}
                  onChange={(e) => setEditMoveAccuracy(Number(e.target.value) || 100)}
                  className="w-full bg-slate-900 border-2 border-black px-3 py-2 text-xs text-white font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-black text-yellow-400 uppercase block mb-1">PP (사용 가능 횟수)</label>
                <input
                  type="number"
                  min="1"
                  max="40"
                  value={editMovePp}
                  onChange={(e) => setEditMovePp(Number(e.target.value) || 15)}
                  className="w-full bg-slate-900 border-2 border-black px-3 py-2 text-xs text-white font-mono"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-black text-yellow-400 uppercase block mb-1">기술 설명</label>
                <textarea
                  rows={3}
                  value={editMoveDesc}
                  onChange={(e) => setEditMoveDesc(e.target.value)}
                  className="w-full bg-slate-900 border-2 border-black px-3 py-2 text-xs text-white"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: ELITE FOUR ROSTER CUSTOMIZER */}
      {activeTab === 'elite' && (
        <div className="bg-slate-900 border-4 border-black p-6 shadow-[8px_8px_0px_#000] space-y-6">
          <div className="flex items-center justify-between border-b-2 border-black pb-4">
            <div>
              <h2 className="text-lg font-black text-white uppercase flex items-center gap-2">
                <Crown className="w-5 h-5 text-yellow-400" />
                <span>사천왕 4관문 엔트리 커스텀 편집</span>
              </h2>
              <p className="text-xs text-slate-300 font-medium">
                각 관문의 사천왕 마스터와 출전 포켓몬 엔트리를 변경할 수 있습니다.
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleResetEliteMasters}
                className="geo-btn px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white font-black text-xs uppercase cursor-pointer"
              >
                <RotateCcw className="w-4 h-4 inline mr-1" />
                기본 엔트리 복원
              </button>
              <button
                onClick={handleSaveEliteMasters}
                className="geo-btn flex items-center gap-1.5 px-4 py-2 bg-yellow-400 hover:bg-yellow-300 text-black font-black text-xs uppercase cursor-pointer shadow-[3px_3px_0px_#000]"
              >
                <Save className="w-4 h-4" />
                <span>사천왕 엔트리 저장</span>
              </button>
            </div>
          </div>

          {/* Master Tabs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {eliteMasters.map((m, idx) => (
              <button
                key={m.id}
                onClick={() => {
                  sounds.playClick();
                  setSelectedMasterIdx(idx);
                }}
                className={`p-3 border-2 border-black text-left cursor-pointer transition-all ${
                  selectedMasterIdx === idx
                    ? 'bg-yellow-400 text-black font-black shadow-[4px_4px_0px_#000] scale-102'
                    : 'bg-slate-950 text-white hover:bg-slate-850'
                }`}
              >
                <span className="text-[10px] uppercase font-mono block opacity-80">제{m.stage}관문</span>
                <span className="text-sm font-black block">{m.name}</span>
                <span className="text-[11px] block mt-0.5">전문: {m.specialty}</span>
              </button>
            ))}
          </div>

          {/* Current Master Detail */}
          {eliteMasters[selectedMasterIdx] && (
            <div className="p-5 bg-slate-950 border-2 border-black space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-black text-yellow-400 uppercase block mb-1">사천왕 이름 & 칭호</label>
                  <input
                    type="text"
                    value={eliteMasters[selectedMasterIdx].name}
                    onChange={(e) => {
                      const next = [...eliteMasters];
                      next[selectedMasterIdx].name = e.target.value;
                      setEliteMasters(next);
                    }}
                    className="w-full bg-slate-900 border-2 border-black px-3 py-2 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-black text-yellow-400 uppercase block mb-1">전문 타입 표기</label>
                  <input
                    type="text"
                    value={eliteMasters[selectedMasterIdx].specialty}
                    onChange={(e) => {
                      const next = [...eliteMasters];
                      next[selectedMasterIdx].specialty = e.target.value;
                      setEliteMasters(next);
                    }}
                    className="w-full bg-slate-900 border-2 border-black px-3 py-2 text-xs text-white"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-black text-yellow-400 uppercase block mb-1">도전 인트로 대사</label>
                  <input
                    type="text"
                    value={eliteMasters[selectedMasterIdx].introQuote}
                    onChange={(e) => {
                      const next = [...eliteMasters];
                      next[selectedMasterIdx].introQuote = e.target.value;
                      setEliteMasters(next);
                    }}
                    className="w-full bg-slate-900 border-2 border-black px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>

              {/* Master Team Member Pokemon List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-yellow-400 uppercase">
                    출전 포켓몬 엔트리 ({eliteMasters[selectedMasterIdx].team.length}마리)
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {eliteMasters[selectedMasterIdx].team.map((pkmn, pIdx) => (
                    <div
                      key={pIdx}
                      className="p-3 bg-slate-900 border-2 border-black shadow-[2px_2px_0px_#000] flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2.5">
                        <img
                          src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pkmn.dexNumber}.png`}
                          alt={pkmn.name}
                          className="w-10 h-10 object-contain bg-slate-950 border border-black"
                          referrerPolicy="no-referrer"
                        />
                        <div>
                          <span className="text-xs font-black text-white block">{pkmn.name}</span>
                          <span className="text-[10px] text-yellow-400 font-mono">
                            HP: {pkmn.stats.hp} • SPD: {pkmn.stats.speed}
                          </span>
                        </div>
                      </div>

                      <span className="text-[11px] font-mono font-bold bg-slate-950 px-2 py-1 border border-black">
                        #{pIdx + 1}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 5: RECORDS & BACKUP / RESTORE */}
      {activeTab === 'records' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Hall of fame records */}
          <div className="bg-slate-900 border-4 border-black p-6 shadow-[8px_8px_0px_#000] space-y-4">
            <div className="flex items-center justify-between border-b-2 border-black pb-3">
              <h2 className="text-base font-black text-white uppercase flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-400" />
                <span>명예의 전당 클리어 기록 ({hallOfFame.length})</span>
              </h2>
              {hallOfFame.length > 0 && (
                <button
                  onClick={() => {
                    sounds.playClick();
                    if (confirm('모든 명예의 전당 클리어 기록을 삭제하시겠습니까?')) {
                      clearHallOfFameRecords();
                      setHallOfFame([]);
                      showToast('🗑️ 기록이 삭제되었습니다.');
                    }
                  }}
                  className="geo-btn px-2.5 py-1 bg-red-600 hover:bg-red-500 text-white font-black text-[11px] uppercase cursor-pointer"
                >
                  기록 초기화
                </button>
              )}
            </div>

            {hallOfFame.length === 0 ? (
              <div className="p-8 text-center bg-slate-950 border-2 border-black text-slate-400 text-xs">
                아직 등록된 사천왕 도장깨기 클리어 기록이 없습니다.
              </div>
            ) : (
              <div className="max-h-[480px] overflow-y-auto space-y-3 pr-1">
                {hallOfFame.map((entry) => (
                  <div
                    key={entry.id}
                    className="p-4 bg-slate-950 border-2 border-black shadow-[3px_3px_0px_#000] space-y-2"
                  >
                    <div className="flex items-center justify-between text-xs font-black">
                      <span className="text-yellow-400">🏆 리그 챔피언 등극</span>
                      <span className="text-slate-400 font-mono">{entry.clearedAt}</span>
                    </div>

                    <div className="text-xs text-slate-300">
                      총 소요 턴수: <strong className="text-white">{entry.totalTurns} 턴</strong> • 난이도:{' '}
                      <strong className="text-white">{entry.difficulty}</strong>
                    </div>

                    {/* Team Icons */}
                    <div className="flex gap-1.5 pt-1">
                      {entry.team.map((m, idx) => (
                        <img
                          key={idx}
                          src={m.spriteFront}
                          alt={m.name}
                          title={m.name}
                          className="w-8 h-8 object-contain bg-slate-900 border border-black"
                          referrerPolicy="no-referrer"
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Backup, Export & Restore */}
          <div className="bg-slate-900 border-4 border-black p-6 shadow-[8px_8px_0px_#000] space-y-6">
            <div className="border-b-2 border-black pb-3">
              <h2 className="text-base font-black text-white uppercase flex items-center gap-2">
                <Download className="w-5 h-5 text-yellow-400" />
                <span>데이터 백업 & JSON 가져오기 / 복원</span>
              </h2>
              <p className="text-xs text-slate-300 font-medium">
                모든 커스텀 포켓몬, 기술, 규칙, 기록 데이터를 JSON으로 백업하거나 타인과 공유할 수 있습니다.
              </p>
            </div>

            {/* Export */}
            <div className="p-4 bg-slate-950 border-2 border-black space-y-2">
              <span className="text-xs font-black text-yellow-400 uppercase block">1. 전체 설정 내보내기 (Export)</span>
              <p className="text-xs text-slate-300">
                현재 브라우저에 저장된 모든 리그 데이터를 클립보드에 복사합니다.
              </p>
              <button
                onClick={handleExportJson}
                className="geo-btn flex items-center gap-2 px-4 py-2.5 bg-yellow-400 hover:bg-yellow-300 text-black font-black text-xs uppercase cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>JSON 클립보드 복사</span>
              </button>
            </div>

            {/* Import */}
            <div className="p-4 bg-slate-950 border-2 border-black space-y-2">
              <span className="text-xs font-black text-yellow-400 uppercase block">2. JSON 데이터 가져오기 (Import)</span>
              <textarea
                rows={4}
                placeholder="내보낸 JSON 텍스트를 여기에 붙여넣으세요..."
                value={importJsonText}
                onChange={(e) => setImportJsonText(e.target.value)}
                className="w-full bg-slate-900 border-2 border-black p-2.5 text-xs text-white font-mono"
              />
              <button
                onClick={handleImportJson}
                className="geo-btn flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-black text-xs uppercase cursor-pointer"
              >
                <Upload className="w-4 h-4" />
                <span>데이터 복원 적용하기</span>
              </button>
            </div>

            {/* Factory Reset */}
            <div className="p-4 bg-red-950/40 border-2 border-red-700 space-y-2">
              <span className="text-xs font-black text-red-400 uppercase block flex items-center gap-1">
                <AlertTriangle className="w-4 h-4" />
                <span>3. 공장 초기화 (Factory Reset)</span>
              </span>
              <p className="text-xs text-slate-300">
                모든 커스텀 포켓몬, 스탯 수정, 기술, 사천왕 엔트리를 최초 순정 상태로 리셋합니다.
              </p>
              <button
                onClick={handleFactoryReset}
                className="geo-btn flex items-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>전체 공장 초기화 실행</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
