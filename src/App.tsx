import React, { useState, useEffect } from 'react';
import { PokemonData, EliteFourMaster } from './types/pokemon';
import { ELITE_FOUR_MASTERS } from './data/eliteFour';
import { getPokemonById } from './data/pokemonList';
import { getStoredEliteMasters, getStoredPokemonById, getPlayablePokemonList } from './utils/localStorageStore';
import { fullHealParty } from './utils/battleEngine';
import { Header } from './components/Header';
import { PartyBuilder } from './components/PartyBuilder';
import { EliteFourIntro } from './components/EliteFourIntro';
import { BattleScreen } from './components/BattleScreen';
import { StageClearModal } from './components/StageClearModal';
import { GameOverModal } from './components/GameOverModal';
import { VictoryScreen } from './components/VictoryScreen';
import { PokemonDetailModal } from './components/PokemonDetailModal';
import { OakCoachChat } from './components/OakCoachChat';
import { TypeChartModal } from './components/TypeChartModal';
import { AdminPage } from './components/AdminPage';
import { sounds } from './utils/soundEffects';
import { bgmEngine } from './utils/bgmEngine';

type GamePhase = 'party_builder' | 'admin' | 'elite_intro' | 'battle' | 'stage_clear' | 'game_over' | 'victory';

export default function App() {
  const [dataVersion, setDataVersion] = useState<number>(0);
  const [storedMasters, setStoredMasters] = useState<EliteFourMaster[]>(() => getStoredEliteMasters());

  // Default party pre-selected for fast jump-in with competitive held items
  const [party, setParty] = useState<PokemonData[]>(() => [
    { ...getStoredPokemonById('garchomp'), item: 'life_orb', itemConsumed: false },
    { ...getStoredPokemonById('charizard'), item: 'choice_specs', itemConsumed: false },
    { ...getStoredPokemonById('lucario'), item: 'focus_sash', itemConsumed: false },
    { ...getStoredPokemonById('milotic'), item: 'leftovers', itemConsumed: false },
    { ...getStoredPokemonById('mimikyu'), item: 'lum_berry', itemConsumed: false },
    { ...getStoredPokemonById('volcarona'), item: 'heavy_duty_boots', itemConsumed: false },
  ]);

  const [currentStageIndex, setCurrentStageIndex] = useState<number>(0); // 0 = Stage 1, 1 = Stage 2, 2 = Stage 3, 3 = Stage 4
  const [gamePhase, setGamePhase] = useState<GamePhase>('party_builder');
  const [totalTurnsCount, setTotalTurnsCount] = useState<number>(0);

  // Modals state
  const [inspectPokemon, setInspectPokemon] = useState<PokemonData | null>(null);
  const [isOakChatOpen, setIsOakChatOpen] = useState<boolean>(false);
  const [isTypeChartOpen, setIsTypeChartOpen] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Refresh masters when data is updated in admin
  const handleDataChanged = () => {
    setStoredMasters(getStoredEliteMasters());
    setDataVersion((v) => v + 1);
    // Refresh current party stats/moves
    setParty((prevParty) => prevParty.map((p) => getStoredPokemonById(p.id)));
  };

  const currentMaster: EliteFourMaster =
    storedMasters[currentStageIndex] || ELITE_FOUR_MASTERS[currentStageIndex] || ELITE_FOUR_MASTERS[0];

  // Party Selection Handlers
  const handleSelectPokemon = (pokemon: PokemonData) => {
    if (party.length < 6 && !party.some((p) => p.id === pokemon.id)) {
      setParty((prev) => [...prev, { ...pokemon }]);
    }
  };

  const handleRemovePokemon = (index: number) => {
    setParty((prev) => prev.filter((_, i) => i !== index));
  };

  const handleReorderLead = (index: number) => {
    if (index === 0) return;
    setParty((prev) => {
      const next = [...prev];
      const selected = next.splice(index, 1)[0];
      next.unshift(selected);
      return next;
    });
  };

  // Game Flow Actions
  const handleStartChallenge = () => {
    if (party.length !== 6) return;
    // Heal entire party fully before stage 1
    const freshParty = fullHealParty(party);
    setParty(freshParty);
    setCurrentStageIndex(0);
    setTotalTurnsCount(0);
    setGamePhase('elite_intro');
    // Start 4th Gen Elite Four BGM
    if (!bgmEngine.getIsPlaying()) {
      bgmEngine.play('sinnoh_elite_four');
    }
  };

  const handleStartBattle = () => {
    const currentMaster = storedMasters[currentStageIndex];
    const isCynthia = currentMaster?.name.includes('난천') || (currentStageIndex + 1) >= 5;
    if (isCynthia) {
      bgmEngine.setTrack('cynthia_champion');
      if (!bgmEngine.getIsPlaying()) bgmEngine.play('cynthia_champion');
    } else {
      if (!bgmEngine.getIsPlaying()) bgmEngine.play('sinnoh_elite_four');
    }
    setGamePhase('battle');
  };

  const handleStageClear = (updatedParty: PokemonData[]) => {
    // Crucial rule requirement: Restore HP & PP 100% for all party members when clearing a stage
    const fullyRestoredParty = fullHealParty(updatedParty);
    setParty(fullyRestoredParty);
    sounds.playHeal();
    setGamePhase('stage_clear');
  };

  const handleProceedNextStage = () => {
    const nextIndex = currentStageIndex + 1;
    if (nextIndex < storedMasters.length) {
      setCurrentStageIndex(nextIndex);
      const nextMaster = storedMasters[nextIndex];
      const isCynthia = nextMaster?.name.includes('난천') || (nextIndex + 1) >= 5;
      if (isCynthia) {
        bgmEngine.setTrack('cynthia_champion');
      } else {
        bgmEngine.setTrack('sinnoh_elite_four');
      }
      setGamePhase('elite_intro');
    } else {
      // Defeated all 4 Elite Four Masters!
      bgmEngine.setTrack('sinnoh_league');
      setGamePhase('victory');
    }
  };

  const handleGameOver = () => {
    setGamePhase('game_over');
  };

  const handleRetryStage = () => {
    // Full heal party and retry current stage
    const freshParty = fullHealParty(party);
    setParty(freshParty);
    setGamePhase('elite_intro');
  };

  const handleResetGame = () => {
    const freshParty = fullHealParty(party);
    setParty(freshParty);
    setCurrentStageIndex(0);
    setGamePhase('party_builder');
  };

  const handleToggleMute = () => {
    const nextMuted = sounds.toggleMute();
    setIsMuted(nextMuted);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-amber-500 selection:text-slate-950 font-sans">
      {/* Universal Top Header */}
      <Header
        currentStage={gamePhase === 'party_builder' || gamePhase === 'admin' ? 0 : currentStageIndex + 1}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        onOpenOakChat={() => setIsOakChatOpen(true)}
        onOpenTypeChart={() => setIsTypeChartOpen(true)}
        onOpenAdmin={() => setGamePhase('admin')}
        onResetGame={handleResetGame}
      />

      {/* Main Dynamic View Area */}
      <main className="flex-1 flex flex-col justify-start py-4">
        {/* Phase 0: Admin Management Dashboard */}
        {gamePhase === 'admin' && (
          <AdminPage
            onBackToGame={() => setGamePhase('party_builder')}
            onDataChanged={handleDataChanged}
          />
        )}

        {/* Phase 1: Party Builder Screen */}
        {gamePhase === 'party_builder' && (
          <PartyBuilder
            key={`party_builder_${dataVersion}`}
            party={party}
            onSelectPokemon={handleSelectPokemon}
            onRemovePokemon={handleRemovePokemon}
            onReorderLead={handleReorderLead}
            onSetParty={setParty}
            onStartChallenge={handleStartChallenge}
            onOpenDetail={(p) => setInspectPokemon(p)}
            onOpenOakChat={() => setIsOakChatOpen(true)}
            onOpenAdmin={() => setGamePhase('admin')}
          />
        )}

        {/* Phase 2: Elite Four Master Introduction Screen */}
        {gamePhase === 'elite_intro' && (
          <EliteFourIntro
            master={currentMaster}
            playerParty={party}
            onStartBattle={handleStartBattle}
            onOpenOakChat={() => setIsOakChatOpen(true)}
          />
        )}

        {/* Phase 3: Active Turn-Based Battle Screen */}
        {gamePhase === 'battle' && (
          <BattleScreen
            master={currentMaster}
            playerParty={party}
            onStageClear={handleStageClear}
            onGameOver={handleGameOver}
            onOpenOakChat={() => setIsOakChatOpen(true)}
            onOpenTypeChart={() => setIsTypeChartOpen(true)}
          />
        )}

        {/* Phase 4: Stage Cleared Modal */}
        {gamePhase === 'stage_clear' && (
          <StageClearModal
            defeatedMaster={currentMaster}
            party={party}
            nextStageNumber={currentStageIndex + 2}
            onProceed={handleProceedNextStage}
          />
        )}

        {/* Phase 5: Game Over Defeat Modal */}
        {gamePhase === 'game_over' && (
          <GameOverModal
            currentMaster={currentMaster}
            onRetryStage={handleRetryStage}
            onRebuildParty={handleResetGame}
            onOpenOakChat={() => setIsOakChatOpen(true)}
          />
        )}

        {/* Phase 6: League Champion Victory Screen */}
        {gamePhase === 'victory' && (
          <VictoryScreen
            party={party}
            eliteMasters={storedMasters}
            totalTurns={totalTurnsCount}
            onRestart={handleResetGame}
          />
        )}
      </main>

      {/* Detail Inspection Modal */}
      <PokemonDetailModal
        pokemon={inspectPokemon}
        onClose={() => setInspectPokemon(null)}
      />

      {/* Dr. Oak AI Coach Chat Drawer */}
      <OakCoachChat
        isOpen={isOakChatOpen}
        onClose={() => setIsOakChatOpen(false)}
        playerParty={party}
        activePlayerPokemon={party[0] || null}
        activeOpponentPokemon={currentMaster?.team[0] || null}
        currentMaster={gamePhase !== 'party_builder' && gamePhase !== 'admin' ? currentMaster : null}
      />

      {/* 18-Type Complete Chart Reference Modal */}
      <TypeChartModal
        isOpen={isTypeChartOpen}
        onClose={() => setIsTypeChartOpen(false)}
      />
    </div>
  );
}
