import React from 'react';
import { Player, CinematicState, FloatingText } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface Props {
  p1: Player;
  cpu: Player;
  phase: string;
  animState: { p1: string; cpu: string };
  countdown: number | null;
  p1Charge?: number;
  p2Charge?: number;
  p1Acted?: boolean;
  p2Acted?: boolean;
  cinematic: CinematicState | null;
  floatingTexts: FloatingText[];
  dialogueStep: number;
  activeDialogues: {p1: string, p2: string};
}

const TRANSLATIONS: Record<string, string> = {
  attack: 'ATAQUE',
  dodge: 'ESQUIVA',
  block: 'BLOQUEO',
  hit: 'DAÑO',
  heal: 'CURA',
  idle: ''
};

const getSprite = (player: Player, state: string) => {
  if (state === 'hit') return player.avatars.hurt;
  if (state === 'attack') return player.avatars.attack;
  return player.avatars.idle;
};

const BACKGROUNDS = [
  'Burning_Japanese_dojo.jpeg',
  'Desert_arena_with_crystal.jpeg',
  'Dojo_consumed_by_raging_fire.jpeg',
  'Fantasy_landscape_floating_island.jpeg',
  'Gothic_throne_room.jpeg',
  'Martial_arts_tournament.jpeg',
  'Martial_arts_tournament_2.jpeg',
  'Rainy_neon_cyberpunk.jpeg',
  'Snowy_mountain.jpeg',
  'Stone_temple_ruins.jpeg',
  'Volcanic_wasteland.jpeg'
];

