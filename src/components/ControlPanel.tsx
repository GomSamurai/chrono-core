import React, { useEffect, useRef } from 'react';
import { Direction, ActionButton, Player, CombatLogEntry } from '../types';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';
import { CHAR_TECHNIQUES_DB } from '../data/techniques';

interface Props {
  phase: string;
  activeDirection: Direction;
  chargeLevel: number;
  reactionTimeLeft: number;
  combatLog: CombatLogEntry[];
  startCharge: (dir: Direction) => void;
  cancelCharge: () => void;
  executeAction: (btn: ActionButton) => void;
  player: Player;
  playerId?: 'P1' | 'P2';
  hideLog?: boolean;
  inputMode?: string;
  allowArrows?: boolean;
}

export function ControlPanel({ 
  phase, activeDirection, chargeLevel, reactionTimeLeft, combatLog,
  startCharge, cancelCharge, executeAction, player, playerId = 'P1', hideLog = false,
  inputMode = 'keyboard', allowArrows = true
}: Props) {
  
  const canAct = phase === 'NEUTRAL' || phase === (playerId === 'P1' ? 'P1_REACTION' : 'P2_REACTION');
  
  const logEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [combatLog]);

  const handlersRef = useRef({ startCharge, cancelCharge, executeAction, phase, playerId, canAct, allowArrows });
  useEffect(() => {
    handlersRef.current = { startCharge, cancelCharge, executeAction, phase, playerId, canAct, allowArrows };
  });

  useEffect(() => {
    if (inputMode !== 'keyboard') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const { canAct, startCharge, executeAction, playerId, allowArrows } = handlersRef.current;
      if (!canAct) return;
      if (e.repeat) return;

      if (playerId === 'P1') {
        switch(e.key.toLowerCase()) {
          case 'w': startCharge('UP'); break;
          case 's': startCharge('DOWN'); break;
          case 'a': startCharge('LEFT'); break;
          case 'd': startCharge('RIGHT'); break;
          case 'z': executeAction('A'); break;
          case 'x': executeAction('B'); break;
          case 'c': executeAction('X'); break;
          case 'v': executeAction('Y'); break;
          case 'q': executeAction('ULTIMATE'); break;
        }
        if (allowArrows) {
          switch(e.key) {
            case 'ArrowUp': startCharge('UP'); break;
            case 'ArrowDown': startCharge('DOWN'); break;
            case 'ArrowLeft': startCharge('LEFT'); break;
            case 'ArrowRight': startCharge('RIGHT'); break;
          }
        }
      } else {
        switch(e.key) {
          case 'ArrowUp': startCharge('UP'); break;
          case 'ArrowDown': startCharge('DOWN'); break;
          case 'ArrowLeft': startCharge('LEFT'); break;
          case 'ArrowRight': startCharge('RIGHT'); break;
          case '1': case 'o': executeAction('A'); break;
          case '2': case 'p': executeAction('B'); break;
          case '3': case '[': executeAction('X'); break;
          case '5': case ']': executeAction('Y'); break;
          case '0': executeAction('ULTIMATE'); break;
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const { canAct, cancelCharge, playerId, allowArrows } = handlersRef.current;
      if (!canAct) return;
      
      if (playerId === 'P1') {
        switch(e.key.toLowerCase()) {
          case 'w': case 's': case 'a': case 'd': cancelCharge(); break;
        }
        if (allowArrows) {
          switch(e.key) {
            case 'ArrowUp': case 'ArrowDown': case 'ArrowLeft': case 'ArrowRight': cancelCharge(); break;
          }
        }
      } else {
        switch(e.key) {
          case 'ArrowUp': case 'ArrowDown': case 'ArrowLeft': case 'ArrowRight': cancelCharge(); break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [inputMode]);

  const getLogColor = (type: CombatLogEntry['type']) => {
    switch(type) {
      case 'system': return 'text-purple-400 font-black italic';
      case 'attack': return 'text-red-400 font-bold';
      case 'damage': return 'text-red-500 font-black animate-pulse';
      case 'heal': return 'text-yellow-400 font-bold';
      case 'block': return 'text-emerald-400 font-bold';
      case 'dodge': return 'text-blue-400 font-bold italic';
      case 'info': default: return 'text-gray-300';
    }
  };

  const isP1 = playerId === 'P1';

  return (
    <div className={`h-auto sm:h-56 flex flex-col ${hideLog ? 'sm:grid-cols-2' : 'sm:grid-cols-3'} sm:grid gap-4 select-none shrink-0 z-10 w-full min-h-0`}>
      
      {!hideLog && (
        <div className="bg-[#0c0c18] border border-[#252545] p-3 rounded-lg flex flex-col h-32 sm:h-full sm:min-h-0 order-3 sm:order-1 hidden sm:flex">
          <div className="text-[10px] font-bold text-gray-500 uppercase border-b border-gray-800 pb-1 mb-2 flex justify-between shrink-0">
            <span>Battle Log</span>
          </div>
          <div className="flex-1 text-[11px] font-mono space-y-2 overflow-y-auto pr-1 custom-scrollbar min-h-0 flex flex-col">
             {combatLog.map((log, i, arr) => (
               <div key={i} className={`${i === arr.length - 1 ? 'opacity-100 drop-shadow-[0_0_5px_currentColor]' : 'opacity-50'} leading-tight break-words shrink-0 transition-opacity duration-1000 ${getLogColor(log.type)}`}>
                 {log.text}
               </div>
             ))}
             <div ref={logEndRef} />
          </div>
        </div>
      )}

      {/* Directional Menu Interface */}
      <div className={`relative flex items-center justify-center bg-[#0a0a0f] rounded-xl border-2 border-white/5 order-1 sm:order-2 p-2 ${!hideLog && 'col-span-1'} h-56 sm:h-auto`}>
        {chargeLevel > 0 && activeDirection !== 'NONE' && (
          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-3/4 flex flex-col items-center z-20">
            <div className="text-xs font-black italic text-blue-400 uppercase tracking-widest mb-1 animate-pulse">
               {phase.includes('REACTION') ? 'DEFENDIENDO...' : 'CARGANDO...'}
            </div>
            <div className="w-full h-4 bg-black/80 border border-blue-500/50 p-0.5 flex">
              <div className="h-full bg-gradient-to-r from-blue-900 via-blue-400 to-white relative shadow-[0_0_15px_blue]" style={{ width: `${chargeLevel}%` }}>
                <div className="absolute -right-1 top-0 bottom-0 w-1 bg-white shadow-[0_0_10px_white]"></div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-3 grid-rows-3 gap-1 w-24 h-24 sm:w-28 sm:h-28 relative z-10 mt-4 sm:mt-0">
          <div />
          <DPadButton 
             dir="UP" active={activeDirection === 'UP'} canAct={canAct}
             onPress={() => startCharge('UP')} onRelease={cancelCharge} 
             baseColor="border-blue-900/50 bg-blue-900/10 text-blue-400"
             activeColor="bg-blue-600 border-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.5)] text-white"
             label="AIR"
             icon={<ArrowUp size={16} />}
          />
          <div />
          <DPadButton 
             dir="LEFT" active={activeDirection === 'LEFT'} canAct={canAct}
             onPress={() => startCharge('LEFT')} onRelease={cancelCharge} 
             baseColor="border-emerald-900/50 bg-emerald-900/10 text-emerald-400"
             activeColor="bg-emerald-600 border-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)] text-white"
             label="BUFF"
             icon={<ArrowLeft size={16} />}
          />
          <div className="flex items-center justify-center relative">
            {player.limit >= 100 ? (
               <DPadButton 
                 dir="ULTIMATE" active={activeDirection === 'ULTIMATE'} canAct={canAct}
                 onPress={() => executeAction('ULTIMATE')} onRelease={() => {}} 
                 baseColor="border-yellow-300 bg-yellow-900/80 text-yellow-300 shadow-[0_0_20px_rgba(253,224,71,0.8)] animate-pulse"
                 activeColor="bg-yellow-400 border-white text-black shadow-[0_0_30px_rgba(255,255,255,1)]"
                 label="ULT"
               />
            ) : (
              <div className="flex items-center justify-center w-full h-full border-2 border-white/10 rounded-full">
                <div className="text-[10px] text-white/20 font-bold">{playerId}</div>
              </div>
            )}
          </div>
          <div className="flex items-center justify-center relative">
            <DPadButton 
               dir="RIGHT" active={activeDirection === 'RIGHT'} canAct={canAct}
               onPress={() => startCharge('RIGHT')} onRelease={cancelCharge} 
               baseColor="border-yellow-900/50 bg-yellow-900/10 text-yellow-400"
               activeColor="bg-yellow-600 border-yellow-400 shadow-[0_0_10px_rgba(234,179,8,0.5)] text-white"
               label="MELEE"
               icon={<ArrowRight size={16} />}
               fullWidth
            />
          </div>
          <div />
          <DPadButton 
             dir="DOWN" active={activeDirection === 'DOWN'} canAct={canAct}
             onPress={() => startCharge('DOWN')} onRelease={cancelCharge} 
             baseColor="border-red-500 bg-red-900/40 shadow-[0_0_10px_rgba(239,68,68,0.4)] ring-1 ring-white/50 text-red-200"
             activeColor="bg-red-600 border-red-400 shadow-[0_0_15px_rgba(239,68,68,0.8)] text-white"
             label="MAGIC"
             icon={<ArrowDown size={16} />}
          />
          <div />
        </div>
      </div>

      {/* Ability Slots */}
      <div className={`bg-[#0c0c18] border border-[#252545] p-3 rounded-lg flex flex-col gap-2 order-2 sm:order-3 relative ${!hideLog && 'col-span-1'} h-48 sm:h-auto`}>
        <div className="absolute -top-6 right-0 text-[10px] text-gray-500 hidden sm:block">
          {inputMode === 'keyboard' 
            ? (isP1 ? (allowArrows ? 'WASD / Arrows + Z,X,C,V (Q=Ult)' : 'WASD + Z,X,C,V (Q=Ult)') : 'Arrows + O,P,[,], (0=Ult)') 
            : 'Gamepad'}
        </div>
        <div className="text-[10px] font-bold text-gray-500 uppercase border-b border-gray-800 pb-1 flex justify-between shrink-0">
           <span>{player.name} ({activeDirection})</span>
           {phase === (isP1 ? 'P1_REACTION' : 'P2_REACTION') && (
             <span className="text-red-500 animate-pulse">TIME: {reactionTimeLeft}</span>
           )}
        </div>
        <div className="grid grid-cols-2 gap-2 flex-1 overflow-y-auto pr-1 custom-scrollbar min-h-0">
          {((CHAR_TECHNIQUES_DB[player.charId] || CHAR_TECHNIQUES_DB['kaelen'])[activeDirection] || []).map((tech) => {
             const isGamepad = inputMode === 'gamepad';
             let keyLabel = tech.id;
             if (!isGamepad) {
                if (playerId === 'P1') {
                   if (tech.id === 'A') keyLabel = 'Z';
                   if (tech.id === 'B') keyLabel = 'X';
                   if (tech.id === 'X') keyLabel = 'C';
                   if (tech.id === 'Y') keyLabel = 'V';
                } else {
                   if (tech.id === 'A') keyLabel = 'O/1';
                   if (tech.id === 'B') keyLabel = 'P/2';
                   if (tech.id === 'X') keyLabel = '[/3';
                   if (tech.id === 'Y') keyLabel = ']/5';
                }
             }
             return (
             <ActionButtonBtn 
               key={tech.id}
               btn={keyLabel} 
               keycode={`(${tech.combo})`} 
               canAct={canAct} 
               activeDir={activeDirection} 
               onClick={() => executeAction(tech.id)} 
               name={tech.name}
               cost={tech.cost}
               currentStamina={player.stamina}
            />
          )})}
        </div>
      </div>
    </div>
  );
}

function DPadButton({ dir, active, canAct, onPress, onRelease, baseColor, activeColor, label, icon, fullWidth }: any) {
  return (
    <button 
      onMouseDown={(e) => { e.preventDefault(); canAct && onPress(); }}
      onMouseUp={(e) => { e.preventDefault(); onRelease(); }}
      onMouseLeave={(e) => { e.preventDefault(); onRelease(); }}
      onTouchStart={(e) => { e.preventDefault(); canAct && onPress(); }}
      onTouchEnd={(e) => { e.preventDefault(); onRelease(); }}
      disabled={!canAct}
      className={`w-full h-full flex flex-col items-center justify-center border rounded transition-all ${active ? activeColor : baseColor} ${!canAct && 'opacity-50 grayscale'} cursor-pointer select-none`}
    >
      {icon}
      <span className="text-[10px] uppercase font-black leading-none mt-1">{label}</span>
    </button>
  );
}

function ActionButtonBtn({ btn, keycode, canAct, activeDir, onClick, name, cost, currentStamina }: any) {
  const hasStamina = currentStamina >= cost;
  const isEnabled = canAct && hasStamina;
  
  const colorMap: Record<string, { active: string, inactive: string }> = {
    'UP': {
      active: 'border-blue-500/80 shadow-[0_0_10px_rgba(59,130,246,0.3)] bg-blue-900/30 text-white hover:bg-blue-800/50',
      inactive: 'border-blue-500/10 text-blue-300 opacity-40'
    },
    'DOWN': {
      active: 'border-red-500/80 shadow-[0_0_10px_rgba(239,68,68,0.3)] bg-red-900/30 text-white hover:bg-red-800/50',
      inactive: 'border-red-500/10 text-red-300 opacity-40'
    },
    'LEFT': {
      active: 'border-emerald-500/80 shadow-[0_0_10px_rgba(52,211,153,0.3)] bg-emerald-900/30 text-white hover:bg-emerald-800/50',
      inactive: 'border-emerald-500/10 text-emerald-300 opacity-40'
    },
    'RIGHT': {
      active: 'border-yellow-500/80 shadow-[0_0_10px_rgba(234,179,8,0.3)] bg-yellow-900/30 text-white hover:bg-yellow-800/50',
      inactive: 'border-yellow-500/10 text-yellow-300 opacity-40'
    },
    'NONE': {
      active: 'border-gray-500/80 bg-gray-900/30 text-white hover:bg-gray-800/50',
      inactive: 'border-gray-500/10 text-gray-300 opacity-40'
    },
    'ULTIMATE': {
      active: 'border-yellow-400/80 bg-yellow-600/50 text-white shadow-[0_0_15px_rgba(250,204,21,0.5)]',
      inactive: 'border-yellow-400/10 text-yellow-300 opacity-40'
    }
  };

  const colors = colorMap[activeDir] || colorMap['NONE'];

  return (
    <button 
      onMouseDown={(e) => { e.preventDefault(); isEnabled && onClick(); }}
      onTouchStart={(e) => { e.preventDefault(); isEnabled && onClick(); }}
      disabled={!isEnabled}
      className={`bg-[#111122] p-1 sm:p-2 border ${isEnabled ? colors.active : colors.inactive} rounded flex flex-col justify-center items-center transition-all cursor-pointer h-full`}
    >
      <span className="text-[10px] sm:text-[11px] font-bold leading-tight text-center">{name}</span>
      <span className="text-[8px] sm:text-[9px] opacity-60 mt-1 flex gap-2">
         <span>[ {btn} ]</span>
         <span className={hasStamina ? 'text-cyan-300' : 'text-red-400'}>Cost: {cost}</span>
      </span>
    </button>
  );
}
