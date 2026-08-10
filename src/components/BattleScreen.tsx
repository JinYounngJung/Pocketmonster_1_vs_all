import React, { useState, useEffect } from 'react';
import {
  PokemonData,
  EliteFourMaster,
  Move,
  BattleLog,
  StatusCondition,
} from '../types/pokemon';
import { TypeBadge } from './TypeBadge';
import { PokemonStatusBadge } from './PokemonStatusBadge';
import { BattleControls } from './BattleControls';
import { BattleLogBox } from './BattleLogBox';
import { SwitchPokemonModal } from './SwitchPokemonModal';
import { SkillVFXLayer, ActiveSkillVFX } from './SkillVFXLayer';
import {
  calculateDamage,
  selectBestAIMove,
  getEffectiveSpeed,
  getStageMultiplier,
} from '../utils/battleEngine';
import { sounds } from '../utils/soundEffects';
import { getGameSettings } from '../utils/localStorageStore';
import { Shield, Sparkles, Heart, Zap, User } from 'lucide-react';

interface BattleScreenProps {
  master: EliteFourMaster;
  playerParty: PokemonData[];
  onStageClear: (updatedParty: PokemonData[]) => void;
  onGameOver: () => void;
  onOpenOakChat: () => void;
  onOpenTypeChart: () => void;
}