export function BattleArena({ p1, cpu, phase, animState, countdown, p1Charge = 0, p2Charge = 0, p1Acted = false, p2Acted = false, cinematic, floatingTexts, dialogueStep, activeDialogues }: Props) {
  const p1Acting = phase === 'P1_REACTION';
  const cpuActing = phase === 'P2_REACTION' || phase === 'CPU_REACTION';
  const isHit = animState.p1 === 'hit' || animState.cpu === 'hit';
  
  // Calculate if there's a heavy hit based on floating text damage > 1000 or crit
  const isHeavyHit = isHit && floatingTexts.some(ft => (ft.type === 'damage' && parseInt(ft.text) < -1000) || ft.type === 'crit');

  const arenaBg = React.useMemo(() => BACKGROUNDS[Math.floor(Math.random() * BACKGROUNDS.length)], []);

  return (
    <motion.div 
      className="flex-1 flex flex-col relative overflow-hidden bg-cover bg-center min-h-0 shrink-0"
      style={{ backgroundImage: `url('/bg/${arenaBg}')` }}
      animate={
        isHeavyHit ? { x: [-30, 30, -20, 20, -10, 10, -5, 5, 0], y: [-30, 30, -20, 20, -10, 10, -5, 5, 0] } :
        isHit ? { x: [-15, 15, -10, 10, -5, 5, 0], y: [-15, 15, -10, 10, -5, 5, 0] } : { x: 0, y: 0 }
      }
      transition={{ duration: isHeavyHit ? 0.7 : 0.4 }}
    >
      <AnimatePresence>
        {isHit && (
           <motion.div 
             className="absolute inset-0 bg-white z-[200] pointer-events-none"
             initial={{ opacity: 1 }}
             animate={{ opacity: 0 }}
             exit={{ opacity: 0 }}
             transition={{ duration: 0.3 }}
           />
        )}
      </AnimatePresence>

      {/* Floating Combat Text Layer */}
      <div className="absolute inset-0 z-[150] pointer-events-none overflow-hidden">
        <AnimatePresence>
          {floatingTexts.map(ft => {
            const isP1 = ft.player === 'P1';
            const colorClass = 
              ft.type === 'damage' ? 'text-red-500' : 
              ft.type === 'heal' ? 'text-green-400' : 
              ft.type === 'crit' ? 'text-yellow-400 font-black text-6xl drop-shadow-[0_0_20px_rgba(255,255,0,0.8)]' :
              ft.type === 'combo' ? 'text-orange-500 font-black text-5xl' :
              ft.type === 'exhausted' ? 'text-gray-400' :
              'text-blue-300';
            
            return (
              <motion.div
                key={ft.id}
                initial={{ opacity: 0, y: 0, scale: 0.5, x: isP1 ? '25%' : '75%' }}
                animate={{ opacity: [0, 1, 1, 0], y: -150 + (ft.yOffset || 0), scale: 1, x: `calc(${isP1 ? '25%' : '75%'} + ${ft.xOffset || 0}px)` }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                className={`absolute top-1/2 left-0 w-full text-center ${colorClass} text-4xl sm:text-5xl font-black italic uppercase tracking-widest drop-shadow-[-2px_-2px_0_#000,2px_-2px_0_#000,-2px_2px_0_#000,2px_2px_0_#000]`}
                style={{ marginLeft: '-50%' }} // Center text exactly over player
              >
                {ft.text}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      <div className="h-20 sm:h-32 flex justify-between px-4 sm:px-8 py-2 sm:py-4 bg-gradient-to-b from-black/80 to-transparent z-10 shrink-0">
        <PlayerStats player={p1} align="left" isCharging={p1Charge > 0} hasActed={p1Acted} />
        <div className="flex flex-col items-center justify-start relative">
          <div className="text-2xl sm:text-4xl font-black italic text-transparent bg-clip-text bg-gradient-to-b from-gray-100 to-gray-500 drop-shadow-[0_2px_2px_rgba(0,0,0,1)]">
             VS
          </div>
        </div>
        <PlayerStats player={cpu} align="right" isCharging={p2Charge > 0} hasActed={p2Acted} />
      </div>
      
      <div className="flex-1 flex items-center justify-center relative z-0 min-h-0 bg-black/50 overflow-hidden py-2">
        <div className="w-full aspect-auto sm:aspect-video h-full max-h-full relative overflow-hidden shadow-[0_0_50px_black] flex border-y-2 border-red-900/30">
          
          <AnimatePresence>
            {cinematic && cinematic.activePlayer && (
              <motion.div 
                className={`absolute inset-0 z-[100] flex items-center justify-center overflow-hidden ${cinematic.activePlayer === 'P1' ? p1.arenaBg : cpu.arenaBg}`}
                initial={{ opacity: 0, scale: 1.1 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.1 }}
                transition={{ duration: 0.3 }}
              >
                 <img 
                    src={cinematic.event === 'technique_intro' ? (cinematic.activePlayer === 'P1' ? p1.avatars.cinematicIntro : cpu.avatars.cinematicIntro) : (cinematic.activePlayer === 'P1' ? p1.avatars.idle : cpu.avatars.idle)} 
                    className="absolute inset-0 w-full h-full object-cover object-[center_top] sm:object-[center_20%] opacity-90"
                    style={{ transform: cinematic.activePlayer === 'CPU' ? 'scaleX(-1)' : 'none' }}
                 />
                 <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                 
                 <motion.div 
                   className="absolute inset-0 bg-[radial-gradient(circle,transparent_20%,rgba(0,0,0,0.8)_100%)] pointer-events-none mix-blend-overlay"
                   animate={{ scale: [1, 1.05, 1], opacity: [0.5, 0.8, 0.5] }}
                   transition={{ repeat: Infinity, duration: 0.2 }}
                 />

                 <div className="absolute inset-0 flex flex-col items-center justify-end pb-8 sm:pb-16 z-20">
                    <motion.div
                       initial={{ x: -100, opacity: 0 }}
                       animate={{ x: 0, opacity: 0.9 }}
                       className="text-5xl sm:text-7xl font-black italic text-white drop-shadow-[0_5px_15px_rgba(0,0,0,1)] uppercase text-center max-w-[80%]"
                    >
                       {cinematic.event === 'technique_intro' && cinematic.techniqueName}
                       {cinematic.event === 'hit' && '¡IMPACTO!'}
                       {cinematic.event === 'dodge' && '¡ESQUIVA!'}
                       {cinematic.event === 'block' && '¡BLOQUEO!'}
                       {cinematic.event === 'heal' && '¡RECUPERACIÓN!'}
                    </motion.div>
                    
                    {cinematic.damage && cinematic.damage > 0 && (
                       <motion.div
                         initial={{ scale: 0, opacity: 0 }}
                         animate={{ scale: [0, 1.2, 1], opacity: 0.9 }}
                         transition={{ delay: 0.2 }}
                         className="text-5xl sm:text-7xl font-black text-red-500 drop-shadow-[0_5px_10px_black] mt-4"
                       >
                         -{cinematic.damage} PV
                       </motion.div>
                    )}
                 </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* P1 Side */}
          <motion.div 
            className={`flex-1 h-full ${p1.arenaBg} flex items-end justify-center relative overflow-hidden`}
            animate={
              animState.p1 === 'hit' ? { x: [-10, 10, -10, 10, 0], filter: 'brightness(1.5) sepia(1) hue-rotate(-50deg) saturate(5)' } :
              animState.p1 === 'attack' ? { scale: 1.1, filter: 'brightness(1.5)' } :
              animState.p1 === 'dodge' ? { x: -30, opacity: 0.5 } :
              animState.p1 === 'block' ? { scale: 0.95, filter: 'brightness(0.5)' } :
              animState.p1 === 'heal' ? { filter: 'brightness(1.5) sepia(1) hue-rotate(50deg) saturate(3)' } :
              { 
                y: p1.isKnockedDown ? 40 : p1Acting ? -10 : 0,
                rotate: p1.isKnockedDown ? -10 : 0,
                opacity: p1.hp <= 0 ? 0.3 : 1,
                scale: p1Acting ? 1.05 : 1,
                filter: 'brightness(1)'
              }
            }
            transition={{ duration: animState.p1 === 'hit' ? 0.3 : 0.5 }}
          >
            {p1.avatars && (
              <img 
                src={getSprite(p1, animState.p1)} 
                alt={p1.name} 
                className="absolute inset-0 w-full h-full object-cover object-[center_top] sm:object-[center_20%] opacity-100 pointer-events-none scale-[1.02]"
              />
            )}
            {p1Acting && animState.p1 === 'idle' && (
              <motion.div 
                className={`absolute inset-0 ${p1.arenaBg} mix-blend-overlay`}
                animate={{ opacity: [0, 0.5, 0] }}
                transition={{ repeat: Infinity, duration: 1 }}
              />
            )}
            <div className={`absolute bottom-0 w-full bg-black/60 py-2 sm:py-3 text-center ${p1.arenaText} font-black uppercase tracking-[0.3em] text-lg sm:text-2xl z-20 backdrop-blur-sm border-t border-white/10`}>
              {p1.name}
            </div>
            {p1.isKnockedDown && (
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-red-500 font-black animate-pulse text-4xl sm:text-6xl z-30">
                DOWN
              </div>
            )}
            <AnimatePresence>
              {animState.p1 !== 'idle' && (
                <motion.div 
                  initial={{ opacity: 0, y: 50, scale: 0.5 }}
                  animate={{ opacity: 0.9, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.5 }}
                  className={`absolute top-[65%] left-1/2 -translate-x-1/2 text-4xl sm:text-7xl font-black uppercase tracking-widest drop-shadow-[0_4px_15px_black] z-50 ${
                    animState.p1 === 'hit' ? 'text-red-500' :
                    animState.p1 === 'block' ? 'text-emerald-400' :
                    animState.p1 === 'dodge' ? 'text-blue-400 italic' :
                    animState.p1 === 'heal' ? 'text-yellow-400' :
                    'text-white'
                  }`}
                >
                  {TRANSLATIONS[animState.p1] || animState.p1}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Cinematic Divider */}
          <div className="absolute top-0 bottom-0 left-1/2 w-1 -translate-x-1/2 bg-gradient-to-b from-transparent via-red-600 to-transparent shadow-[0_0_30px_red] z-30 pointer-events-none"></div>

          {/* P2 Side */}
          <motion.div 
            className={`flex-1 h-full ${cpu.arenaBg} flex items-end justify-center relative overflow-hidden`}
            animate={
              animState.cpu === 'hit' ? { x: [-10, 10, -10, 10, 0], filter: 'brightness(1.5) sepia(1) hue-rotate(-50deg) saturate(5)' } :
              animState.cpu === 'attack' ? { scale: 1.1, filter: 'brightness(1.5)' } :
              animState.cpu === 'dodge' ? { x: 30, opacity: 0.5 } :
              animState.cpu === 'block' ? { scale: 0.95, filter: 'brightness(0.5)' } :
              animState.cpu === 'heal' ? { filter: 'brightness(1.5) sepia(1) hue-rotate(50deg) saturate(3)' } :
              { 
                y: cpu.isKnockedDown ? 40 : cpuActing ? -10 : 0,
                rotate: cpu.isKnockedDown ? 10 : 0,
                opacity: cpu.hp <= 0 ? 0.3 : 1,
                scale: cpuActing ? 1.05 : 1,
                filter: 'brightness(1)'
              }
            }
            transition={{ duration: animState.cpu === 'hit' ? 0.3 : 0.5 }}
          >
            {cpu.avatars && (
              <img 
                src={getSprite(cpu, animState.cpu)} 
                alt={cpu.name} 
                className="absolute inset-0 w-full h-full object-cover object-[center_top] sm:object-[center_20%] opacity-100 pointer-events-none scale-[1.02]"
                style={{ transform: 'scaleX(-1)' }}
              />
            )}
            {cpuActing && animState.cpu === 'idle' && (
              <motion.div 
                className={`absolute inset-0 ${cpu.arenaBg} mix-blend-overlay`}
                animate={{ opacity: [0, 0.5, 0] }}
                transition={{ repeat: Infinity, duration: 1 }}
              />
            )}
            <div className={`absolute bottom-0 w-full bg-black/60 py-2 sm:py-3 text-center ${cpu.arenaText} font-black uppercase tracking-[0.3em] text-lg sm:text-2xl z-20 backdrop-blur-sm border-t border-white/10`}>
              {cpu.name}
            </div>
            {cpu.isKnockedDown && (
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-red-500 font-black animate-pulse text-4xl sm:text-6xl z-30">
                DOWN
              </div>
            )}
            <AnimatePresence>
              {animState.cpu !== 'idle' && (
                <motion.div 
                  initial={{ opacity: 0, y: 50, scale: 0.5 }}
                  animate={{ opacity: 0.9, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.5 }}
                  className={`absolute top-[65%] left-1/2 -translate-x-1/2 text-4xl sm:text-7xl font-black uppercase tracking-widest drop-shadow-[0_4px_15px_black] z-50 ${
                    animState.cpu === 'hit' ? 'text-red-500' :
                    animState.cpu === 'block' ? 'text-emerald-400' :
                    animState.cpu === 'dodge' ? 'text-blue-400 italic' :
                    animState.cpu === 'heal' ? 'text-yellow-400' :
                    'text-white'
                  }`}
                >
                  {TRANSLATIONS[animState.cpu] || animState.cpu}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
        
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[60] pointer-events-none flex flex-col items-center">
            {phase === 'DIALOGUE' && dialogueStep < 2 && (
               <motion.div 
                 key={dialogueStep}
                 initial={{ scale: 0.5, opacity: 0, y: 50 }}
                 animate={{ scale: 1, opacity: 1, y: 0 }}
                 exit={{ scale: 1.1, opacity: 0 }}
                 className="bg-black/80 border border-white/20 p-6 rounded-2xl shadow-2xl backdrop-blur-sm max-w-lg text-center"
               >
                 <p className="text-xl sm:text-2xl font-bold italic text-white drop-shadow-md">
                   "{dialogueStep === 0 ? activeDialogues.p1 : activeDialogues.p2}"
                 </p>
                 <div className="text-sm font-black text-gray-500 uppercase mt-4 tracking-widest">
                   - {dialogueStep === 0 ? p1.name : cpu.name}
                 </div>
               </motion.div>
            )}
            {(phase === 'INIT' || (phase === 'DIALOGUE' && dialogueStep >= 2)) && countdown !== null && (
               <motion.div 
                 key={countdown}
                 initial={{ scale: 0.5, opacity: 0 }}
                 animate={{ scale: 1, opacity: 1 }}
                 exit={{ scale: 1.5, opacity: 0 }}
                 className="text-8xl font-black italic text-white drop-shadow-[0_4px_20px_rgba(255,0,0,0.8)]"
               >
                  {countdown > 0 ? countdown : '¡FIGHT!'}
               </motion.div>
            )}
            {phase === 'RESOLVING' && (
               <motion.div 
                 initial={{ scale: 0, opacity: 0 }}
                 animate={{ scale: [0, 1.2, 1, 1, 1.5], opacity: [0, 1, 1, 1, 0] }}
                 transition={{ duration: 1.2, times: [0, 0.2, 0.4, 0.8, 1] }}
                 className="text-6xl sm:text-8xl font-black italic text-white drop-shadow-[0_4px_10px_rgba(0,0,0,0.8)]"
               >
                  ¡ACCIÓN!
               </motion.div>
            )}
        </div>
      </div>
      
      <div className="absolute inset-0 pointer-events-none border-[30px] sm:border-[60px] border-black/20 border-transparent shadow-[inset_0_0_100px_black]"></div>
    </motion.div>
  );
}

function PlayerStats({ player, align, isCharging, hasActed }: { player: Player, align: 'left' | 'right', isCharging: boolean, hasActed: boolean }) {
  const hpPercent = Math.max(0, (player.hp / player.maxHp) * 100);
  const stPercent = Math.max(0, (player.stamina / player.maxStamina) * 100);
  const isLeft = align === 'left';
  
  const hpColor = isLeft ? 'from-emerald-600 to-emerald-400' : 'from-red-600 to-red-400';
  const stColor = isLeft ? 'from-blue-600 to-cyan-400' : 'from-orange-600 to-yellow-400';
  const hpShadow = isLeft ? 'shadow-[0_0_10px_rgba(52,211,153,0.5)]' : 'shadow-[0_0_10px_rgba(248,113,113,0.5)]';
  const stShadow = isLeft ? 'shadow-[0_0_8px_rgba(6,182,212,0.5)]' : 'shadow-[0_0_8px_rgba(251,191,36,0.5)]';

  // Glow logic based on charging and acting state
  const glowClass = isCharging 
    ? (isLeft ? 'shadow-[0_0_20px_rgba(59,130,246,0.8)] border-blue-400' : 'shadow-[0_0_20px_rgba(239,68,68,0.8)] border-red-400')
    : hasActed 
      ? (isLeft ? 'shadow-[0_0_15px_rgba(59,130,246,0.5)] border-blue-500' : 'shadow-[0_0_15px_rgba(239,68,68,0.5)] border-red-500')
      : (isLeft ? 'shadow-[0_0_15px_rgba(59,130,246,0.3)] border-blue-500' : 'shadow-[0_0_15px_rgba(239,68,68,0.3)] border-red-500');

  return (
    <div className={`flex gap-2 sm:gap-4 items-center w-5/12 ${isLeft ? '' : 'flex-row-reverse text-right'}`}>
      <div className="relative shrink-0">
        <div className={`w-16 h-16 sm:w-24 sm:h-24 bg-black ${glowClass} border-2 rounded-lg overflow-hidden transition-all duration-300 relative`}>
          {player.avatars && (
             <img src={player.avatars.base} alt={player.name} className="absolute inset-0 w-full h-full object-cover opacity-80" style={{ transform: isLeft ? 'none' : 'scaleX(-1)' }} />
          )}
          <div className={`absolute inset-0 ${isLeft ? 'bg-gradient-to-t from-blue-900/50' : 'bg-gradient-to-t from-red-900/50'} to-transparent`}></div>
          <div className={`absolute top-0 left-0 w-full p-1 sm:p-2 text-[10px] sm:text-xs font-bold uppercase tracking-widest ${isLeft ? 'text-blue-300' : 'text-red-300'} bg-black/40`}>
            {player.name}
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col gap-1 sm:gap-2">
        <div className="h-4 sm:h-6 bg-gray-800 rounded-sm overflow-hidden border border-gray-700 relative flex justify-end">
          <motion.div 
            className={`h-full ${isLeft ? 'bg-gradient-to-r mr-auto' : 'bg-gradient-to-l ml-auto'} ${hpColor} ${hpShadow} transition-all duration-500`}
            initial={{ width: `${hpPercent}%` }}
            animate={{ width: `${hpPercent}%` }}
            transition={{ type: 'spring', bounce: 0, duration: 0.5 }}
          />
          <span className={`absolute inset-0 flex items-center ${isLeft ? 'justify-end pr-2' : 'justify-start pl-2'} text-[8px] sm:text-[10px] font-bold z-10`}>
             {Math.floor(player.hp)} / {player.maxHp} HP
          </span>
        </div>
        <div className="h-3 sm:h-4 bg-gray-800 rounded-sm overflow-hidden border border-gray-700 relative flex justify-end">
          <motion.div 
            className={`h-full ${isLeft ? 'bg-gradient-to-r mr-auto' : 'bg-gradient-to-l ml-auto'} ${stColor} ${stShadow} transition-all duration-500`}
            initial={{ width: `${stPercent}%` }}
            animate={{ width: `${stPercent}%` }}
            transition={{ type: 'spring', bounce: 0, duration: 0.3 }}
          />
          <span className={`absolute inset-0 flex items-center ${isLeft ? 'justify-end pr-2' : 'justify-start pl-2'} text-[8px] sm:text-[10px] font-bold italic z-10`}>
             {Math.floor(player.stamina)} / {player.maxStamina} ST
          </span>
        </div>
        <div className="h-2 sm:h-3 bg-gray-800 rounded-sm overflow-hidden border border-gray-700 relative flex justify-end mt-1">
          <motion.div 
            className={`h-full ${isLeft ? 'bg-gradient-to-r mr-auto' : 'bg-gradient-to-l ml-auto'} from-yellow-500 to-yellow-300 shadow-[0_0_10px_rgba(234,179,8,0.5)] transition-all duration-300`}
            initial={{ width: `${Math.min(100, player.limit || 0)}%` }}
            animate={{ width: `${Math.min(100, player.limit || 0)}%` }}
          />
          <span className={`absolute inset-0 flex items-center ${isLeft ? 'justify-end pr-2' : 'justify-start pl-2'} text-[6px] sm:text-[8px] font-bold z-10 uppercase text-white/50`}>
             LIMIT
          </span>
        </div>
      </div>
    </div>
  );
}
