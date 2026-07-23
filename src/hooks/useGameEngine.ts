import { useState, useEffect, useRef } from 'react';
import { Player, PlayerType, Direction, ActionButton, StatusEffect } from '../types';
import { CHARACTERS } from '../data/characters';
import { getTechnique, TechniqueDef } from '../data/techniques';
import { audio } from '../utils/audio';

const SFX_VOICE_ATTACK = ['attack_female_1', 'attack_female_2', 'attack_female_3', 'attack_male_1', 'attack_male_2', 'attack_male_3'];
const SFX_MAGICS = ['magic_1', 'magic_2', 'magic_3'];
const SFX_DODGES = ['dodge_1', 'dodge_2'];
const SFX_HEALS = ['magic_1'];

export type GamePhase = 'INIT' | 'DIALOGUE' | 'NEUTRAL' | 'RESOLVING' | 'CLASH' | 'GAME_OVER';

export interface ActionPayload {
  direction: Direction;
  button: string;
  charge: number;
  techId: string;
}

const getRandomSFX = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];

function createPlayerState(playerId: PlayerType, charId: string): Player {
  const char = CHARACTERS.find(c => c.id === charId) || CHARACTERS[0];
  return {
    id: playerId,
    charId: char.id,
    name: char.name,
    hp: char.maxHp,
    maxHp: char.maxHp,
    stamina: char.maxStamina,
    maxStamina: char.maxStamina,
    limit: 0,
    isKnockedDown: false,
    isAirborne: false,
    clashScore: 0,
    comboCount: 0,
    isExhausted: false,
    effects: [],
    color: char.color,
    bgGradient: char.bgGradient,
    arenaBg: char.arenaBg,
    arenaBorder: char.arenaBorder,
    arenaText: char.arenaText,
    avatars: char.avatars
  };
}

