import React, { useState } from 'react';
import { GameConfig } from '../App';
import { CHARACTERS } from '../data/characters';
import { motion, AnimatePresence } from 'framer-motion';
import { audio } from '../utils/audio';

interface Props {
  config: GameConfig;
  onStartFight: (config: GameConfig) => void;
  onBack: () => void;
}

export function CharacterSelectScreen({ config, onStartFight, onBack }: Props) {
  const isPVP = config.mode === 'versus';
  const [selectingPlayer, setSelectingPlayer] = useState<'P1' | 'P2'>('P1');
  const [p1CharId, setP1CharId] = useState<string>(CHARACTERS[0].id);
  const [p2CharId, setP2CharId] = useState<string>(CHARACTERS[2].id);
  const [hoveredChar, setHoveredChar] = useState<string | null>(null);

  const handleSelect = (charId: string) => {
    audio.playSFX('select');
    if (selectingPlayer === 'P1') {
      setP1CharId(charId);
      if (isPVP) {
        setSelectingPlayer('P2');
      } else {
        // En PvE, P2 (CPU) escoge aleatorio o ya está definido por el modo
        const randomCpu = CHARACTERS[Math.floor(Math.random() * CHARACTERS.length)].id;
        setP2CharId(randomCpu);
        onStartFight({ ...config, p1CharId: charId, p2CharId: randomCpu });
      }
    } else {
      setP2CharId(charId);
      onStartFight({ ...config, p1CharId, p2CharId: charId });
    }
  };

  const p1SelectedChar = CHARACTERS.find(c => c.id === (selectingPlayer === 'P1' && hoveredChar ? hoveredChar : p1CharId));
  const p2SelectedChar = CHARACTERS.find(c => c.id === (selectingPlayer === 'P2' && hoveredChar ? hoveredChar : p2CharId));

  return (
    <div className="flex-1 flex flex-col bg-transparent overflow-hidden relative">
      
      {/* Header */}
      <div className="h-16 flex items-center justify-center border-b-2 border-gray-800 z-10 shrink-0 bg-black/80">
        <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-gray-200 to-gray-500 uppercase tracking-[0.3em]">
          Selecciona un Personaje
        </h2>
      </div>

      {/* Big Portraits Area */}
      <div className="flex-1 flex justify-between relative z-10 overflow-hidden border-b-4 border-gray-800 shrink-0 min-h-[300px]">
        {/* P1 Portrait */}
        <div className={`flex-1 flex flex-col justify-end relative bg-gradient-to-t ${p1SelectedChar?.bgGradient || 'from-gray-900'} to-transparent transition-colors duration-500`}>
          <AnimatePresence mode="wait">
            <motion.img
              key={p1SelectedChar?.id}
              src={p1SelectedChar?.avatars.base}
              alt={p1SelectedChar?.name}
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              className="absolute bottom-0 left-0 h-full w-auto object-cover object-bottom"
            />
          </AnimatePresence>
          <div className="absolute bottom-4 left-4 z-20">
            <div className="text-xl font-bold bg-red-600 text-white px-2 py-1 inline-block border-2 border-white mb-1 shadow-[0_0_10px_red]">1 P</div>
            <h3 className={`text-4xl font-black uppercase ${p1SelectedChar?.arenaText} drop-shadow-[0_2px_2px_rgba(0,0,0,1)] tracking-widest`}>
              {p1SelectedChar?.name}
            </h3>
          </div>
        </div>

        {/* VS / Info center */}
        <div className="w-32 flex flex-col items-center justify-center z-20 bg-black/50 border-x-2 border-gray-800 backdrop-blur-sm">
           <div className="text-4xl font-black italic text-gray-500 mb-4 drop-shadow-[0_2px_2px_black]">VS</div>
           <div className="text-center">
             <div className="text-xs text-gray-400 uppercase tracking-widest font-bold mb-2">Turno de</div>
             <div className={`text-2xl font-black ${selectingPlayer === 'P1' ? 'text-red-500' : 'text-blue-500'} animate-pulse`}>
                {selectingPlayer === 'P1' ? '1 P' : (isPVP ? '2 P' : 'COM')}
             </div>
           </div>
        </div>

        {/* P2 Portrait */}
        <div className={`flex-1 flex flex-col justify-end relative bg-gradient-to-t ${p2SelectedChar?.bgGradient || 'from-gray-900'} to-transparent transition-colors duration-500`}>
           <AnimatePresence mode="wait">
            <motion.img
              key={p2SelectedChar?.id}
              src={p2SelectedChar?.avatars.base}
              alt={p2SelectedChar?.name}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="absolute bottom-0 right-0 h-full w-auto object-cover object-bottom"
              style={{ transform: 'scaleX(-1)' }}
            />
          </AnimatePresence>
          <div className="absolute bottom-4 right-4 z-20 text-right">
            <div className={`text-xl font-bold ${isPVP ? 'bg-blue-600' : 'bg-green-600'} text-white px-2 py-1 inline-block border-2 border-white mb-1 shadow-[0_0_10px_${isPVP ? 'blue' : 'green'}]`}>
              {isPVP ? '2 P' : 'COM'}
            </div>
            <h3 className={`text-4xl font-black uppercase ${p2SelectedChar?.arenaText} drop-shadow-[0_2px_2px_rgba(0,0,0,1)] tracking-widest`}>
              {p2SelectedChar?.name}
            </h3>
          </div>
        </div>
      </div>

      {/* Grid Selection Area */}
      <div className="min-h-[250px] bg-[#09090b] flex flex-col items-center justify-center p-4 z-10 shrink-0 border-t-2 border-gray-800">
         <div className="grid grid-cols-4 md:grid-cols-8 gap-2 sm:gap-4 max-w-5xl w-full">
            {CHARACTERS.map(char => {
               const isP1Selected = p1CharId === char.id;
               const isP2Selected = selectingPlayer === 'P2' && p2CharId === char.id;
               
               return (
                 <button
                   key={char.id}
                   onMouseEnter={() => {
                     setHoveredChar(char.id);
                     audio.playSFX('hover');
                   }}
                   onMouseLeave={() => setHoveredChar(null)}
                   onClick={() => handleSelect(char.id)}
                   className={`relative aspect-square border-4 overflow-hidden transition-transform duration-200 hover:scale-105 hover:z-10 bg-gray-800 ${
                      hoveredChar === char.id ? 'border-yellow-400 shadow-[0_0_15px_yellow]' : 
                      isP1Selected ? 'border-red-500 brightness-50' :
                      isP2Selected ? 'border-blue-500 brightness-50' :
                      'border-gray-600'
                   }`}
                 >
                    <img src={char.avatars.base} alt={char.name} className="absolute inset-0 w-full h-full object-cover object-top" />
                    
                    {/* Indicators */}
                    {isP1Selected && (
                      <div className="absolute inset-0 bg-red-900/50 flex items-center justify-center z-20">
                         <span className="bg-red-600 text-white font-bold px-2 py-1 text-sm border border-white">1 P</span>
                      </div>
                    )}
                    {isP2Selected && (
                      <div className="absolute inset-0 bg-blue-900/50 flex items-center justify-center z-20">
                         <span className="bg-blue-600 text-white font-bold px-2 py-1 text-sm border border-white">{isPVP ? '2 P' : 'COM'}</span>
                      </div>
                    )}
                 </button>
               );
            })}
         </div>

         <div className="mt-8 flex gap-4">
            <button 
              onMouseEnter={() => audio.playSFX('hover')}
              onClick={() => {
                audio.playSFX('select');
                onBack();
              }}
              className="px-6 py-2 border border-white/20 text-white/60 font-bold rounded hover:bg-white/10 transition-colors uppercase tracking-widest text-sm"
            >
              Volver
            </button>
         </div>
      </div>
    </div>
  );
}
