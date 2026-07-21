import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { audio } from '../utils/audio';

interface Props {
  onStartGame: (mode: string) => void;
}

export function MainMenu({ onStartGame }: Props) {
  const menuOptions = [
    { id: 'arcade', label: 'Arcade', desc: 'Enfréntate a una serie de oponentes.' },
    { id: 'versus', label: 'Versus', desc: 'Juega contra la IA o un Jugador 2.' },
    { id: 'training', label: 'Entrenamiento', desc: 'Practica tus técnicas libremente.' },
    { id: 'manual', label: 'Manual', desc: 'Aprende cómo jugar y las reglas de combate.' }
  ];

  const [showManual, setShowManual] = useState(false);

  const playHover = () => audio.playSFX('hover');
  const playSelect = (mode: string) => {
    audio.playSFX('select');
    if (mode === 'manual') {
      setShowManual(true);
    } else {
      onStartGame(mode);
    }
  };

  return (
    <div className="flex-1 bg-transparent relative overflow-hidden flex flex-col items-center justify-center w-full h-full">

      <motion.div 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="z-10 flex flex-col items-center mb-16"
      >
        <h1 className="text-5xl sm:text-7xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-red-500 via-white to-orange-500 drop-shadow-[0_0_20px_rgba(239,68,68,0.3)]">
          CHRONO CORE
        </h1>
        <h2 className="text-sm sm:text-base font-bold tracking-[0.8em] text-red-400 mt-2 opacity-80 uppercase">
          ASTRAL CLASH
        </h2>
      </motion.div>

      <div className="z-10 w-full max-w-sm flex flex-col gap-4 px-6">
        {menuOptions.map((opt, i) => (
          <motion.button
            key={opt.id}
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            whileHover={{ scale: 1.02, x: 10 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => playSelect(opt.id)}
            onMouseEnter={playHover}
            className="group relative w-full bg-black/40 border border-white/5 p-4 flex flex-col items-start justify-center overflow-hidden hover:border-red-500/50 hover:bg-red-950/20 transition-all rounded"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-red-600/10 to-transparent translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-300 ease-out"></div>
            <span className="relative z-10 text-xl font-black uppercase tracking-widest text-white/90 group-hover:text-red-400 transition-colors">
              {opt.label}
            </span>
            <span className="relative z-10 text-[10px] text-gray-500 font-mono mt-1 group-hover:text-red-300/70 transition-colors">
              {opt.desc}
            </span>
          </motion.button>
        ))}
      </div>
      
      {showManual && (
        <div className="absolute inset-0 z-50 bg-black/90 backdrop-blur-sm flex flex-col items-center justify-center p-4">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-2xl bg-[#09090b] border-2 border-red-900 rounded-xl p-6 shadow-[0_0_50px_rgba(239,68,68,0.2)] overflow-y-auto max-h-[80vh] custom-scrollbar"
          >
            <h2 className="text-3xl font-black italic text-red-500 mb-6 uppercase tracking-widest border-b border-red-900/50 pb-2">Manual de Combate</h2>
            
            <div className="space-y-6 text-sm text-gray-300">
              <section>
                <h3 className="text-xl font-bold text-white mb-2">Controles Básicos</h3>
                <p>Usa la cruceta o el D-PAD para elegir una <strong>Dirección (UP, DOWN, LEFT, RIGHT)</strong> mientras mantienes presionado. Luego, pulsa un botón de Acción <strong>(A, B, X, Y)</strong> para ejecutar la técnica correspondiente de esa dirección.</p>
                <p className="mt-2 font-mono text-xs text-gray-500">Teclado P1: Manten AWSD + Z, X, C, V | Teclado P2: Manten Flechas + O, P, [, ]</p>
              </section>

              <section>
                <h3 className="text-xl font-bold text-white mb-2">Combos y Estamina</h3>
                <p>Si aciertas ataques seguidos sumarás <strong>Combos</strong>, lo que multiplicará tu daño. Pero ten cuidado: cada habilidad consume <strong>Estamina (ST)</strong>. Si te quedas sin ST, no podrás atacar. Para recuperar estamina, usa bloqueos (sin mantener dirección) o habilidades sanadoras (LEFT + Acción).</p>
              </section>

              <section>
                <h3 className="text-xl font-bold text-white mb-2">Limit Break (Ultimate)</h3>
                <p>Al recibir daño y golpear al rival, tu barra de <strong>LIMIT</strong> se llenará. Al llegar al 100%, el centro de tu cruceta destellará indicando "ULT". Manten pulsado ese botón (tecla <strong>Q</strong> para P1, o <strong>0</strong> para P2) y pulsa cualquier ataque para desatar tu TÉCNICA DEFINITIVA inbloqueable.</p>
              </section>

              <section>
                <h3 className="text-xl font-bold text-white mb-2">Estados Alterados</h3>
                <p>Algunas habilidades infligen magia o trampas al rival o a ti mismo:</p>
                <ul className="list-disc pl-5 mt-2 space-y-1 text-gray-400">
                  <li><strong className="text-purple-400">VENENO:</strong> Pierdes vida al final del turno.</li>
                  <li><strong className="text-green-400">REGEN:</strong> Recuperas vida al final del turno.</li>
                  <li><strong className="text-blue-400">ARMADURA (ARMOR_UP):</strong> Mitiga un gran porcentaje de daño entrante.</li>
                </ul>
              </section>
            </div>

            <button 
              onClick={() => setShowManual(false)}
              className="mt-8 w-full py-3 bg-red-900/50 hover:bg-red-800 border border-red-500 text-white font-bold rounded-lg transition-colors uppercase tracking-[0.2em]"
            >
              Cerrar Manual
            </button>
          </motion.div>
        </div>
      )}

      {/* Version/Footer Info */}
      <div className="absolute bottom-4 right-6 z-10 text-[10px] text-gray-600 font-mono text-right flex flex-col items-end">
        <span className="text-red-900 font-bold mb-1">■ ■ ■</span>
        VER 1.0.0<br/>
        SYSTEM READY
      </div>
    </div>
  );
}