export function useGameEngine({ 
  mode = 'versus', 
  isPVP = false,
  p1CharId = 'kaelen',
  p2CharId = 'darius',
  difficulty = 'NORMAL',
  timer = 60
}: { 
  mode?: string, 
  isPVP?: boolean,
  p1CharId?: string,
  p2CharId?: string,
  difficulty?: 'EASY' | 'NORMAL' | 'HARD',
  timer?: number
} = {}) {
  const [p1, setP1] = useState<Player>(() => createPlayerState('P1', p1CharId));
  const [cpu, setCpu] = useState<Player>(() => createPlayerState(isPVP ? 'P2' : 'CPU', p2CharId));
  
  const [phase, setPhase] = useState<GamePhase>('INIT');
  const [activeDirection, setActiveDirection] = useState<Direction>('NONE');
  const [chargeLevel, setChargeLevel] = useState(0);
  const chargeIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [p2ActiveDirection, setP2ActiveDirection] = useState<Direction>('NONE');
  const [p2ChargeLevel, setP2ChargeLevel] = useState(0);
  const p2ChargeIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const activeDirRef = useRef<Direction>('NONE');
  const chargeLevelRef = useRef<number>(0);
  const p2ActiveDirRef = useRef<Direction>('NONE');
  const p2ChargeLevelRef = useRef<number>(0);

  useEffect(() => {
    activeDirRef.current = activeDirection;
    chargeLevelRef.current = chargeLevel;
    p2ActiveDirRef.current = p2ActiveDirection;
    p2ChargeLevelRef.current = p2ChargeLevel;
  }, [activeDirection, chargeLevel, p2ActiveDirection, p2ChargeLevel]);

  const [turnState, setTurnState] = useState<{ p1Action: ActionPayload | null; cpuAction: ActionPayload | null, clashInitiated?: boolean, clashWinner?: 'P1'|'CPU'|'DRAW' }>({
    p1Action: null,
    cpuAction: null
  });
  
  const [clashTimeLeft, setClashTimeLeft] = useState(0);

  const [reactionTimeLeft, setReactionTimeLeft] = useState(0);
  const reactionTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (phase === 'NEUTRAL') {
       if ((turnState.p1Action && !turnState.cpuAction) || (!turnState.p1Action && turnState.cpuAction)) {
          if (!reactionTimerRef.current) {
             setReactionTimeLeft(100);
             reactionTimerRef.current = setInterval(() => {
                setReactionTimeLeft(prev => {
                   if (prev <= 0) {
                      if (reactionTimerRef.current) clearInterval(reactionTimerRef.current);
                      reactionTimerRef.current = null;
                      
                      const payload: ActionPayload = { direction: 'NONE', button: 'A', charge: 0, techId: 'A' };
                      setTurnState(ts => {
                         const nextState = { ...ts };
                         if (!ts.p1Action) nextState.p1Action = payload;
                         if (!ts.cpuAction) nextState.cpuAction = payload;
                         if (nextState.p1Action && nextState.cpuAction) setPhase('RESOLVING');
                         return nextState;
                      });
                      
                      return 0;
                   }
                   return prev - 2;
                });
             }, 50);
          }
       } else {
          if (reactionTimerRef.current) {
             clearInterval(reactionTimerRef.current);
             reactionTimerRef.current = null;
          }
          setReactionTimeLeft(0);
       }
    } else {
       if (reactionTimerRef.current) {
          clearInterval(reactionTimerRef.current);
          reactionTimerRef.current = null;
       }
       setReactionTimeLeft(0);
    }
  }, [phase, turnState]);

  const [combatLog, setCombatLog] = useState<{ id: string; msg: string; type: string }[]>([]);
  const addLog = (msg: string, type: string = 'info') => {
    setCombatLog(prev => [{ id: Math.random().toString(), msg, type }, ...prev].slice(0, 5));
  };
  
  const [animState, setAnimState] = useState<{p1: string, cpu: string}>({ p1: 'idle', cpu: 'idle' });
  const [cinematic, setCinematic] = useState<{activePlayer: 'P1'|'CPU', event: 'technique_intro' | 'hit' | 'dodge' | 'block' | 'heal', techniqueName: string, damage?: number} | null>(null);
  
  const [floatingTexts, setFloatingTexts] = useState<{id: string, text: string, type: 'damage'|'heal'|'block'|'dodge'|'exhausted', player: 'P1'|'CPU', xOffset: number, yOffset: number}[]>([]);
  const addFloatingText = (text: string, type: 'damage'|'heal'|'block'|'dodge'|'exhausted', player: 'P1'|'CPU') => {
    const id = Math.random().toString();
    const xOffset = (Math.random() - 0.5) * 80;
    const yOffset = (Math.random() - 0.5) * 60;
    setFloatingTexts(prev => [...prev, { id, text, type, player, xOffset, yOffset }]);
    setTimeout(() => {
      setFloatingTexts(prev => prev.filter(f => f.id !== id));
    }, 1500);
  };
  
  const [countdown, setCountdown] = useState<number | null>(3);
  const [matchTimer, setMatchTimer] = useState<number>(timer);
  const [dialogueStep, setDialogueStep] = useState<number>(0);
  const [activeDialogues, setActiveDialogues] = useState<{p1: string, p2: string}>({p1: '...', p2: '...'});
  
  const isP1Turn = true; // no longer relevant

  useEffect(() => {
    if (phase === 'INIT') {
      const char1 = CHARACTERS.find(c => c.id === p1CharId) || CHARACTERS[0];
      const char2 = CHARACTERS.find(c => c.id === p2CharId) || CHARACTERS[1];
      setActiveDialogues({
        p1: char1.dialogues?.intro[Math.floor(Math.random() * (char1.dialogues?.intro.length || 1))] || '...',
        p2: char2.dialogues?.intro[Math.floor(Math.random() * (char2.dialogues?.intro.length || 1))] || '...'
      });
      setMatchTimer(timer);
      setDialogueStep(0);
      setPhase('DIALOGUE');
    } else if (phase === 'GAME_OVER') {
      const p1Data = CHARACTERS.find(c => c.id === p1.charId);
      const p2Data = CHARACTERS.find(c => c.id === cpu.charId);
      const p1Lines = p1Data?.dialogues?.victory || ['...'];
      const p2Lines = p2Data?.dialogues?.victory || ['...'];
      
      setActiveDialogues({
        p1: p1Lines[Math.floor(Math.random() * p1Lines.length)],
        p2: p2Lines[Math.floor(Math.random() * p2Lines.length)]
      });
    }
  }, [phase, p1CharId, p2CharId, timer]);

  useEffect(() => {
    if (phase === 'DIALOGUE') {
       if (dialogueStep === 0) {
          const timer = setTimeout(() => setDialogueStep(1), 3000);
          return () => clearTimeout(timer);
       } else if (dialogueStep === 1) {
          const timer = setTimeout(() => setDialogueStep(2), 3000);
          return () => clearTimeout(timer);
       } else if (dialogueStep === 2) {
          let count = 3;
          setCountdown(count);
          audio.playSFX('time_seconds');
          const timer = setInterval(() => {
            count--;
            if (count > 0) {
              setCountdown(count);
              audio.playSFX('time_seconds');
            } else if (count === 0) {
              setCountdown(0);
              audio.playSFX('fight_voice_1');
            } else {
              clearInterval(timer);
              setCountdown(null);
              setDialogueStep(3);
              setPhase('NEUTRAL');
            }
          }, 1000);
          return () => clearInterval(timer);
       }
    }
  }, [phase, dialogueStep]);

  useEffect(() => {
    if (matchTimer <= 0 || matchTimer === 999) return;
    if (phase === 'NEUTRAL') {
       const timerInterval = setInterval(() => {
          setMatchTimer(prev => {
             if (prev <= 1) {
                clearInterval(timerInterval);
                return 0;
             }
             return prev - 1;
          });
       }, 1000);
       return () => clearInterval(timerInterval);
    }
  }, [phase, matchTimer]);

  const createStartCharge = (playerId: 'P1'|'P2') => (dir: Direction) => {
    if (phase !== 'NEUTRAL') return;
    if (playerId === 'P1') {
      if (activeDirection === dir) return;
      setActiveDirection(dir);
      setChargeLevel(0);
      if (chargeIntervalRef.current) clearInterval(chargeIntervalRef.current);
      chargeIntervalRef.current = setInterval(() => {
        setChargeLevel(prev => Math.min(100, prev + 5));
      }, 50);
    } else {
      if (p2ActiveDirection === dir) return;
      setP2ActiveDirection(dir);
      setP2ChargeLevel(0);
      if (p2ChargeIntervalRef.current) clearInterval(p2ChargeIntervalRef.current);
      p2ChargeIntervalRef.current = setInterval(() => {
        setP2ChargeLevel(prev => Math.min(100, prev + 5));
      }, 50);
    }
  };

  const startCharge = createStartCharge('P1');
  const p2StartCharge = createStartCharge('P2');

  const createCancelCharge = (playerId: 'P1'|'P2') => () => {
    if (playerId === 'P1') {
      setActiveDirection('NONE');
      setChargeLevel(0);
      if (chargeIntervalRef.current) clearInterval(chargeIntervalRef.current);
    } else {
      setP2ActiveDirection('NONE');
      setP2ChargeLevel(0);
      if (p2ChargeIntervalRef.current) clearInterval(p2ChargeIntervalRef.current);
    }
  };

  const cancelCharge = createCancelCharge('P1');
  const p2CancelCharge = createCancelCharge('P2');

  const createExecuteAction = (playerId: 'P1'|'P2') => (button: ActionButton) => {
    const isP1 = playerId === 'P1';
    const playerState = isP1 ? p1 : cpu;
    
    if (phase === 'CLASH') {
       if (isP1) {
          setP1(p => ({ ...p, clashScore: p.clashScore + 1 }));
       } else {
          setCpu(c => ({ ...c, clashScore: c.clashScore + 1 }));
       }
       return;
    }

    if (phase !== 'NEUTRAL') return;
    
    // Disable action check for CPU if they bypass it
    if (isP1 && turnState.p1Action) return;
    if (!isP1 && turnState.cpuAction) return;
    
    // Check if the other player already acted and the turn timer expired
    // We'll manage the turn timer via a useEffect instead.
    
    if (playerState.isExhausted || playerState.isKnockedDown) {
       if (playerState.isKnockedDown) {
         addLog(`${playerState.name} se está levantando y pierde el turno.`, 'system');
       } else {
         addFloatingText('FATIGA', 'exhausted', isP1 ? 'P1' : 'CPU');
         addLog(`${playerState.name} está exhausto y pierde su turno.`, 'system');
       }
       
       if (isP1) {
          setP1(p => ({ ...p, isExhausted: false, isKnockedDown: false, comboCount: 0, stamina: Math.min(p.maxStamina, p.stamina + 20) }));
          cancelCharge();
       } else {
          setCpu(c => ({ ...c, isExhausted: false, isKnockedDown: false, comboCount: 0, stamina: Math.min(c.maxStamina, c.stamina + 20) }));
          p2CancelCharge();
       }

       const payload: ActionPayload = { direction: 'NONE', button: '', charge: 0, techId: '' };
       setTurnState(prev => {
          const nextState = { ...prev, [isP1 ? 'p1Action' : 'cpuAction']: payload };
          if (nextState.p1Action && nextState.cpuAction) setPhase('RESOLVING');
          return nextState;
       });
       return;
    }

    let dir = isP1 ? activeDirRef.current : p2ActiveDirRef.current;
    let charge = isP1 ? chargeLevelRef.current : p2ChargeLevelRef.current;

    if (button === 'ULTIMATE') {
       if (playerState.limit < 100) return;
       dir = 'ULTIMATE';
       charge = 100;
    }

    if (dir !== 'NONE' && dir !== 'ULTIMATE' && charge === 0) return;

    const tech = getTechnique(playerState.charId, dir, button);
    if (!tech) return;

    if (playerState.stamina < tech.cost) {
      addFloatingText('SIN ENERGÍA', 'exhausted', isP1 ? 'P1' : 'CPU');
      addLog(`¡No tienes suficiente energía para ${tech.name}!`, 'system');
      if (isP1) cancelCharge();
      else p2CancelCharge();
      return;
    }

    const payload: ActionPayload = {
      direction: dir,
      button: button,
      charge: dir === 'NONE' ? 100 : charge,
      techId: tech.id
    };

    if (isP1) cancelCharge();
    else p2CancelCharge();

    setTurnState(prev => {
       const nextState = { ...prev, [isP1 ? 'p1Action' : 'cpuAction']: payload };
       if (nextState.p1Action && nextState.cpuAction) setPhase('RESOLVING');
       return nextState;
    });
  };

  const executeAction = createExecuteAction('P1');
  const p2ExecuteAction = createExecuteAction('P2');

  // CPU Logic
  useEffect(() => {
    if (!isPVP && phase === 'NEUTRAL' && !turnState.cpuAction) {
      if (cpu.isKnockedDown) {
        p2ExecuteAction('V'); // auto-trigger exhaust logic
        return;
      }
      
      const isHard = difficulty === 'HARD';
      const isEasy = difficulty === 'EASY';
      const baseDelay = isEasy ? 2000 + Math.random() * 2000 : 
                        isHard ? 500 + Math.random() * 1000 :
                        1000 + Math.random() * 2000;
      
      const timer = setTimeout(() => {
        const staminaLow = cpu.stamina < cpu.maxStamina * 0.3;
        const p1HpLow = p1.hp < p1.maxHp * 0.3;

        let chosenDir: Direction = 'NONE';

        if (isHard && activeDirection !== 'NONE') {
            chosenDir = Math.random() > 0.5 ? 'UP' : 'NONE';
        } else if (staminaLow) {
            chosenDir = Math.random() > 0.3 ? 'RIGHT' : 'NONE';
        } else if (p1HpLow) {
            chosenDir = Math.random() > 0.3 ? 'DOWN' : 'UP';
        } else {
            const dirs: Direction[] = ['UP', 'DOWN', 'LEFT', 'RIGHT', 'NONE'];
            chosenDir = dirs[Math.floor(Math.random() * dirs.length)];
        }

        let techList = CHAR_TECHNIQUES_DB[cpu.charId][chosenDir] || [];
        let affordableTechs = techList.filter(t => t.cost <= cpu.stamina);

        if (affordableTechs.length === 0) {
           const allDirs: Direction[] = ['UP', 'DOWN', 'LEFT', 'RIGHT', 'NONE'];
           affordableTechs = [];
           allDirs.forEach(d => {
             const ts = CHAR_TECHNIQUES_DB[cpu.charId][d] || [];
             affordableTechs = affordableTechs.concat(ts.filter(t => t.cost <= cpu.stamina));
           });
        }
        
        if (affordableTechs.length > 0) {
          let chosenTech = affordableTechs[Math.floor(Math.random() * affordableTechs.length)];
          const finalDir = Object.keys(CHAR_TECHNIQUES_DB[cpu.charId]).find(dir => 
            CHAR_TECHNIQUES_DB[cpu.charId][dir as Direction]?.some(t => t.id === chosenTech.id)
          ) as Direction || 'NONE';

          setP2ActiveDirection(finalDir);
          const finalCharge = staminaLow ? 20 + Math.random() * 30 : 60 + Math.random() * 40;
          setP2ChargeLevel(finalCharge);
          
          const payload: ActionPayload = {
            direction: finalDir,
            button: chosenTech.id,
            charge: finalDir === 'NONE' ? 100 : finalCharge,
            techId: chosenTech.id
          };
          
          setTurnState(prev => {
             const nextState = { ...prev, cpuAction: payload };
             if (nextState.p1Action && nextState.cpuAction) setPhase('RESOLVING');
             return nextState;
          });
        } else {
          setCpu(c => ({ ...c, isExhausted: true }));
          const payload: ActionPayload = { direction: 'NONE', button: '', charge: 0, techId: '' };
          setTurnState(prev => {
             const nextState = { ...prev, cpuAction: payload };
             if (nextState.p1Action && nextState.cpuAction) setPhase('RESOLVING');
             return nextState;
          });
        }
      }, baseDelay);
      return () => clearTimeout(timer);
    }
  }, [phase, cpu, p1, isPVP, turnState.cpuAction, difficulty, activeDirection]);

  // CPU Clash minigame logic
  useEffect(() => {
     if (phase === 'CLASH' && !isPVP) {
        const isHard = difficulty === 'HARD';
        const mashRate = isHard ? 100 : 250; 
        const interval = setInterval(() => {
           setCpu(c => ({ ...c, clashScore: c.clashScore + 1 }));
        }, mashRate);
        return () => clearInterval(interval);
     }
  }, [phase, isPVP, difficulty]);

  // Clash timer logic
  useEffect(() => {
     if (phase === 'CLASH') {
        setClashTimeLeft(3000);
        const interval = setInterval(() => {
           setClashTimeLeft(prev => {
              if (prev <= 100) {
                 clearInterval(interval);
                 setPhase('RESOLVING');
                 return 0;
              }
              return prev - 100;
           });
        }, 100);
        return () => clearInterval(interval);
     }
  }, [phase]);

  // Resolution Logic
  useEffect(() => {
    if (phase === 'RESOLVING') {
      const resolveTurn = async () => {
        const delay = (ms: number) => new Promise(res => setTimeout(res, ms));
        
        const { p1Action, cpuAction, clashInitiated, clashWinner } = turnState;
        if (!p1Action || !cpuAction) return;
        
        const p1Tech = getTechnique(p1.charId, p1Action.direction, p1Action.techId);
        const cpuTech = getTechnique(cpu.charId, cpuAction.direction, cpuAction.techId);
        
        if (!clashInitiated) {
           // Consume stamina
           if (p1Tech) setP1(p => ({ ...p, stamina: Math.max(0, p.stamina - p1Tech.cost) }));
           if (cpuTech) {
              const cpuCost = difficulty === 'HARD' ? Math.floor(cpuTech.cost * 0.8) : cpuTech.cost;
              setCpu(p => ({ ...p, stamina: Math.max(0, p.stamina - cpuCost) }));
           }
        }

        const playCinematicIntro = async (player: 'P1' | 'CPU', techName: string) => {
            setCinematic({ activePlayer: player, event: 'technique_intro', techniqueName: techName });
            await delay(1200);
            setCinematic(null);
            await delay(100);
        };

        const executeSupport = (player: 'P1' | 'CPU', action: ActionPayload, tech: any, currentState: Player) => {
           let hpHeal = 0;
           let stHeal = 0;
           let eff = null;
           if (tech.cost === 0) {
              stHeal = action.charge * 0.5 + 20;
              addLog(`${currentState.name} usa ${tech.name}, recuperando ${Math.floor(stHeal)} ST.`, 'heal');
              addFloatingText(`+${Math.floor(stHeal)} ST`, 'heal', player);
           } else {
              hpHeal = action.charge * 1.5 + tech.cost * 3;
              addLog(`${currentState.name} usa ${tech.name}, curando ${Math.floor(hpHeal)} PV.`, 'heal');
              addFloatingText(`+${Math.floor(hpHeal)} PV`, 'heal', player);
           }
           if (tech.effect && Math.random() < tech.effect.chance) {
               eff = tech.effect;
               addLog(`${currentState.name} obtiene ${eff.type}!`, 'status');
           }
           return { hpHeal, stHeal, eff };
        };

        let p1CurrentHp = p1.hp;
        let cpuCurrentHp = cpu.hp;
        let p1NextAirborne = p1.isAirborne;
        let cpuNextAirborne = cpu.isAirborne;
        let p1NextKnockedDown = false;
        let cpuNextKnockedDown = false;
        
        // Helper to calc attack damage
        const calcDamage = (attacker: Player, action: ActionPayload, tech: any) => {
           if (!tech) return 0;
           if (action.direction === 'NONE' || action.direction === 'UP' || action.direction === 'LEFT') return 0;
           let baseDamage = action.charge * 3 + tech.cost * 5;
           if (action.direction === 'ULTIMATE') baseDamage = 2500 + (action.charge * 10);
           else if (action.direction === 'DOWN') baseDamage *= 1.25;
           const critChance = 0.15 + (attacker.comboCount * 0.05);
           if (Math.random() < critChance) baseDamage *= 2;
           if (attacker.comboCount > 0) baseDamage *= (1 + (attacker.comboCount * 0.1));
           return Math.floor(baseDamage);
        };

        const p1Damage = calcDamage(p1, p1Action, p1Tech);
        const cpuDamage = calcDamage(cpu, cpuAction, cpuTech);
        
        const isOffensive = (dir: Direction) => dir === 'RIGHT' || dir === 'DOWN' || dir === 'ULTIMATE';
        
        if (!clashInitiated && isOffensive(p1Action.direction) && isOffensive(cpuAction.direction)) {
           const damageDiff = Math.abs(p1Damage - cpuDamage);
           const isSameType = p1Action.direction === cpuAction.direction;
           if (isSameType || damageDiff < (Math.max(p1Damage, cpuDamage) * 0.3)) {
               // Trigger Clash!
               await playCinematicIntro('P1', p1Tech!.name);
               await playCinematicIntro('CPU', cpuTech!.name);
               setTurnState(prev => ({ ...prev, clashInitiated: true }));
               setP1(p => ({ ...p, clashScore: 0 }));
               setCpu(c => ({ ...c, clashScore: 0 }));
               setPhase('CLASH');
               return; // Exit RESOLVING
           }
        }
        
        let p1ReceivedDamage = 0;
        let cpuReceivedDamage = 0;
        
        if (clashInitiated && p1Tech && cpuTech) {
           addLog(`Fin del choque. P1: ${p1.clashScore}, CPU: ${cpu.clashScore}`, 'system');
           const clashWin = p1.clashScore > cpu.clashScore ? 'P1' : (p1.clashScore < cpu.clashScore ? 'CPU' : 'DRAW');
           if (clashWin === 'P1') {
              cpuReceivedDamage = p1Damage * 1.5;
              addLog(`¡${p1.name} gana el choque de poder!`, 'attack');
              addFloatingText(`-${Math.floor(cpuReceivedDamage)}`, 'damage', 'CPU');
              setAnimState({ p1: 'attack', cpu: 'hit' });
           } else if (clashWin === 'CPU') {
              p1ReceivedDamage = cpuDamage * 1.5;
              addLog(`¡${cpu.name} gana el choque de poder!`, 'attack');
              addFloatingText(`-${Math.floor(p1ReceivedDamage)}`, 'damage', 'P1');
              setAnimState({ p1: 'hit', cpu: 'attack' });
           } else {
              addLog(`¡Empate en el choque de poder! Ambos reciben daño.`, 'system');
              p1ReceivedDamage = cpuDamage * 0.5;
              cpuReceivedDamage = p1Damage * 0.5;
              addFloatingText(`-${Math.floor(p1ReceivedDamage)}`, 'damage', 'P1');
              addFloatingText(`-${Math.floor(cpuReceivedDamage)}`, 'damage', 'CPU');
              setAnimState({ p1: 'hit', cpu: 'hit' });
           }
           await delay(1500);
        } else {
           // Normal resolution: Support/Defense/Jump first
           const evaluateDefenses = async (player: 'P1'|'CPU', pAction: ActionPayload, pTech: any, oppAction: ActionPayload, oppTech: any, currentState: Player) => {
               if (pAction.direction === 'LEFT') {
                  const res = executeSupport(player, pAction, pTech, currentState);
                  if (player === 'P1') {
                     p1CurrentHp = Math.min(p1.maxHp, p1CurrentHp + res.hpHeal);
                     if (res.stHeal > 0) setP1(p => ({ ...p, stamina: Math.min(p.maxStamina, p.stamina + res.stHeal) }));
                     if (res.eff) setP1(p => ({ ...p, effects: [...p.effects, { id: Math.random().toString(), ...res.eff }]}));
                  } else {
                     cpuCurrentHp = Math.min(cpu.maxHp, cpuCurrentHp + res.hpHeal);
                     if (res.stHeal > 0) setCpu(c => ({ ...c, stamina: Math.min(c.maxStamina, c.stamina + res.stHeal) }));
                     if (res.eff) setCpu(c => ({ ...c, effects: [...c.effects, { id: Math.random().toString(), ...res.eff }]}));
                  }
                  await playCinematicIntro(player, pTech.name);
               } else if (pAction.direction === 'UP') {
                  await playCinematicIntro(player, pTech.name);
                  if (player === 'P1') p1NextAirborne = true;
                  else cpuNextAirborne = true;
               } else if (pAction.direction === 'NONE' && pTech) {
                  await playCinematicIntro(player, pTech.name);
                  if (pTech.effect && Math.random() < pTech.effect.chance) {
                      if (player === 'P1') setP1(p => ({ ...p, effects: [...p.effects, { id: Math.random().toString(), ...pTech.effect }]}));
                      else setCpu(c => ({ ...c, effects: [...c.effects, { id: Math.random().toString(), ...pTech.effect }]}));
                  }
               }
           };

           if (p1Tech && !isOffensive(p1Action.direction)) await evaluateDefenses('P1', p1Action, p1Tech, cpuAction, cpuTech, p1);
           if (cpuTech && !isOffensive(cpuAction.direction)) await evaluateDefenses('CPU', cpuAction, cpuTech, p1Action, p1Tech, cpu);

           // Then apply attacks
           const applyAttack = async (attacker: 'P1'|'CPU', aAction: ActionPayload, aTech: any, dAction: ActionPayload, dTech: any, aDamage: number) => {
               if (!aTech || !isOffensive(aAction.direction)) return;
               await playCinematicIntro(attacker, aTech.name);
               
               const defender = attacker === 'P1' ? cpu : p1;
               const defenderAirborne = attacker === 'P1' ? cpu.isAirborne || cpuNextAirborne : p1.isAirborne || p1NextAirborne;
               let finalDamage = aDamage;
               
               if (defenderAirborne) {
                   if (aAction.direction === 'RIGHT') {
                      addLog(`¡El ataque pasa por debajo de ${defender.name}! (ESQUIVADO)`, 'dodge');
                      addFloatingText('ESQUIVA', 'dodge', attacker === 'P1' ? 'CPU' : 'P1');
                      if (attacker === 'P1') setAnimState({ p1: 'attack', cpu: 'dodge' });
                      else setAnimState({ p1: 'dodge', cpu: 'attack' });
                      await delay(1000);
                      return; // 0 damage
                   } else if (aAction.direction === 'DOWN' || aAction.direction === 'ULTIMATE') {
                      addLog(`¡${defender.name} es derribado del aire!`, 'attack');
                      if (attacker === 'P1') { cpuNextKnockedDown = true; cpuNextAirborne = false; }
                      else { p1NextKnockedDown = true; p1NextAirborne = false; }
                   }
               } else if (dAction.direction === 'UP') {
                   // Roll evasion
                   const evadeChance = Math.random();
                   if (evadeChance > 0.6) {
                      addLog(`¡${defender.name} esquiva perfectamente el ataque!`, 'dodge');
                      addFloatingText('ESQUIVA', 'dodge', attacker === 'P1' ? 'CPU' : 'P1');
                      if (attacker === 'P1') setAnimState({ p1: 'attack', cpu: 'dodge' });
                      else setAnimState({ p1: 'dodge', cpu: 'attack' });
                      await delay(1000);
                      return;
                   } else if (evadeChance > 0.3) {
                      addLog(`¡${defender.name} apenas logra saltar, recibiendo daño!`, 'system');
                      finalDamage = Math.floor(finalDamage * 0.5);
                   } else {
                      addLog(`¡${defender.name} no logra saltar a tiempo y es golpeado!`, 'attack');
                      if (attacker === 'P1') { cpuNextKnockedDown = true; cpuNextAirborne = false; }
                      else { p1NextKnockedDown = true; p1NextAirborne = false; }
                   }
               } else if (dAction.direction === 'NONE') {
                   const blockVal = dAction.charge > 50 ? 0.5 : 0.8;
                   finalDamage = Math.floor(finalDamage * blockVal);
                   addLog(`¡${defender.name} bloquea parcialmente el ataque!`, 'block');
                   addFloatingText('BLOQUEO', 'block', attacker === 'P1' ? 'CPU' : 'P1');
               }

               if (attacker === 'P1') cpuReceivedDamage += finalDamage;
               else p1ReceivedDamage += finalDamage;

               if (attacker === 'P1') setAnimState({ p1: 'attack', cpu: 'hit' });
               else setAnimState({ p1: 'hit', cpu: 'attack' });
               
               if (finalDamage > 0) addFloatingText(`-${finalDamage}`, 'damage', attacker === 'P1' ? 'CPU' : 'P1');
               await delay(1000);
           };

           if (isOffensive(p1Action.direction)) await applyAttack('P1', p1Action, p1Tech, cpuAction, cpuTech, p1Damage);
           if (isOffensive(cpuAction.direction)) await applyAttack('CPU', cpuAction, cpuTech, p1Action, p1Tech, cpuDamage);
        }
        
        // Reset airborne if they didn't jump this turn
        if (!clashInitiated && p1Action.direction !== 'UP' && p1.isAirborne && !p1NextKnockedDown) p1NextAirborne = false;
        if (!clashInitiated && cpuAction.direction !== 'UP' && cpu.isAirborne && !cpuNextKnockedDown) cpuNextAirborne = false;

        const processEffects = (p: Player, isCpu: boolean) => {
           let hpDelta = 0;
           const newEffects = p.effects.map(eff => {
              if (eff.type === 'POISON') {
                 hpDelta -= eff.value || 100;
                 addLog(`${p.name} sufre daño por VENENO.`, 'status');
                 addFloatingText(`-${eff.value || 100} VENENO`, 'damage', isCpu ? 'CPU' : 'P1');
              } else if (eff.type === 'REGEN') {
                 hpDelta += eff.value || 100;
                 addLog(`${p.name} recupera salud por REGENERACIÓN.`, 'status');
                 addFloatingText(`+${eff.value || 100} REGEN`, 'heal', isCpu ? 'CPU' : 'P1');
              }
              return { ...eff, duration: eff.duration - 1 };
           }).filter(eff => eff.duration > 0);
           return { newEffects, hpDelta };
        };

        const p1EffectsRes = processEffects(p1, false);
        const cpuEffectsRes = processEffects(cpu, true);

        setAnimState({ p1: 'idle', cpu: 'idle' });
        
        setP1(p => {
           let updatedHp = Math.min(p.maxHp, Math.max(0, p1CurrentHp - p1ReceivedDamage + p1EffectsRes.hpDelta));
           setCpu(c => {
              let updatedCpuHp = Math.min(c.maxHp, Math.max(0, cpuCurrentHp - cpuReceivedDamage + cpuEffectsRes.hpDelta));
              if (updatedHp <= 0 || updatedCpuHp <= 0 || (matchTimer === 0 && matchTimer !== 999)) {
                 setPhase('GAME_OVER');
              } else {
                 setTurnState({ p1Action: null, cpuAction: null });
                 setPhase('NEUTRAL');
              }
              return { ...c, hp: updatedCpuHp, effects: cpuEffectsRes.newEffects, isAirborne: cpuNextAirborne, isKnockedDown: cpuNextKnockedDown, limit: Math.min(100, c.limit + (cpuReceivedDamage / c.maxHp) * 200) };
           });
           return { ...p, hp: updatedHp, effects: p1EffectsRes.newEffects, isAirborne: p1NextAirborne, isKnockedDown: p1NextKnockedDown, limit: Math.min(100, p.limit + (p1ReceivedDamage / p.maxHp) * 200) };
        });
      };
      
      resolveTurn();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  const resetGame = () => {
    setP1(createPlayerState('P1', p1CharId));
    setCpu(createPlayerState(isPVP ? 'P2' : 'CPU', p2CharId));
    setTurnState({ p1Action: null, cpuAction: null });
    setActiveDirection('NONE');
    setChargeLevel(0);
    setP2ActiveDirection('NONE');
    setP2ChargeLevel(0);
    setPhase('INIT');
    setCombatLog([]);
    setAnimState({ p1: 'idle', cpu: 'idle' });
    setCinematic(null);
    setMatchTimer(timer);
  };

  const getP1State = () => p1;
  const getP2State = () => cpu;
  const getGamePhase = () => phase;
  const getTurnState = () => turnState;

  return {
    p1: getP1State(),
    cpu: getP2State(),
    phase: getGamePhase(),
    turnState: getTurnState(),
    startCharge,
    cancelCharge,
    executeAction,
    p2StartCharge,
    p2CancelCharge,
    p2ExecuteAction,
    activeDirection,
    chargeLevel,
    p2ActiveDirection,
    p2ChargeLevel,
    combatLog,
    animState,
    cinematic,
    floatingTexts,
    countdown,
    matchTimer,
    dialogueStep,
    activeDialogues,
    resetGame,
    clashTimeLeft,
    reactionTimeLeft
  };
}