export const BattleScreen: React.FC<BattleScreenProps> = ({
  master,
  playerParty: initialParty,
  onStageClear,
  onGameOver,
  onOpenOakChat,
  onOpenTypeChart,
}) => {
  // Current state of battle
  const [playerParty, setPlayerParty] = useState<PokemonData[]>(() =>
    initialParty.map((p) => ({ ...p, moves: p.moves.map((m) => ({ ...m })) }))
  );
  const [opponentParty, setOpponentParty] = useState<PokemonData[]>(() =>
    master.team.map((p) => ({ ...p, moves: p.moves.map((m) => ({ ...m })) }))
  );

  const [activePlayerIdx, setActivePlayerIdx] = useState<number>(0);
  const [activeOpponentIdx, setActiveOpponentIdx] = useState<number>(0);

  const [logs, setLogs] = useState<BattleLog[]>([]);
  const [currentMessage, setCurrentMessage] = useState<string>(
    `사천왕 ${master.name}이(가) 승부를 걸어왔다!`
  );
  const [isProcessingTurn, setIsProcessingTurn] = useState<boolean>(false);
  const [isSwitchModalOpen, setIsSwitchModalOpen] = useState<boolean>(false);

  // Visual animation flags
  const [playerAnim, setPlayerAnim] = useState<'idle' | 'attack' | 'hit' | 'faint'>('idle');
  const [opponentAnim, setOpponentAnim] = useState<'idle' | 'attack' | 'hit' | 'faint'>('idle');
  const [activeVFX, setActiveVFX] = useState<ActiveSkillVFX | null>(null);

  const activePlayer = playerParty[activePlayerIdx];
  const activeOpponent = opponentParty[activeOpponentIdx];

  // Remaining pokemon counts
  const playerAliveCount = playerParty.filter((p) => p.currentHp > 0).length;
  const opponentAliveCount = opponentParty.filter((p) => p.currentHp > 0).length;

  const addLog = (text: string, type: BattleLog['type'] = 'normal') => {
    setLogs((prev) => [
      ...prev,
      { id: `${Date.now()}-${Math.random()}`, text, type, timestamp: Date.now() },
    ]);
  };

  const settings = getGameSettings();
  const speedFactor = settings.battleSpeed === 'instant' ? 0.3 : settings.battleSpeed === 'fast' ? 0.6 : 1.0;
  const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms * speedFactor));

  // Handle Player Selecting a Move
  const handleSelectMove = async (playerMove: Move) => {
    if (isProcessingTurn || activePlayer.currentHp <= 0 || activeOpponent.currentHp <= 0) return;

    setIsProcessingTurn(true);

    // Decrement player move PP
    const updatedPlayerMoves = activePlayer.moves.map((m) =>
      m.id === playerMove.id ? { ...m, pp: Math.max(0, m.pp - 1) } : m
    );
    let currentPlayer = { ...activePlayer, moves: updatedPlayerMoves };
    let currentOpponent = { ...activeOpponent };

    // AI selects best move
    const opponentMove = selectBestAIMove(currentOpponent, currentPlayer);

    // Determine turn order
    const playerPriority = playerMove.priority || 0;
    const opponentPriority = opponentMove.priority || 0;

    let playerGoesFirst = true;
    if (playerPriority !== opponentPriority) {
      playerGoesFirst = playerPriority > opponentPriority;
    } else {
      const playerSpeed = getEffectiveSpeed(currentPlayer);
      const opponentSpeed = getEffectiveSpeed(currentOpponent);
      if (playerSpeed === opponentSpeed) {
        playerGoesFirst = Math.random() < 0.5;
      } else {
        playerGoesFirst = playerSpeed > opponentSpeed;
      }
    }

    const firstAttacker = playerGoesFirst ? 'player' : 'opponent';

    // Execute First Attack
    if (firstAttacker === 'player') {
      const res = await executePokemonAttack(
        currentPlayer,
        currentOpponent,
        playerMove,
        'player'
      );
      currentPlayer = res.attacker;
      currentOpponent = res.defender;

      // Update state
      updatePokemonInParties(currentPlayer, currentOpponent);

      if (currentOpponent.currentHp <= 0) {
        await handleOpponentFaint(currentOpponent, currentPlayer);
        setIsProcessingTurn(false);
        return;
      }

      await sleep(700);

      // Execute Second Attack (Opponent)
      const res2 = await executePokemonAttack(
        currentOpponent,
        currentPlayer,
        opponentMove,
        'opponent'
      );
      currentOpponent = res2.attacker;
      currentPlayer = res2.defender;

      updatePokemonInParties(currentPlayer, currentOpponent);

      if (currentPlayer.currentHp <= 0) {
        await handlePlayerFaint(currentPlayer, currentOpponent);
        setIsProcessingTurn(false);
        return;
      }
    } else {
      // Opponent goes first
      const res = await executePokemonAttack(
        currentOpponent,
        currentPlayer,
        opponentMove,
        'opponent'
      );
      currentOpponent = res.attacker;
      currentPlayer = res.defender;

      updatePokemonInParties(currentPlayer, currentOpponent);

      if (currentPlayer.currentHp <= 0) {
        await handlePlayerFaint(currentPlayer, currentOpponent);
        setIsProcessingTurn(false);
        return;
      }

      await sleep(700);

      // Execute Second Attack (Player)
      const res2 = await executePokemonAttack(
        currentPlayer,
        currentOpponent,
        playerMove,
        'player'
      );
      currentPlayer = res2.attacker;
      currentOpponent = res2.defender;

      updatePokemonInParties(currentPlayer, currentOpponent);

      if (currentOpponent.currentHp <= 0) {
        await handleOpponentFaint(currentOpponent, currentPlayer);
        setIsProcessingTurn(false);
        return;
      }
    }

    // End of turn status damage (Burn / Poison)
    await sleep(400);
    const postStatusRes = handleEndOfTurnStatus(currentPlayer, currentOpponent);
    currentPlayer = postStatusRes.player;
    currentOpponent = postStatusRes.opponent;
    updatePokemonInParties(currentPlayer, currentOpponent);

    if (currentOpponent.currentHp <= 0) {
      await handleOpponentFaint(currentOpponent, currentPlayer);
    } else if (currentPlayer.currentHp <= 0) {
      await handlePlayerFaint(currentPlayer, currentOpponent);
    } else {
      setCurrentMessage('어떤 행동을 취하시겠습니까?');
    }

    setIsProcessingTurn(false);
  };

  // Execute single attack action
  const executePokemonAttack = async (
    attacker: PokemonData,
    defender: PokemonData,
    move: Move,
    side: 'player' | 'opponent'
  ): Promise<{ attacker: PokemonData; defender: PokemonData }> => {
    let currentAttacker = { ...attacker };
    let currentDefender = { ...defender };

    const attackerName =
      side === 'player' ? currentAttacker.name : `상대 ${currentAttacker.name}`;
    const defenderName =
      side === 'player' ? `상대 ${currentDefender.name}` : currentDefender.name;

    // Check paralysis
    if (currentAttacker.status === 'paralysis' && Math.random() < 0.25) {
      setCurrentMessage(`${attackerName}의 몸이 저려서 움직일 수 없다!`);
      addLog(`${attackerName}의 몸이 저려서 움직일 수 없다!`, 'status');
      await sleep(800);
      return { attacker: currentAttacker, defender: currentDefender };
    }

    // Announce move
    setCurrentMessage(`${attackerName}의 ${move.name}!`);
    addLog(`${attackerName}의 ${move.name}!`, 'normal');

    // Trigger visual skill effect overlay & elemental sound
    sounds.playMoveVFXSound(move.type, move.category, move.power || 0);
    setActiveVFX({
      id: `${side}-${Date.now()}`,
      moveName: move.name,
      moveType: move.type,
      category: move.category,
      power: move.power || 0,
      attackerSide: side,
    });
    setTimeout(() => setActiveVFX(null), 900);

    // Trigger attack animation
    if (side === 'player') {
      setPlayerAnim('attack');
      setTimeout(() => setPlayerAnim('idle'), 350);
    } else {
      setOpponentAnim('attack');
      setTimeout(() => setOpponentAnim('idle'), 350);
    }

    await sleep(450);

    // Accuracy check
    const accuracy = move.accuracy || 100;
    if (accuracy <= 100 && Math.random() * 100 > accuracy) {
      setCurrentMessage(`${attackerName}의 공격은 빗나갔다!`);
      addLog(`${attackerName}의 공격은 빗나갔다!`, 'normal');
      await sleep(700);
      return { attacker: currentAttacker, defender: currentDefender };
    }

    // Status Move Handler
    if (move.category === 'status') {
      // Heal moves
      if (move.healRatio) {
        const healAmount = Math.floor(currentAttacker.stats.hp * move.healRatio);
        const newHp = Math.min(currentAttacker.stats.hp, currentAttacker.currentHp + healAmount);
        currentAttacker.currentHp = newHp;
        sounds.playHeal();
        setCurrentMessage(`${attackerName}의 체력이 회복되었다!`);
        addLog(`${attackerName}의 체력이 ${healAmount}만큼 회복되었다!`, 'heal');
      }

      // Stat Changes
      if (move.statChanges) {
        move.statChanges.forEach((sc) => {
          if (sc.target === 'self') {
            const currentStage = currentAttacker.statStages[sc.stat] || 0;
            currentAttacker.statStages[sc.stat] = Math.max(-6, Math.min(6, currentStage + sc.stages));
            const statNameKr: Record<string, string> = {
              attack: '공격',
              defense: '방어',
              spAttack: '특수공격',
              spDefense: '특수방어',
              speed: '스피드',
            };
            const changeWord = sc.stages >= 2 ? '크게 올랐다!' : '올랐다!';
            setCurrentMessage(`${attackerName}의 ${statNameKr[sc.stat] || sc.stat}이(가) ${changeWord}`);
            addLog(`${attackerName}의 ${statNameKr[sc.stat] || sc.stat} +${sc.stages}`, 'status');
          } else {
            const currentStage = currentDefender.statStages[sc.stat] || 0;
            currentDefender.statStages[sc.stat] = Math.max(-6, Math.min(6, currentStage + sc.stages));
            const statNameKr: Record<string, string> = {
              attack: '공격',
              defense: '방어',
              spAttack: '특수공격',
              spDefense: '특수방어',
              speed: '스피드',
            };
            setCurrentMessage(`${defenderName}의 ${statNameKr[sc.stat] || sc.stat}이(가) 떨어졌다!`);
            addLog(`${defenderName}의 ${statNameKr[sc.stat] || sc.stat} ${sc.stages}`, 'status');
          }
        });
      }

      // Status conditions
      if (move.statusEffect && currentDefender.status === 'none') {
        const condition = move.statusEffect.status;
        currentDefender.status = condition;
        const statusKr: Record<StatusCondition, string> = {
          burn: '화상에 걸렸다!',
          paralysis: '마비되어 기술을 쓰기 어려워졌다!',
          poison: '독에 걸렸다!',
          badPoison: '맹독에 걸렸다!',
          sleep: '깊은 잠에 빠졌다!',
          freeze: '얼어붙어 움직일 수 없다!',
          none: '',
        };
        setCurrentMessage(`${defenderName}은(는) ${statusKr[condition]}`);
        addLog(`${defenderName}: ${statusKr[condition]}`, 'status');
      }

      await sleep(700);
      return { attacker: currentAttacker, defender: currentDefender };
    }

    // Damage Calculation
    const dmgResult = calculateDamage(currentAttacker, currentDefender, move);

    // Check Disguise (탈) on Mimikyu
    if (
      currentDefender.dexNumber === 778 &&
      currentDefender.ability.name === '탈' &&
      !currentDefender.fainted &&
      dmgResult.damage > 0
    ) {
      currentDefender.ability = { ...currentDefender.ability, name: '탈(파괴됨)' };
      setCurrentMessage(`따라큐의 탈이 대신 공격을 막아냈다!`);
      addLog(`따라큐의 탈이 깨졌다!`, 'resist');
      sounds.playHit();
      await sleep(700);
      return { attacker: currentAttacker, defender: currentDefender };
    }

    // Play hit sound & anim on defender
    if (side === 'player') {
      setOpponentAnim('hit');
      setTimeout(() => setOpponentAnim('idle'), 350);
    } else {
      setPlayerAnim('hit');
      setTimeout(() => setPlayerAnim('idle'), 350);
    }

    if (dmgResult.isSuperEffective) {
      sounds.playSuperEffective();
    } else if (dmgResult.isCrit) {
      sounds.playCritical();
    } else {
      sounds.playHit();
    }

    // Apply Damage
    currentDefender.currentHp = Math.max(0, currentDefender.currentHp - dmgResult.damage);

    // Announce Effectiveness / Crit
    if (dmgResult.isCrit) {
      addLog('급소에 맞았다!', 'crit');
    }
    if (dmgResult.isSuperEffective) {
      setCurrentMessage('효과는 굉장했다!');
      addLog(`효과는 굉장했다! (${dmgResult.typeEffectiveness}x)`, 'effective');
    } else if (dmgResult.isNotVeryEffective) {
      setCurrentMessage('효과가 별로인 듯하다...');
      addLog(`효과가 별로인 듯하다 (${dmgResult.typeEffectiveness}x)`, 'resist');
    } else if (dmgResult.isImmune) {
      setCurrentMessage('효과가 없는 것 같다...');
      addLog('효과가 없는 것 같다... (0x)', 'resist');
    }

    // Recoil or Drain
    if (move.drainRatio && dmgResult.damage > 0) {
      const drain = Math.floor(dmgResult.damage * move.drainRatio);
      currentAttacker.currentHp = Math.min(
        currentAttacker.stats.hp,
        currentAttacker.currentHp + drain
      );
      addLog(`${attackerName}은(는) 체력을 흡수했다!`, 'heal');
    }

    if (move.recoilRatio && dmgResult.damage > 0) {
      const recoil = Math.max(1, Math.floor(dmgResult.damage * move.recoilRatio));
      currentAttacker.currentHp = Math.max(0, currentAttacker.currentHp - recoil);
      addLog(`${attackerName}은(는) 반동 데미지를 입었다!`, 'normal');
    }

    await sleep(700);
    return { attacker: currentAttacker, defender: currentDefender };
  };

  // End of turn status damage
  const handleEndOfTurnStatus = (
    player: PokemonData,
    opponent: PokemonData
  ): { player: PokemonData; opponent: PokemonData } => {
    let p = { ...player };
    let o = { ...opponent };

    if (p.status === 'burn' && p.currentHp > 0) {
      const burnDmg = Math.max(1, Math.floor(p.stats.hp / 16));
      p.currentHp = Math.max(0, p.currentHp - burnDmg);
      addLog(`${p.name}은(는) 화상 데미지를 입었다!`, 'status');
    } else if (p.status === 'poison' && p.currentHp > 0) {
      const poisonDmg = Math.max(1, Math.floor(p.stats.hp / 8));
      p.currentHp = Math.max(0, p.currentHp - poisonDmg);
      addLog(`${p.name}은(는) 독 데미지를 입었다!`, 'status');
    }

    if (o.status === 'burn' && o.currentHp > 0) {
      const burnDmg = Math.max(1, Math.floor(o.stats.hp / 16));
      o.currentHp = Math.max(0, o.currentHp - burnDmg);
      addLog(`상대 ${o.name}은(는) 화상 데미지를 입었다!`, 'status');
    } else if (o.status === 'poison' && o.currentHp > 0) {
      const poisonDmg = Math.max(1, Math.floor(o.stats.hp / 8));
      o.currentHp = Math.max(0, o.currentHp - poisonDmg);
      addLog(`상대 ${o.name}은(는) 독 데미지를 입었다!`, 'status');
    }

    return { player: p, opponent: o };
  };

  // Update parties helper
  const updatePokemonInParties = (player: PokemonData, opponent: PokemonData) => {
    setPlayerParty((prev) =>
      prev.map((p, idx) => (idx === activePlayerIdx ? player : p))
    );
    setOpponentParty((prev) =>
      prev.map((p, idx) => (idx === activeOpponentIdx ? opponent : p))
    );
  };

  // Handle Opponent Fainting
  const handleOpponentFaint = async (faintedEnemy: PokemonData, playerPkmn: PokemonData) => {
    setOpponentAnim('faint');
    sounds.playFaint();
    setCurrentMessage(`상대 ${faintedEnemy.name}은(는) 쓰러졌다!`);
    addLog(`상대 ${faintedEnemy.name} 쓰러짐!`, 'faint');
    await sleep(1000);

    // Check if opponent has more Pokemon
    const nextEnemyIdx = opponentParty.findIndex(
      (p, idx) => idx !== activeOpponentIdx && p.currentHp > 0
    );

    if (nextEnemyIdx !== -1) {
      // Send next opponent
      const nextEnemy = opponentParty[nextEnemyIdx];
      setActiveOpponentIdx(nextEnemyIdx);
      setOpponentAnim('idle');
      setCurrentMessage(`사천왕 ${master.name}이(가) ${nextEnemy.name}을(를) 내보냈다!`);
      addLog(`사천왕 ${master.name}: ${nextEnemy.name} 투입!`, 'switch');
      await sleep(900);
    } else {
      // Stage Cleared!
      sounds.playVictory();
      setCurrentMessage(`사천왕 ${master.name}과의 승부에서 승리했다!`);
      addLog(`사천왕 ${master.name} 격파 완료!`, 'crit');
      await sleep(1200);
      onStageClear(playerParty);
    }
  };

  // Handle Player Fainting
  const handlePlayerFaint = async (faintedPlayer: PokemonData, enemyPkmn: PokemonData) => {
    setPlayerAnim('faint');
    sounds.playFaint();
    setCurrentMessage(`${faintedPlayer.name}은(는) 쓰러졌다!`);
    addLog(`${faintedPlayer.name} 쓰러짐!`, 'faint');
    await sleep(1000);

    const hasAlive = playerParty.some((p) => p.currentHp > 0);
    if (!hasAlive) {
      // All party fainted
      setCurrentMessage('사용할 수 있는 포켓몬이 없다! 눈앞이 캄캄해졌다...');
      addLog('파티 전원 전투 불능!', 'faint');
      await sleep(1200);
      onGameOver();
    } else {
      // Prompt force switch
      setCurrentMessage('다음으로 내보낼 포켓몬을 선택하세요!');
      setIsSwitchModalOpen(true);
    }
  };

  // Handle Player Switch
  const handleSwitchPokemon = async (targetIndex: number) => {
    if (targetIndex === activePlayerIdx || playerParty[targetIndex].currentHp <= 0) return;

    setIsSwitchModalOpen(false);
    setIsProcessingTurn(true);

    const incoming = playerParty[targetIndex];
    sounds.playClick();
    setCurrentMessage(`돌아와, ${activePlayer.name}! 가라, ${incoming.name}!`);
    addLog(`포켓몬 교체: ${activePlayer.name} ➜ ${incoming.name}`, 'switch');
    setActivePlayerIdx(targetIndex);
    setPlayerAnim('idle');

    await sleep(900);

    // If opponent is still conscious, opponent gets a free attack on switch-in!
    if (activeOpponent.currentHp > 0) {
      let currentOpponent = { ...activeOpponent };
      let newActivePlayer = { ...incoming };

      const opponentMove = selectBestAIMove(currentOpponent, newActivePlayer);
      const res = await executePokemonAttack(
        currentOpponent,
        newActivePlayer,
        opponentMove,
        'opponent'
      );

      currentOpponent = res.attacker;
      newActivePlayer = res.defender;

      setPlayerParty((prev) =>
        prev.map((p, idx) => (idx === targetIndex ? newActivePlayer : p))
      );
      setOpponentParty((prev) =>
        prev.map((p, idx) => (idx === activeOpponentIdx ? currentOpponent : p))
      );

      if (newActivePlayer.currentHp <= 0) {
        await handlePlayerFaint(newActivePlayer, currentOpponent);
      } else {
        setCurrentMessage('어떤 행동을 취하시겠습니까?');
      }
    }

    setIsProcessingTurn(false);
  };

  const playerHpPct = Math.max(0, Math.min(100, (activePlayer.currentHp / activePlayer.stats.hp) * 100));
  const opponentHpPct = Math.max(0, Math.min(100, (activeOpponent.currentHp / activeOpponent.stats.hp) * 100));

  return (
    <div
      id="battle-screen-container"
      className="w-full max-w-5xl mx-auto px-2 sm:px-4 py-4 space-y-4 animate-fade-in"
    >
      {/* Top Banner: Master Info & Pokeball Counters */}
      <div className="flex items-center justify-between bg-slate-900 px-4 py-2.5 border-2 border-black shadow-[4px_4px_0px_#000] text-xs">
        <div className="flex items-center gap-2">
          <span className="font-black text-yellow-400 uppercase">사천왕 {master.name}</span>
          <span className="text-slate-500 font-bold">|</span>
          <span className="text-white font-black uppercase">STAGE {master.stage} / 4</span>
        </div>

        {/* Master Specialty Badges */}
        <div className="flex items-center gap-1.5">
          {master.specialtyTypes.map((t) => (
            <TypeBadge key={t} type={t} size="sm" />
          ))}
        </div>
      </div>

      {/* Main Battle Field Arena */}
      <div
        className={`relative w-full bg-gradient-to-b ${master.bgGradient} border-4 border-black shadow-[8px_8px_0px_#000] p-4 sm:p-8 min-h-[360px] sm:min-h-[420px] flex flex-col justify-between overflow-hidden`}
      >
        {/* Visual Skill Effects Layer */}
        <SkillVFXLayer vfx={activeVFX} />

        {/* Background Grid Pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

        {/* TOP SECTION: Opponent Pokemon HUD & Sprite */}
        <div className="relative z-10 grid grid-cols-12 items-center gap-4">
          {/* Opponent HUD (Left) */}
          <div className="col-span-12 sm:col-span-6 bg-slate-900 p-3.5 sm:p-4 border-2 border-black shadow-[4px_4px_0px_#000] space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-black text-sm sm:text-base text-white uppercase tracking-tight">
                  {activeOpponent.name}
                </span>
                <span className="text-[10px] font-black px-1.5 py-0.2 bg-red-600 text-white border border-black uppercase shadow-[1px_1px_0px_#000]">
                  Lv.50
                </span>
              </div>

              {/* Pokeball Counter for Remaining Enemy Team */}
              <div className="flex items-center gap-1">
                {opponentParty.map((p, i) => (
                  <span
                    key={i}
                    className={`w-3 h-3 border-2 border-black ${
                      p.currentHp > 0 ? 'bg-red-500 shadow-[1px_1px_0px_#000]' : 'bg-slate-700 opacity-40'
                    }`}
                    title={p.name}
                  />
                ))}
              </div>
            </div>

            {/* Types & Status Badges */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {activeOpponent.types.map((t) => (
                <TypeBadge key={t} type={t} size="sm" />
              ))}
              <PokemonStatusBadge
                status={activeOpponent.status}
                statStages={activeOpponent.statStages}
              />
            </div>

            {/* Opponent HP Bar */}
            <div className="space-y-1 pt-1">
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-300 font-bold">
                <span className="text-yellow-400 font-black">HP</span>
                <span
                  className={`font-black ${
                    opponentHpPct > 50
                      ? 'text-green-400'
                      : opponentHpPct > 20
                      ? 'text-yellow-400'
                      : 'text-red-400'
                  }`}
                >
                  {activeOpponent.currentHp} / {activeOpponent.stats.hp}
                </span>
              </div>
              <div className="w-full h-3 bg-slate-950 border-2 border-black overflow-hidden p-0.5 shadow-[inset_1px_1px_2px_#000]">
                <div
                  className={`h-full transition-all duration-500 ${
                    opponentHpPct > 50
                      ? 'bg-green-500'
                      : opponentHpPct > 20
                      ? 'bg-yellow-400'
                      : 'bg-red-500'
                  }`}
                  style={{ width: `${opponentHpPct}%` }}
                />
              </div>
            </div>
          </div>

          {/* Opponent Sprite (Right) */}
          <div className="col-span-12 sm:col-span-6 flex justify-center sm:justify-end items-center">
            <div
              className={`relative w-36 h-36 sm:w-48 sm:h-48 flex items-center justify-center transition-transform duration-200 ${
                opponentAnim === 'attack'
                  ? 'translate-x-[-20px] scale-110'
                  : opponentAnim === 'hit'
                  ? 'animate-shake filter brightness-150'
                  : opponentAnim === 'faint'
                  ? 'opacity-0 translate-y-10 scale-75 transition-all duration-700'
                  : 'animate-float'
              }`}
            >
              {/* Ground Shadow */}
              <div className="absolute bottom-2 w-28 h-6 bg-black/60 rounded-full blur-xs" />
              <img
                src={activeOpponent.spriteFront}
                alt={activeOpponent.name}
                className="max-h-full object-contain filter drop-shadow-2xl scale-125"
              />
            </div>
          </div>
        </div>

        {/* BOTTOM SECTION: Player Pokemon Sprite & HUD */}
        <div className="relative z-10 grid grid-cols-12 items-center gap-4 mt-6">
          {/* Player Sprite (Left) */}
          <div className="col-span-12 sm:col-span-6 flex justify-center sm:justify-start items-center order-2 sm:order-1">
            <div
              className={`relative w-36 h-36 sm:w-48 sm:h-48 flex items-center justify-center transition-transform duration-200 ${
                playerAnim === 'attack'
                  ? 'translate-x-[20px] scale-110'
                  : playerAnim === 'hit'
                  ? 'animate-shake filter brightness-150'
                  : playerAnim === 'faint'
                  ? 'opacity-0 translate-y-10 scale-75 transition-all duration-700'
                  : ''
              }`}
            >
              {/* Ground Shadow */}
              <div className="absolute bottom-2 w-28 h-6 bg-black/60 rounded-full blur-xs" />
              <img
                src={activePlayer.spriteBack || activePlayer.spriteFront}
                alt={activePlayer.name}
                className="max-h-full object-contain filter drop-shadow-2xl scale-125"
              />
            </div>
          </div>

          {/* Player HUD (Right) */}
          <div className="col-span-12 sm:col-span-6 bg-slate-900 p-3.5 sm:p-4 border-2 border-black shadow-[4px_4px_0px_#000] space-y-2 order-1 sm:order-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-black text-sm sm:text-base text-white uppercase tracking-tight">
                  {activePlayer.name}
                </span>
                <span className="text-[10px] font-black px-1.5 py-0.2 bg-yellow-400 text-black border border-black uppercase shadow-[1px_1px_0px_#000]">
                  Lv.50
                </span>
              </div>

              {/* Pokeball Counter for Remaining Player Team */}
              <div className="flex items-center gap-1">
                {playerParty.map((p, i) => (
                  <span
                    key={i}
                    className={`w-3 h-3 border-2 border-black ${
                      p.currentHp > 0 ? 'bg-green-500 shadow-[1px_1px_0px_#000]' : 'bg-slate-700 opacity-40'
                    }`}
                    title={p.name}
                  />
                ))}
              </div>
            </div>

            {/* Types & Status Badges */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {activePlayer.types.map((t) => (
                <TypeBadge key={t} type={t} size="sm" />
              ))}
              <PokemonStatusBadge
                status={activePlayer.status}
                statStages={activePlayer.statStages}
              />
            </div>

            {/* Player HP Bar */}
            <div className="space-y-1 pt-1">
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-300 font-bold">
                <span className="text-yellow-400 font-black">HP</span>
                <span
                  className={`font-black ${
                    playerHpPct > 50
                      ? 'text-green-400'
                      : playerHpPct > 20
                      ? 'text-yellow-400'
                      : 'text-red-400'
                  }`}
                >
                  {activePlayer.currentHp} / {activePlayer.stats.hp}
                </span>
              </div>
              <div className="w-full h-3 bg-slate-950 border-2 border-black overflow-hidden p-0.5 shadow-[inset_1px_1px_2px_#000]">
                <div
                  className={`h-full transition-all duration-500 ${
                    playerHpPct > 50
                      ? 'bg-green-500'
                      : playerHpPct > 20
                      ? 'bg-yellow-400'
                      : 'bg-red-500'
                  }`}
                  style={{ width: `${playerHpPct}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Battle Log Message Display Box */}
      <BattleLogBox
        logs={logs}
        currentActionMessage={currentMessage}
        isProcessingTurn={isProcessingTurn}
      />

      {/* 4 Moves & Tactical Action Controls */}
      <BattleControls
        playerPokemon={activePlayer}
        opponentPokemon={activeOpponent}
        isProcessingTurn={isProcessingTurn}
        onSelectMove={handleSelectMove}
        onOpenSwitchModal={() => setIsSwitchModalOpen(true)}
        onOpenOakChat={onOpenOakChat}
        onOpenTypeChart={onOpenTypeChart}
      />

      {/* Switch Party Member Modal */}
      <SwitchPokemonModal
        party={playerParty}
        activePokemonIndex={activePlayerIdx}
        isOpen={isSwitchModalOpen}
        onClose={() => setIsSwitchModalOpen(false)}
        onSelectSwitch={handleSwitchPokemon}
      />
    </div>
  );
};
