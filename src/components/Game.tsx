import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameEngine } from '../hooks/useGameEngine';
import { BattleArena } from './BattleArena';
import { ControlPanel } from './ControlPanel';
import { useGamepad } from '../hooks/useGamepad';
import { GameConfig } from '../App';
import { audio } from '../utils/audio';

interface Props {
  onBackToMenu: () => void;
  config: GameConfig;
}

export function Game({ onBackToMenu, config }: Props) {
  const isPVP = config.p2Input !== 'cpu';
  const { 
    p1, cpu, phase, countdown, turnState,
    activeDirection, chargeLevel, reactionTimeLeft, combatLog, animState,
    startCharge, cancelCharge, executeAction,
    p2ActiveDirection, p2ChargeLevel, p2StartCharge, p2CancelCharge, p2ExecuteAction,
    cinematic, floatingTexts, resetGame, dialogueStep, activeDialogues
  } = useGameEngine({ 
    mode: config.mode, 
    isPVP,
    p1CharId: config.p1CharId,
    p2CharId: config.p2CharId
  });

  const p1Handlers = useMemo(() => ({ startCharge, cancelCharge, executeAction }), [startCharge, cancelCharge, executeAction]);
  const p2Handlers = useMemo(() => ({ startCharge: p2StartCharge, cancelCharge: p2CancelCharge, executeAction: p2ExecuteAction }), [p2StartCharge, p2CancelCharge, p2ExecuteAction]);

  useGamepad(config.p1Input, p1Handlers, true);
  useGamepad(config.p2Input, p2Handlers, isPVP);

  const [isPaused, setIsPaused] = React.useState(false);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && phase !== 'GAME_OVER') {
        setIsPaused(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [phase]);

  const [rematchTimer, setRematchTimer] = React.useState(10);

  React.useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (phase === 'GAME_OVER') {
      audio.playBGM('game_over');
      audio.playSFX('power_up');
      audio.playSFX('final_attack_1');
      setRematchTimer(10);
      timer = setInterval(() => {
        setRematchTimer(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            onBackToMenu();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
       if (timer) clearInterval(timer);
    };
  }, [phase, onBackToMenu]);

  return (
    <div className="flex-1 flex flex-col w-full h-full relative overflow-hidden">
      <AnimatePresence>
        {isPaused && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center"
          >
            <h2 className="text-4xl font-black italic text-white mb-8 tracking-widest drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]">
              PAUSA
            </h2>
            <div className="flex flex-col gap-4 w-64">
              <button 
                onClick={() => setIsPaused(false)}
                className="w-full py-3 bg-blue-900 border-2 border-blue-500 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors uppercase tracking-wider"
              >
                Continuar
              </button>
              <button 
                onClick={onBackToMenu}
                className="w-full py-3 bg-red-950 border-2 border-red-500/50 text-red-200 font-bold rounded-lg hover:bg-red-900 transition-colors uppercase tracking-wider"
              >
                Abandonar
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {phase === 'GAME_OVER' ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-[100] overflow-hidden bg-black">
          {/* Winner Win Cinematic */}
          <div className="absolute inset-0 z-0">
             <img src={p1.hp <= 0 ? cpu.avatars.cinematicWin : p1.avatars.cinematicWin} className="w-full h-full object-cover object-center opacity-60" />
          </div>
          {/* Loser Defeat Cinematic */}
          <div className="absolute inset-x-0 bottom-0 h-2/3 z-0 bg-gradient-to-t from-black via-transparent to-transparent flex items-end">
             <div className="w-full h-full relative" style={{ maskImage: 'linear-gradient(to top, black 50%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to top, black 50%, transparent 100%)' }}>
               <img src={p1.hp <= 0 ? p1.avatars.cinematicDefeat : cpu.avatars.cinematicDefeat} className="w-full h-full object-cover object-top opacity-90" />
             </div>
          </div>
          <div className="absolute inset-0 bg-black/40 z-10" />

          {/* Winner Dialogue */}
          <motion.div 
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="absolute top-12 left-12 z-20 bg-black/80 border border-white/20 p-6 rounded-2xl shadow-2xl max-w-md"
          >
            <p className="text-xl sm:text-2xl font-bold italic text-white drop-shadow-md">
              "{p1.hp <= 0 ? activeDialogues.p2 : activeDialogues.p1}"
            </p>
            <div className="text-sm font-black text-yellow-500 uppercase mt-4 tracking-widest">
              - {p1.hp <= 0 ? cpu.name : p1.name} (Vencedor)
            </div>
          </motion.div>

          {/* Loser Dialogue */}
          <motion.div 
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 1.5 }}
            className="absolute bottom-12 right-12 z-20 bg-black/80 border border-white/20 p-6 rounded-2xl shadow-2xl max-w-md text-right"
          >
            <p className="text-xl sm:text-2xl font-bold italic text-gray-300 drop-shadow-md">
              "{p1.hp <= 0 ? activeDialogues.p1 : activeDialogues.p2}"
            </p>
            <div className="text-sm font-black text-gray-500 uppercase mt-4 tracking-widest">
              - {p1.hp <= 0 ? p1.name : cpu.name} (Derrotado)
            </div>
          </motion.div>

          <h1 className="text-6xl sm:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-b from-red-500 to-red-800 drop-shadow-[0_0_30px_rgba(239,68,68,0.4)] z-20 mt-[-10%]">
            K.O.
          </h1>
          <p className="text-2xl sm:text-3xl text-white z-10 uppercase tracking-[0.5em] font-black drop-shadow-md">
            {p1.hp <= 0 ? `${cpu.name} GANA` : `${p1.name} GANA`}
          </p>
          <div className="text-8xl font-black text-red-600/50 z-10 mt-4 drop-shadow-[0_0_20px_rgba(255,0,0,0.5)]">
             {rematchTimer}
          </div>
          <div className="flex gap-4 z-10 mt-8">
            <button 
              onClick={resetGame}
              className="px-8 py-3 bg-blue-900 border border-blue-500 text-white font-black rounded hover:bg-blue-700 transition-colors uppercase text-sm tracking-[0.2em]"
            >
              REVANCHA
            </button>
            <button 
              onClick={onBackToMenu}
              className="px-8 py-3 bg-red-900 border border-red-500 text-white font-black rounded hover:bg-red-700 transition-colors uppercase text-sm tracking-[0.2em]"
            >
              SALIR
            </button>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col h-full min-h-0">
          <BattleArena 
            p1={p1} cpu={cpu} phase={phase} animState={animState} countdown={countdown} 
            p1Charge={chargeLevel} p2Charge={p2ChargeLevel}
            p1Acted={!!turnState.p1Action} p2Acted={!!turnState.cpuAction}
            cinematic={cinematic}
            floatingTexts={floatingTexts}
            dialogueStep={dialogueStep}
            activeDialogues={activeDialogues}
          />
          
          <div className="flex flex-col xl:flex-row gap-2 mt-4 shrink-0 min-h-0">
             <div className="flex-1 min-h-0">
               <ControlPanel 
                  phase={phase}
                  activeDirection={activeDirection}
                  chargeLevel={chargeLevel}
                  reactionTimeLeft={reactionTimeLeft}
                  combatLog={combatLog}
                  startCharge={startCharge}
                  cancelCharge={cancelCharge}
                  executeAction={executeAction}
                  player={p1}
                  playerId="P1"
                  hideLog={isPVP}
                  inputMode={config.p1Input}
                  allowArrows={config.p2Input !== 'keyboard'}
                />
             </div>

             {isPVP && (
                <div className="flex-1 min-h-0">
                  <ControlPanel 
                    phase={phase}
                    activeDirection={p2ActiveDirection}
                    chargeLevel={p2ChargeLevel}
                    reactionTimeLeft={reactionTimeLeft}
                    combatLog={combatLog}
                    startCharge={p2StartCharge}
                    cancelCharge={p2CancelCharge}
                    executeAction={p2ExecuteAction}
                    player={cpu}
                    playerId="P2"
                    hideLog={true}
                    inputMode={config.p2Input}
                  />
                </div>
             )}
          </div>
        </div>
      )}
    </div>
  );
}
