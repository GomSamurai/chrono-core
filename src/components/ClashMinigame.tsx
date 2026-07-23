import React from 'react';
import { motion } from 'framer-motion';
import { Player } from '../types';

interface Props {
  p1: Player;
  cpu: Player;
  p1Score: number;
  cpuScore: number;
  timeLeft: number;
}

export function ClashMinigame({ p1, cpu, p1Score, cpuScore, timeLeft }: Props) {
  const totalScore = p1Score + cpuScore;
  const p1Percentage = totalScore === 0 ? 50 : (p1Score / totalScore) * 100;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.2 }}
      className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm p-4"
    >
      <motion.div
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ repeat: Infinity, duration: 0.5 }}
        className="text-6xl sm:text-8xl font-black text-white italic drop-shadow-[0_0_20px_red] mb-8"
      >
        ¡CHOQUE DE PODER!
      </motion.div>

      <div className="w-full max-w-4xl flex items-center gap-4">
        <div className="w-24 h-24 rounded-full border-4 border-blue-500 overflow-hidden shrink-0">
          <img src={p1.avatars.idle} className="w-full h-full object-cover object-top" />
        </div>

        <div className="flex-1 h-12 bg-gray-900 rounded-full overflow-hidden border-2 border-white/20 relative shadow-[0_0_30px_rgba(255,0,0,0.5)]">
          <motion.div 
            className="absolute top-0 bottom-0 left-0 bg-blue-500"
            animate={{ width: `${p1Percentage}%` }}
            transition={{ type: 'spring', bounce: 0.2, duration: 0.3 }}
          />
          <motion.div 
            className="absolute top-0 bottom-0 right-0 bg-red-500"
            animate={{ width: `${100 - p1Percentage}%` }}
            transition={{ type: 'spring', bounce: 0.2, duration: 0.3 }}
          />
          
          <div 
             className="absolute top-0 bottom-0 w-2 bg-white -ml-1 shadow-[0_0_10px_white]"
             style={{ left: `${p1Percentage}%`, transition: 'left 0.3s ease-out' }}
          />
        </div>

        <div className="w-24 h-24 rounded-full border-4 border-red-500 overflow-hidden shrink-0">
          <img src={cpu.avatars.idle} className="w-full h-full object-cover object-top" style={{ transform: 'scaleX(-1)' }} />
        </div>
      </div>

      <div className="mt-8 text-3xl text-white font-bold animate-pulse">
        ¡PULSA RÁPIDO EL BOTÓN DE ATAQUE!
      </div>
      
      <div className="mt-4 text-5xl font-black text-yellow-400">
        {Math.ceil(timeLeft / 1000)}s
      </div>
    </motion.div>
  );
}
