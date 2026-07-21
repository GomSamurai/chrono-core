import { useState, useEffect, useRef } from 'react';
import { Player, PlayerType, GamePhase, Direction, ActionButton, ActionPayload, TurnState, CombatLogEntry, CinematicState, FloatingText } from '../types';
import { getTechnique, CHAR_TECHNIQUES_DB } from '../data/techniques';
import { CHARACTERS } from '../data/characters';
import { audio } from '../utils/audio';

const SFX_HITS = ['hit_1', 'hit_2', 'hit_3', 'hit_4'];
const SFX_HEAVY_HITS = ['especial_hit_1', 'especial_hit_2', 'blood_attack_1', 'blood_attack_2'];
const SFX_BLOCKS = ['hit_metal_1', 'magic_shield_1', 'magic_shield_2', 'magic_shield_3'];
const SFX_DODGES = ['esquivar_1', 'esquivar_2', 'almost_hit_1'];
const SFX_HEALS = ['heal_1', 'magic_heal_1', 'magic_heal_2', 'all_restaured_1', 'restauration_magic'];
const SFX_MAGICS = ['recharging_1', 'female_recharging_magic_1', 'laser_magic_1', 'dark_magic_1', 'power_up'];
const SFX_VOICE_ATTACK = ['attack_male_1', 'fight_voice_1'];

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
  difficulty = 'NORMAL'
}: { 
  mode?: string, 
  isPVP?: boolean,
  p1CharId?: string,
  p2CharId?: string,
  difficulty?: 'EASY' | 'NORMAL' | 'HARD'
} = {}) {
  const [p1, setP1] = useState<Player>(() => createPlayerState('P1', p1CharId));
  const [cpu, setCpu] = useState<Player>(() => {
    let chosenId = p2CharId;
    if (mode === 'survival') chosenId = CHARACTERS[1].id;
    if (mode === 'arcade') chosenId = CHARACTERS[3].id;
    return createPlayerState(isPVP ? 'P2' : 'CPU', chosenId);
  });
  const [phase, setPhase] = useState<GamePhase>('INIT');
  
  const [activeDirection, setActiveDirection] = useState<Direction>('NONE');
  const [chargeLevel, setChargeLevel] = useState(0); 
  const chargeIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const [p2ActiveDirection, setP2ActiveDirection] = useState<Direction>('NONE');
  const [p2ChargeLevel, setP2ChargeLevel] = useState(0); 
  const p2ChargeIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const [turnState, setTurnState] = useState<TurnState>({ p1Action: null, cpuAction: null });
  const [reactionTimeLeft, setReactionTimeLeft] = useState(100);
  const reactionTimerRef = useRef<NodeJS.Timeout | null>(null);

  const [combatLog, setCombatLog] = useState<CombatLogEntry[]>([]);
  const [animState, setAnimState] = useState<{p1: string, cpu: string}>({ p1: 'idle', cpu: 'idle' });
  const [cinematic, setCinematic] = useState<CinematicState | null>(null);
  const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([]);

  const addFloatingText = (text: string, type: FloatingText['type'], player: 'P1' | 'CPU') => {
    const newText: FloatingText = {
      id: Math.random().toString(36).substr(2, 9),
      text,
      type,
      player,
      xOffset: (Math.random() - 0.5) * 50,
      yOffset: (Math.random() - 0.5) * 50
    };
    setFloatingTexts(prev => [...prev, newText]);
    setTimeout(() => {
      setFloatingTexts(prev => prev.filter(ft => ft.id !== newText.id));
    }, 1500);
  };
  
  const [countdown, setCountdown] = useState<number | null>(3);
  const [dialogueStep, setDialogueStep] = useState<number>(0);
  const [activeDialogues, setActiveDialogues] = useState<{p1: string, p2: string}>({p1: '...', p2: '...'});
  
  const addLog = (msg: string, type: CombatLogEntry['type'] = 'info') => {
    setCombatLog(prev => [...prev, { text: msg, type }].slice(-10)); 
  };

  useEffect(() => {
    if (phase === 'INIT') {
      const p1Data = CHARACTERS.find(c => c.id === p1.charId);
      const p2Data = CHARACTERS.find(c => c.id === cpu.charId);
      const p1Lines = p1Data?.dialogues?.intro || ['...'];
      const p2Lines = p2Data?.dialogues?.intro || ['...'];
      
      setActiveDialogues({
        p1: p1Lines[Math.floor(Math.random() * p1Lines.length)],
        p2: p2Lines[Math.floor(Math.random() * p2Lines.length)]
      });

      setDialogueStep(0);
      setPhase('DIALOGUE');
    } else if (phase === 'GAME_OVER') {
      const p1Data = CHARACTERS.find(c => c.id === p1.charId);
      const p2Data = CHARACTERS.find(c => c.id === cpu.charId);
      
      const p1Won = p1.hp > 0 && cpu.hp <= 0;
      const p2Won = cpu.hp > 0 && p1.hp <= 0;
      
      const p1Lines = p1Won ? (p1Data?.dialogues?.win || ['...']) : (p1Data?.dialogues?.defeat || ['...']);
      const p2Lines = p2Won ? (p2Data?.dialogues?.win || ['...']) : (p2Data?.dialogues?.defeat || ['...']);
      
      setActiveDialogues({
        p1: p1Lines[Math.floor(Math.random() * p1Lines.length)],
        p2: p2Lines[Math.floor(Math.random() * p2Lines.length)]
      });
    }
  }, [phase, p1.charId, cpu.charId, p1.hp, cpu.hp]);

  useEffect(() => {
    if (phase === 'DIALOGUE') {
       if (dialogueStep === 0) {
          // show P1 dialogue
          const timer = setTimeout(() => setDialogueStep(1), 3000);
          return () => clearTimeout(timer);
       } else if (dialogueStep === 1) {
          // show CPU dialogue
          const timer = setTimeout(() => setDialogueStep(2), 3000);
          return () => clearTimeout(timer);
       } else if (dialogueStep === 2) {
          addLog(`¡El combate entre ${p1.name} y ${cpu.name} comienza!`, 'system');
          let count = 3;
          setCountdown(count);
          
          const timer = setInterval(() => {
            count--;
            if (count > 0) {
              setCountdown(count);
            } else if (count === 0) {
              setCountdown(0);
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

  const createStartCharge = (playerId: 'P1'|'P2') => (dir: Direction) => {
    if (playerId === 'P1') {
      if (phase !== 'NEUTRAL' && phase !== 'P1_REACTION') return;
      if (activeDirection === dir) return;
      setActiveDirection(dir);
      setChargeLevel(0);
      if (chargeIntervalRef.current) clearInterval(chargeIntervalRef.current);
      chargeIntervalRef.current = setInterval(() => {
        setChargeLevel(prev => Math.min(100, prev + 5));
      }, 50);
    } else {
      if (phase !== 'NEUTRAL' && phase !== 'P2_REACTION') return;
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
    const currentPhase = phase;
    const allowedPhase1 = 'NEUTRAL';
    const allowedPhase2 = isP1 ? 'P1_REACTION' : 'P2_REACTION';

    if (currentPhase !== allowedPhase1 && currentPhase !== allowedPhase2) return;
    
    if (playerState.isExhausted) {
       addFloatingText('FATIGA', 'exhausted', isP1 ? 'P1' : 'CPU');
       addLog(`${playerState.name} está exhausto y pierde su turno.`, 'system');
       
       if (isP1) {
          setP1(p => ({ ...p, isExhausted: false, comboCount: 0, stamina: Math.min(p.maxStamina, p.stamina + 20) }));
          cancelCharge();
       } else {
          setCpu(c => ({ ...c, isExhausted: false, comboCount: 0, stamina: Math.min(c.maxStamina, c.stamina + 20) }));
          p2CancelCharge();
       }

       // Skip turn logic
       const payload: ActionPayload = { direction: 'NONE', button: '', charge: 0, techId: '' };
       if (currentPhase === 'NEUTRAL') {
          setTurnState(prev => isP1 ? { ...prev, p1Action: payload } : { ...prev, cpuAction: payload });
          setPhase(isP1 ? (isPVP ? 'P2_REACTION' : 'CPU_REACTION') : 'P1_REACTION');
       } else if (currentPhase === allowedPhase2) {
          setTurnState(prev => isP1 ? { ...prev, p1Action: payload } : { ...prev, cpuAction: payload });
          if (reactionTimerRef.current) clearInterval(reactionTimerRef.current);
          setPhase('RESOLVING');
       }
       return;
    }

    let dir = isP1 ? activeDirection : p2ActiveDirection;
    let charge = isP1 ? chargeLevel : p2ChargeLevel;

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

    // Set exhaustion if stamina drops to 0 after this move
    if (playerState.stamina - tech.cost <= 0) {
       if (isP1) setP1(p => ({ ...p, isExhausted: true }));
       else setCpu(c => ({ ...c, isExhausted: true }));
    }

    const payload: ActionPayload = {
      direction: dir,
      button: button,
      charge: dir === 'NONE' ? 100 : charge,
      techId: tech.id
    };

    if (isP1) cancelCharge();
    else p2CancelCharge();

    if (currentPhase === 'NEUTRAL') {
      setTurnState(prev => isP1 ? { ...prev, p1Action: payload } : { ...prev, cpuAction: payload });
      setPhase(isP1 ? (isPVP ? 'P2_REACTION' : 'CPU_REACTION') : 'P1_REACTION');
      addLog(`${playerState.name} ejecuta ${tech.name} (Poder: ${Math.floor(payload.charge)}%).`, 'info');
    } else if (currentPhase === allowedPhase2) {
      setTurnState(prev => isP1 ? { ...prev, p1Action: payload } : { ...prev, cpuAction: payload });
      addLog(`${playerState.name} reacciona con ${tech.name} (Poder: ${Math.floor(payload.charge)}%).`, 'info');
      if (reactionTimerRef.current) clearInterval(reactionTimerRef.current);
      setPhase('RESOLVING');
    }
  };

  const executeAction = createExecuteAction('P1');
  const p2ExecuteAction = createExecuteAction('P2');

  // CPU Action
  useEffect(() => {
    if (!isPVP && phase === 'NEUTRAL' && !cpu.isKnockedDown) {
      const isHard = difficulty === 'HARD';
      const isEasy = difficulty === 'EASY';
      const baseDelay = isEasy ? 2000 + Math.random() * 2000 : 
                        isHard ? 500 + Math.random() * 1000 :
                        1000 + Math.random() * 2000;
      
      const timer = setTimeout(() => {
        const staminaLow = cpu.stamina < cpu.maxStamina * 0.3;
        const p1HpLow = p1.hp < p1.maxHp * 0.3;

        let chosenDir: Direction = 'NONE';

        if (isHard && turnState.p1Action && turnState.p1Action.charge > 75) {
            // Si el jugador está lanzando un ataque fuerte, intenta esquivar o bloquear
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
           allDirs.forEach(d => {
             const ts = CHAR_TECHNIQUES_DB[cpu.charId][d] || [];
             affordableTechs = affordableTechs.concat(ts.filter(t => t.cost <= cpu.stamina));
           });
        }
        
        if (affordableTechs.length > 0) {
          let chosenTech = affordableTechs[Math.floor(Math.random() * affordableTechs.length)];
          if (p1HpLow) {
             chosenTech = affordableTechs.reduce((prev, curr) => (prev.cost > curr.cost) ? prev : curr);
          } else if (staminaLow) {
             chosenTech = affordableTechs.reduce((prev, curr) => (prev.cost < curr.cost) ? prev : curr);
          }

          const finalDir = Object.keys(CHAR_TECHNIQUES_DB[cpu.charId]).find(dir => 
            CHAR_TECHNIQUES_DB[cpu.charId][dir as Direction]?.some(t => t.id === chosenTech.id)
          ) as Direction || 'NONE';

          const charge = staminaLow ? 20 + Math.random() * 30 : 60 + Math.random() * 40;

          const payload: ActionPayload = {
            direction: finalDir,
            button: chosenTech.id,
            charge,
            techId: chosenTech.id
          };
          
          addLog(`${cpu.name} toma la iniciativa con ${chosenTech.name}!`, 'attack');
          setTurnState({ p1Action: null, cpuAction: payload });
          setPhase('P1_REACTION');
        } else {
          setCpu(c => ({ ...c, isExhausted: true }));
          const payload: ActionPayload = { direction: 'NONE', button: '', charge: 0, techId: '' };
          setTurnState({ p1Action: null, cpuAction: payload });
          setPhase('P1_REACTION');
        }
      }, baseDelay);
      return () => clearTimeout(timer);
    }
  }, [phase, cpu, p1, isPVP]);

  // CPU Reaction
  useEffect(() => {
    if (!isPVP && phase === 'CPU_REACTION' && !cpu.isKnockedDown) {
      const isHard = difficulty === 'HARD';
      const isEasy = difficulty === 'EASY';
      const reactionDelay = isEasy ? 1500 + Math.random() * 1000 :
                            isHard ? 300 + Math.random() * 500 :
                            1000 + Math.random() * 800;

      const timer = setTimeout(() => {
        const p1Attack = turnState.p1Action;
        const p1Tech = p1Attack ? getTechnique(p1.charId, p1Attack.direction, p1Attack.techId) : null;
        
        const attackPower = p1Attack && p1Tech ? p1Attack.charge + p1Tech.cost : 0;
        const staminaPercent = cpu.stamina / cpu.maxStamina;
        
        const baseReactChance = isEasy ? 0.3 : (isHard ? 0.95 : (staminaPercent < 0.2 ? 0.4 : 0.85));
        const reactChance = Math.random();

        if (reactChance <= baseReactChance && p1Attack) {
           let chosenDir: Direction = 'NONE';
           
           if (isHard) {
               if (attackPower > 40) {
                  if (p1Attack.direction === 'DOWN') {
                     chosenDir = 'NONE'; // Block magic
                  } else if (p1Attack.direction === 'RIGHT' || p1Attack.direction === 'NONE') {
                     chosenDir = 'UP'; // Jump physical
                  }
               } else if (staminaPercent < 0.4) {
                   chosenDir = 'LEFT';
               } else {
                   chosenDir = Math.random() > 0.5 ? 'DOWN' : 'NONE';
               }
           } else {
               if (attackPower > 70) {
                  chosenDir = Math.random() > 0.4 ? 'DOWN' : 'UP';
               } else if (attackPower > 30) {
                  chosenDir = Math.random() > 0.5 ? 'LEFT' : 'UP';
               } else {
                  chosenDir = Math.random() > 0.7 ? 'NONE' : 'DOWN';
               }
           }

           if (isEasy && Math.random() > 0.5) {
               const dirs: Direction[] = ['UP', 'DOWN', 'LEFT', 'RIGHT', 'NONE'];
               chosenDir = dirs[Math.floor(Math.random() * dirs.length)];
           }

           const techList = CHAR_TECHNIQUES_DB[cpu.charId][chosenDir] || [];
           const affordableTechs = techList.filter(t => t.cost <= cpu.stamina);
           
           if (affordableTechs.length > 0) {
              let tech = affordableTechs[Math.floor(Math.random() * affordableTechs.length)];
              
              if (attackPower > 70 && chosenDir === 'DOWN') {
                 tech = affordableTechs.reduce((prev, curr) => (prev.cost > curr.cost) ? prev : curr);
              }

              const charge = Math.min(100, Math.max(20, attackPower * 0.8 + Math.random() * 30));

              const payload: ActionPayload = {
                direction: chosenDir,
                button: tech.id,
                charge,
                techId: tech.id
              };
              setTurnState(prev => ({ ...prev, cpuAction: payload }));
              addLog(`${cpu.name} evalúa el ataque y responde con ${tech.name}.`, 'info');
           } else {
             setCpu(c => ({ ...c, isExhausted: true }));
             addLog(`${cpu.name} quiso defenderse pero está exhausto...`, 'system');
           }
        } else {
            addLog(`${cpu.name} no logra reaccionar a tiempo.`, 'system');
         }
         setPhase('RESOLVING');
      }, reactionDelay);
      return () => clearTimeout(timer);
    } else if (!isPVP && phase === 'CPU_REACTION' && cpu.isKnockedDown) {
      setPhase('RESOLVING'); 
    }
  }, [phase, cpu, turnState.p1Action, isPVP]);

  // Reaction Timer
  useEffect(() => {
    if (phase === 'P1_REACTION' || phase === 'P2_REACTION') {
      setReactionTimeLeft(100);
      const timer = setInterval(() => {
        setReactionTimeLeft(prev => {
          if (prev <= 0) {
            clearInterval(timer);
            setPhase('RESOLVING');
            return 0;
          }
          return prev - 2;
        });
      }, 50);
      reactionTimerRef.current = timer;
      return () => clearInterval(timer);
    }
  }, [phase]);

  // Resolve Phase
  useEffect(() => {
    if (phase === 'RESOLVING') {
      const resolveTurn = async () => {
        const delay = (ms: number) => new Promise(res => setTimeout(res, ms));
        await delay(500);
        
        const { p1Action, cpuAction } = turnState;
        const p1Tech = p1Action ? getTechnique(p1.charId, p1Action.direction, p1Action.techId) : null;
        const cpuTech = cpuAction ? getTechnique(cpu.charId, cpuAction.direction, cpuAction.techId) : null;

        if (p1Tech) setP1(p => ({ ...p, stamina: Math.max(0, p.stamina - p1Tech.cost) }));
        if (cpuTech) {
           const cpuCost = difficulty === 'HARD' ? Math.floor(cpuTech.cost * 0.8) : cpuTech.cost;
           setCpu(p => ({ ...p, stamina: Math.max(0, p.stamina - cpuCost) }));
        }

        const p1Power = (p1Action?.charge || 0) + (p1Tech?.cost || 0);
        const cpuPower = (cpuAction?.charge || 0) + (cpuTech?.cost || 0);

        let first: 'P1' | 'CPU' = p1Power >= cpuPower ? 'P1' : 'CPU';
        let second: 'P1' | 'CPU' = p1Power >= cpuPower ? 'CPU' : 'P1';

        if (!p1Action) { first = 'CPU'; second = 'P1'; }
        if (!cpuAction) { first = 'P1'; second = 'CPU'; }

        if (p1Action && cpuAction) {
           addLog(`Choque de poder: ${p1.name} (${Math.floor(p1Power)}) vs ${cpu.name} (${Math.floor(cpuPower)})`, 'system');
        }

        let currentP1Hp = p1.hp;
        let currentCpuHp = cpu.hp;

        const playCinematicIntro = async (player: 'P1' | 'CPU', techName: string) => {
            setCinematic({ activePlayer: player, event: 'technique_intro', techniqueName: techName });
            await delay(1800);
            setCinematic(null);
            await delay(200);
        };

        const playCinematicResult = async (player: 'P1' | 'CPU', event: CinematicState['event'], techName: string, damage?: number) => {
            setCinematic({ activePlayer: player, event, techniqueName: techName, damage });
            await delay(1500);
            setCinematic(null);
            await delay(200);
        };

        const executeSupport = async (player: 'P1' | 'CPU', action: ActionPayload, tech: any) => {
           audio.playSFX(getRandomSFX(SFX_HEALS));
           setAnimState(prev => ({ ...prev, [player.toLowerCase()]: 'heal' }));
           if (tech.cost === 0) {
              const staminaHeal = action.charge * 0.5 + 20;
              addLog(`${player === 'P1' ? p1.name : cpu.name} usa ${tech.name}, recuperando ${Math.floor(staminaHeal)} ST.`, 'heal');
              addFloatingText(`+${Math.floor(staminaHeal)} ST`, 'heal', player);
              if (player === 'P1') setP1(p => ({ ...p, stamina: Math.min(p.maxStamina, p.stamina + staminaHeal) }));
              else setCpu(c => ({ ...c, stamina: Math.min(c.maxStamina, c.stamina + staminaHeal) }));
           } else {
              const hpHeal = action.charge * 1.5 + tech.cost * 3;
              addLog(`${player === 'P1' ? p1.name : cpu.name} usa ${tech.name}, curando ${Math.floor(hpHeal)} PV.`, 'heal');
              addFloatingText(`+${Math.floor(hpHeal)} PV`, 'heal', player);
              if (player === 'P1') {
                 currentP1Hp = Math.min(p1.maxHp, currentP1Hp + hpHeal);
                 setP1(p => ({ ...p, hp: currentP1Hp }));
              } else {
                 currentCpuHp = Math.min(cpu.maxHp, currentCpuHp + hpHeal);
                 setCpu(c => ({ ...c, hp: currentCpuHp }));
              }
           }
           if (tech.effect && Math.random() < tech.effect.chance) {
               const eff = tech.effect;
               if (player === 'P1') setP1(p => ({ ...p, effects: [...p.effects, { id: Math.random().toString(36).substr(2,9), ...eff }] }));
               else setCpu(c => ({ ...c, effects: [...c.effects, { id: Math.random().toString(36).substr(2,9), ...eff }] }));
               addLog(`${player === 'P1' ? p1.name : cpu.name} obtiene ${eff.type}!`, 'status');
           }
           await playCinematicResult(player, 'heal', tech.name);
        };

        const executeHit = async (attacker: 'P1' | 'CPU', defender: 'P1' | 'CPU', attackerAction: ActionPayload, attackerTech: any, defenderAction: ActionPayload | null, defenderTech: any | null) => {
           setAnimState(prev => ({ ...prev, [attacker.toLowerCase()]: 'attack' }));
           
           const attackerState = attacker === 'P1' ? p1 : cpu;
           const defenderState = defender === 'P1' ? p1 : cpu;

           // Deduct Stamina
           if (attacker === 'P1') {
              setP1(p => ({ ...p, stamina: Math.max(0, p.stamina - attackerTech.cost) }));
           } else {
              setCpu(c => ({ ...c, stamina: Math.max(0, c.stamina - attackerTech.cost) }));
           }

           let baseDamage = attackerAction.charge * 3 + attackerTech.cost * 5;
           let msg = `${attackerState.name} ataca con ${attackerTech.name}!`;

           let isUltimate = attackerAction.direction === 'ULTIMATE';
           
           if (isUltimate) {
              baseDamage = 2500 + (attackerAction.charge * 10);
              msg = `${attackerState.name} desata su TÉCNICA DEFINITIVA: ${attackerTech.name}!!`;
              if (attacker === 'P1') setP1(p => ({ ...p, limit: 0 }));
              else setCpu(c => ({ ...c, limit: 0 }));
              audio.playSFX('final_attack_1');
              audio.playSFX('power_up');
           } else if (attackerAction.direction === 'DOWN') {
              baseDamage *= 1.25; 
              msg = `${attackerState.name} desata magia devastadora: ${attackerTech.name}!`;
           }

           // Critical Hit Logic
           const critChance = 0.15 + (attackerState.comboCount * 0.05);
           const isCrit = Math.random() < critChance;
           if (isCrit) {
              baseDamage *= 2;
              msg = `¡GOLPE CRÍTICO! ` + msg;
              addFloatingText('CRÍTICO', 'crit', defender);
              audio.playSFX('especial_hit_1');
           }

           // Combo Multiplier Logic
           if (attackerState.comboCount > 0) {
              baseDamage *= (1 + (attackerState.comboCount * 0.1));
           }

           let damage = baseDamage;
           let eventOutcome: CinematicState['event'] = isUltimate ? 'ultimate_intro' : 'hit';
           let activeCinematicPlayer = attacker;
           let attackLanded = true;

           if (defenderAction && defenderTech && !isUltimate) {
              // Defender stamina deduct
              if (defender === 'P1') {
                 setP1(p => ({ ...p, stamina: Math.max(0, p.stamina - defenderTech.cost) }));
              } else {
                 setCpu(c => ({ ...c, stamina: Math.max(0, c.stamina - defenderTech.cost) }));
              }

              if (defenderAction.direction === 'UP') {
                 if (attackerAction.direction === 'RIGHT' || attackerAction.direction === 'NONE') {
                    damage = 0;
                    attackLanded = false;
                    msg += ` ¡Pero ${defenderState.name} saltó evadiendo el daño!`;
                    addFloatingText('ESQUIVADO', 'dodge', defender);
                    audio.playSFX(getRandomSFX(SFX_DODGES));
                    setAnimState(prev => ({ ...prev, [defender.toLowerCase()]: 'dodge' }));
                    eventOutcome = 'dodge';
                    activeCinematicPlayer = defender;
                 } else if (attackerAction.direction === 'DOWN') {
                    msg += ` ¡Y alcanza a ${defenderState.name} en el aire!`;
                 }
              } else if (defenderAction.direction === 'NONE') {
                 // Bloqueo
                 const blockValue = defenderAction.charge * 2.5 + defenderTech.cost * 3;
                 if (attackerAction.direction === 'DOWN') {
                    const mitigationRatio = 0.3 + (defenderAction.charge / 100) * 0.5;
                    damage = Math.max(0, damage - (blockValue * mitigationRatio));
                    msg += ` El bloqueo de ${defenderState.name} mitiga la magia.`;
                 } else {
                    damage = Math.max(0, damage - blockValue);
                    if (damage === 0) attackLanded = false; // Blocked entirely
                    msg += ` ${defenderState.name} bloquea el golpe con guardia básica.`;
                 }
                 addFloatingText('BLOQUEO', 'block', defender);
                 audio.playSFX(getRandomSFX(SFX_BLOCKS));
                 setAnimState(prev => ({ ...prev, [defender.toLowerCase()]: 'block' }));
                 eventOutcome = 'block';
                 activeCinematicPlayer = defender;
              }
           } else if (isUltimate && defenderAction) {
               msg += ` ¡Es inbloqueable!`;
           }

            if (attackLanded && damage > 0) {
               if (attacker === 'P1') {
                 setP1(p => ({ ...p, comboCount: p.comboCount + 1, limit: Math.min(100, p.limit + 15) }));
               } else {
                 setCpu(c => ({ ...c, comboCount: c.comboCount + 1, limit: Math.min(100, c.limit + 15) }));
               }
               
               if (attackerState.comboCount >= 1) {
                 addFloatingText(`Combo x${attackerState.comboCount + 1}`, 'combo', attacker);
               }
               
               if (attackerTech.effect && Math.random() < attackerTech.effect.chance) {
                   const eff = attackerTech.effect;
                   if (defender === 'P1') setP1(p => ({ ...p, effects: [...p.effects, { id: Math.random().toString(36).substr(2,9), ...eff }] }));
                   else setCpu(c => ({ ...c, effects: [...c.effects, { id: Math.random().toString(36).substr(2,9), ...eff }] }));
                   addLog(`${attackerState.name} aplicó ${eff.type} a ${defenderState.name}!`, 'status');
               }
            } else {
               if (attacker === 'P1') setP1(p => ({ ...p, comboCount: 0 }));
               else setCpu(c => ({ ...c, comboCount: 0 }));
            }

           addLog(msg, damage > 0 ? 'attack' : 'dodge');
           if (damage > 0) {
              const defenderChar = defender === 'P1' ? p1 : cpu;
              audio.playSFX(damage > 500 ? getRandomSFX(SFX_HEAVY_HITS) : getRandomSFX(SFX_HITS));
              if (damage > 800) {
                  audio.playSFX('final_attack_1');
                  audio.playSFX('background_destruction_1');
              }
              const defenderGender = CHARACTERS[defenderChar.charId]?.gender || 'M';
              if (Math.random() > 0.5) {
                 audio.playSFX(defenderGender === 'F' ? 'hurt_female_1' : 'hurt_male_1');
              }
              if (damage > 1500) {
                 audio.playSFX(defenderGender === 'F' ? 'dead_female_1' : 'dead_inminent');
              }

              addLog(`¡Impacto! ${Math.floor(damage)} de daño.`, 'damage');
              addFloatingText(`-${Math.floor(damage)}`, 'damage', defender);
              setAnimState(prev => ({ ...prev, [defender.toLowerCase()]: 'hit' }));
              if (defender === 'P1') {
                 currentP1Hp = Math.max(0, currentP1Hp - damage);
                 setP1(p => ({ ...p, hp: currentP1Hp, limit: Math.min(100, p.limit + (damage / p.maxHp) * 200) }));
              } else {
                 currentCpuHp = Math.max(0, currentCpuHp - damage);
                 setCpu(c => ({ ...c, hp: currentCpuHp, limit: Math.min(100, c.limit + (damage / c.maxHp) * 200) }));
              }
           }
           
           await playCinematicResult(activeCinematicPlayer, eventOutcome, attackerTech.name, Math.floor(damage));
        };

        const executeTurn = async (player: 'P1' | 'CPU', action: ActionPayload, tech: any, otherAction: ActionPayload | null, otherTech: any) => {
            if (action.direction === 'LEFT') {
               audio.playSFX(getRandomSFX(SFX_MAGICS));
               await playCinematicIntro(player, tech.name);
               await executeSupport(player, action, tech);
            } else if (action.direction !== 'NONE' && action.direction !== 'UP' && action.direction !== 'ULTIMATE') {
               audio.playSFX(getRandomSFX(SFX_MAGICS));
               const attackerGender = CHARACTERS[player === 'P1' ? p1.charId : cpu.charId]?.gender || 'M';
               if (Math.random() > 0.5 && attackerGender === 'M') audio.playSFX(getRandomSFX(SFX_VOICE_ATTACK));
               await playCinematicIntro(player, tech.name);
               await executeHit(player, player === 'P1' ? 'CPU' : 'P1', action, tech, otherAction, otherTech);
            } else if (action.direction === 'NONE') {
               if (action.charge > 50) {
                   audio.playSFX(getRandomSFX(SFX_MAGICS));
                   const attacker = player === 'P1' ? p1 : cpu;
                   const gender = CHARACTERS[attacker.charId]?.gender || 'M';
                   const voiceLines = SFX_VOICE_ATTACK.filter(s => s.includes(gender.toLowerCase()));
                   if (Math.random() > 0.5) audio.playSFX(getRandomSFX(voiceLines.length > 0 ? voiceLines : SFX_VOICE_ATTACK));
                   await playCinematicIntro(player, tech.name);
                   await executeHit(player, player === 'P1' ? 'CPU' : 'P1', action, tech, otherAction, otherTech);
               } else {
                   addLog(`${player === 'P1' ? p1.name : cpu.name} adopta una postura defensiva.`, 'block');
               }
             } else if (action.direction === 'ULTIMATE') {
                 audio.playSFX('power_up');
                 await playCinematicIntro(player, tech.name);
                 await executeHit(player, player === 'P1' ? 'CPU' : 'P1', action, tech, otherAction, otherTech);
             } else if (action.direction === 'UP') {
               audio.playSFX(getRandomSFX(SFX_DODGES));
               await playCinematicIntro(player, tech.name);
               await playCinematicResult(player, 'dodge', tech.name);
               addLog(`${player === 'P1' ? p1.name : cpu.name} toma impulso en el aire con ${tech.name}.`, 'dodge');
            }
        };

        const firstAction = first === 'P1' ? p1Action : cpuAction;
        const firstTech = first === 'P1' ? p1Tech : cpuTech;
        const secondAction = second === 'P1' ? p1Action : cpuAction;
        const secondTech = second === 'P1' ? p1Tech : cpuTech;

        if (firstAction && firstTech) {
            await executeTurn(first, firstAction, firstTech, secondAction, secondTech);
        }

        if (secondAction && secondTech) {
           const secondPlayerHp = second === 'P1' ? currentP1Hp : currentCpuHp;
           if (secondPlayerHp > 0) {
               await executeTurn(second, secondAction, secondTech, null, null);
           }
        }

        setP1(p => ({ ...p, stamina: Math.min(p.maxStamina, p.stamina + 20) }));
        setCpu(c => ({ ...c, stamina: Math.min(c.maxStamina, c.stamina + 20) }));
        
        // Process Status Effects (Poison, Regen)
        const processEffects = (p: Player, isCpu: boolean) => {
           let hpDelta = 0;
           let staminaDelta = 0;
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
           
           return { newEffects, hpDelta, staminaDelta };
        };

        const p1EffectsRes = processEffects(p1, false);
        const cpuEffectsRes = processEffects(cpu, true);

        setTimeout(() => {
           setAnimState({ p1: 'idle', cpu: 'idle' });
           setP1(p => {
              let updatedHp = Math.min(p.maxHp, Math.max(0, p.hp + p1EffectsRes.hpDelta));
              setCpu(c => {
                 let updatedCpuHp = Math.min(c.maxHp, Math.max(0, c.hp + cpuEffectsRes.hpDelta));
                 if (updatedHp <= 0 || updatedCpuHp <= 0) {
                    setPhase('GAME_OVER');
                 } else {
                    setTurnState({ p1Action: null, cpuAction: null });
                    setPhase('NEUTRAL');
                 }
                 return { ...c, hp: updatedCpuHp, effects: cpuEffectsRes.newEffects };
              });
              return { ...p, hp: updatedHp, effects: p1EffectsRes.newEffects };
           });
        }, 1500);
      };
      
      resolveTurn();
    }
  }, [phase]);

  const resetGame = () => {
    setP1(createPlayerState('P1', p1CharId));
    setCpu(createPlayerState(isPVP ? 'P2' : 'CPU', p2CharId));
    
    setPhase('INIT');
    setTurnState({ p1Action: null, cpuAction: null });
    setCombatLog([]);
    setAnimState({ p1: 'idle', cpu: 'idle' });
    setCinematic(null);
    setFloatingTexts([]);
    setCountdown(3);
    setDialogueStep(0);
    setActiveDirection('NONE');
    setChargeLevel(0);
    setReactionTimeLeft(null);
    setP2ActiveDirection('NONE');
    setP2ChargeLevel(0);
  };

  return {
    p1, cpu, phase, countdown, isPVP,
    activeDirection, chargeLevel, reactionTimeLeft, combatLog, animState,
    startCharge, cancelCharge, executeAction,
    p2ActiveDirection, p2ChargeLevel, p2StartCharge, p2CancelCharge, p2ExecuteAction,
    turnState, cinematic, floatingTexts, resetGame, dialogueStep, activeDialogues
  };
}
