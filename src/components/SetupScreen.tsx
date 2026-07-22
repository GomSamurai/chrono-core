import React, { useState } from 'react';
import { GameConfig, Difficulty } from '../App';
import { audio } from '../utils/audio';

interface Props {
  config: GameConfig;
  onStart: (config: GameConfig) => void;
  onBack: () => void;
}

export function SetupScreen({ config, onStart, onBack }: Props) {
  const [p1Input, setP1Input] = useState(config.p1Input);
  const [p2Input, setP2Input] = useState(config.p2Input);
  const [difficulty, setDifficulty] = useState<Difficulty>(config.difficulty || 'NORMAL');
  const [timer, setTimer] = useState<number>(config.timer || 60);

  const playHover = () => audio.playSFX('hover');
  const handleSelect = (setter: any, val: any) => {
    audio.playSFX('select');
    setter(val);
  };
  const handleBtnClick = (action: () => void) => {
    audio.playSFX('select');
    action();
  };

  const inputOptions = [
    { id: 'keyboard', label: 'Teclado' },
    { id: 'gamepad_0', label: 'Mando 1' },
    { id: 'gamepad_1', label: 'Mando 2' },
  ];

  const p2Options = config.mode === 'versus'
    ? [{ id: 'cpu', label: 'IA (CPU)' }, ...inputOptions]
    : [{ id: 'cpu', label: 'IA (CPU)' }];

  const diffOptions: { id: Difficulty, label: string, color: string }[] = [
    { id: 'EASY', label: 'Fácil', color: 'green' },
    { id: 'NORMAL', label: 'Normal', color: 'yellow' },
    { id: 'HARD', label: 'Difícil', color: 'red' },
  ];

  const timerOptions = [
    { id: 30, label: '30s' },
    { id: 60, label: '60s' },
    { id: 90, label: '90s' },
    { id: 999, label: 'Infinito' },
  ];

  return (
    <div className="flex-1 flex flex-col justify-center items-center overflow-y-auto w-full px-4">
      <h2 className="text-3xl font-black uppercase text-blue-400 mb-8 tracking-widest mt-8">
        Configuración ({config.mode})
      </h2>

      <div className="flex gap-8 mb-8 w-full max-w-2xl justify-center flex-wrap sm:flex-nowrap">
        <div className="flex-1 flex flex-col items-center p-6 border-2 border-blue-900/50 bg-blue-900/10 rounded-xl w-full">
          <h3 className="text-xl font-bold mb-4 text-blue-300">Jugador 1</h3>
          <div className="flex flex-col gap-2 w-full">
            {inputOptions.map(opt => (
              <button
                key={opt.id}
                onMouseEnter={playHover}
                onClick={() => handleSelect(setP1Input, opt.id)}
                className={`py-2 px-4 rounded border font-bold transition-colors ${
                  p1Input === opt.id 
                    ? 'bg-blue-600 border-blue-400 text-white' 
                    : 'bg-black/50 border-white/10 text-white/50 hover:bg-white/5'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 flex flex-col items-center p-6 border-2 border-red-900/50 bg-red-900/10 rounded-xl w-full">
          <h3 className="text-xl font-bold mb-4 text-red-300">Jugador 2</h3>
          <div className="flex flex-col gap-2 w-full">
            {p2Options.map(opt => (
              <button
                key={opt.id}
                onMouseEnter={playHover}
                onClick={() => handleSelect(setP2Input, opt.id)}
                className={`py-2 px-4 rounded border font-bold transition-colors ${
                  p2Input === opt.id 
                    ? 'bg-red-600 border-red-400 text-white' 
                    : 'bg-black/50 border-white/10 text-white/50 hover:bg-white/5'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {p2Input === 'cpu' && (
        <div className="flex flex-col items-center mb-12 p-6 border-2 border-purple-900/50 bg-purple-900/10 rounded-xl w-full max-w-2xl">
           <h3 className="text-xl font-bold mb-4 text-purple-300">Dificultad de la IA</h3>
           <div className="flex gap-4 w-full flex-wrap sm:flex-nowrap">
             {diffOptions.map(opt => (
               <button
                 key={opt.id}
                 onMouseEnter={playHover}
                 onClick={() => handleSelect(setDifficulty, opt.id)}
                 className={`flex-1 py-2 px-4 rounded border font-bold transition-colors ${
                   difficulty === opt.id 
                     ? (opt.color === 'green' ? 'bg-green-600 border-green-400 text-white shadow-[0_0_15px_green]' :
                        opt.color === 'yellow' ? 'bg-yellow-600 border-yellow-400 text-white shadow-[0_0_15px_yellow]' :
                        'bg-red-600 border-red-400 text-white shadow-[0_0_15px_red]')
                     : 'bg-black/50 border-white/10 text-white/50 hover:bg-white/5'
                 }`}
               >
                 {opt.label}
               </button>
             ))}
           </div>
        </div>
      )}

      <div className="flex flex-col items-center mb-12 p-6 border-2 border-cyan-900/50 bg-cyan-900/10 rounded-xl w-full max-w-2xl">
        <h3 className="text-xl font-bold mb-4 text-cyan-300">Tiempo de Combate</h3>
        <div className="flex gap-4 w-full flex-wrap sm:flex-nowrap">
          {timerOptions.map(opt => (
            <button
              key={opt.id}
              onMouseEnter={playHover}
              onClick={() => handleSelect(setTimer, opt.id)}
              className={`flex-1 py-2 px-4 rounded border font-bold transition-colors ${
                timer === opt.id 
                  ? 'bg-cyan-600 border-cyan-400 text-white shadow-[0_0_15px_cyan]' 
                  : 'bg-black/50 border-white/10 text-white/50 hover:bg-white/5'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-4 mb-8">
        <button 
          onMouseEnter={playHover}
          onClick={() => handleBtnClick(onBack)}
          className="px-8 py-3 bg-gray-900 border border-gray-500 text-white font-black rounded hover:bg-gray-700 transition-colors uppercase tracking-[0.2em]"
        >
          Volver
        </button>
        <button 
          onMouseEnter={playHover}
          onClick={() => handleBtnClick(() => onStart({ ...config, p1Input, p2Input, difficulty, timer }))}
          className="px-8 py-3 bg-blue-900 border border-blue-500 text-white font-black rounded hover:bg-blue-700 transition-colors uppercase tracking-[0.2em]"
        >
          Siguiente
        </button>
      </div>
    </div>
  );
}
