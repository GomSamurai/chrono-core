import { Direction, StatusEffectType } from '../types';

export interface TechniqueDef {
  id: string;
  name: string;
  combo: string;
  cost: number;
  effect?: { type: StatusEffectType, duration: number, value?: number, chance: number };
}

export type CharTechniques = Record<Direction, TechniqueDef[]>;

export const CHAR_TECHNIQUES_DB: Record<string, CharTechniques> = {
  kaelen: {
    NONE: [
      { id: 'A', name: 'Guardia Básica', combo: 'Z', cost: 10 },
      { id: 'B', name: 'Puñetazo Ligero', combo: 'X', cost: 5 },
      { id: 'X', name: 'Provocación', combo: 'C', cost: 0 },
      { id: 'Y', name: 'Esquiva Estática', combo: 'V', cost: 15 },
    ],
    UP: [
      { id: 'A', name: 'Salto Evasivo', combo: 'Z', cost: 15 },
      { id: 'B', name: 'Tajo Aéreo', combo: 'X', cost: 25 },
      { id: 'X', name: 'Caída de Halcón', combo: 'C', cost: 35 },
      { id: 'Y', name: 'Doble Salto', combo: 'V', cost: 20 },
    ],
    RIGHT: [
      { id: 'A', name: 'Corte Rápido', combo: 'Z', cost: 10 },
      { id: 'B', name: 'Combo Demoledor', combo: 'X', cost: 30 },
      { id: 'X', name: 'Patada Giratoria', combo: 'C', cost: 20 },
      { id: 'Y', name: 'Embestida Frontal', combo: 'V', cost: 25 },
    ],
    DOWN: [
      { id: 'A', name: 'Onda Sísmica', combo: 'Z', cost: 40 },
      { id: 'B', name: 'Estallido de Ki', combo: 'X', cost: 60 },
      { id: 'X', name: 'Furia Dragón', combo: 'C', cost: 80 },
      { id: 'Y', name: 'Colmillo Terrestre', combo: 'V', cost: 50 },
    ],
    LEFT: [
      { id: 'A', name: 'Recuperar Aliento', combo: 'Z', cost: 0 },
      { id: 'B', name: 'Aura Sanadora', combo: 'X', cost: 30, effect: { type: 'REGEN', duration: 2, value: 100, chance: 1.0 } },
      { id: 'X', name: 'Escudo Espiritual', combo: 'C', cost: 20, effect: { type: 'ARMOR_UP', duration: 2, chance: 1.0 } },
      { id: 'Y', name: 'Concentración Máxima', combo: 'V', cost: 0 },
    ],
    ULTIMATE: [
      { id: 'ULTIMATE', name: 'Corte de Leyenda', combo: 'Q', cost: 0 }
    ]
  },
  valeria: {
    NONE: [
      { id: 'A', name: 'Guardia Firme', combo: 'Z', cost: 10 },
      { id: 'B', name: 'Golpe Directo', combo: 'X', cost: 5 },
      { id: 'X', name: 'Mirada Intimidante', combo: 'C', cost: 0 },
      { id: 'Y', name: 'Paso Atrás', combo: 'V', cost: 15 },
    ],
    UP: [
      { id: 'A', name: 'Salto Mortal', combo: 'Z', cost: 15 },
      { id: 'B', name: 'Patada Creciente', combo: 'X', cost: 25 },
      { id: 'X', name: 'Torbellino Aéreo', combo: 'C', cost: 35 },
      { id: 'Y', name: 'Vuelo Ligero', combo: 'V', cost: 20 },
    ],
    RIGHT: [
      { id: 'A', name: 'Ráfaga de Puños', combo: 'Z', cost: 10 },
      { id: 'B', name: 'Impacto Trueno', combo: 'X', cost: 30 },
      { id: 'X', name: 'Barrido Ciclón', combo: 'C', cost: 20 },
      { id: 'Y', name: 'Golpe Penetrante', combo: 'V', cost: 25 },
    ],
    DOWN: [
      { id: 'A', name: 'Rayo Celestial', combo: 'Z', cost: 45 },
      { id: 'B', name: 'Tormenta de Plasma', combo: 'X', cost: 65 },
      { id: 'X', name: 'Cero Absoluto', combo: 'C', cost: 85 },
      { id: 'Y', name: 'Explosión Estelar', combo: 'V', cost: 55 },
    ],
    LEFT: [
      { id: 'A', name: 'Meditación', combo: 'Z', cost: 0 },
      { id: 'B', name: 'Luz Restauradora', combo: 'X', cost: 35 },
      { id: 'X', name: 'Manto Prismático', effect: { type: 'ARMOR_UP', duration: 2, chance: 1.0 }, combo: 'C', cost: 25 },
      { id: 'Y', name: 'Canalizar Ki', combo: 'V', cost: 0 },
    ],
    ULTIMATE: [
      { id: 'ULTIMATE', name: 'Cero Absoluto Final', combo: 'Q', cost: 0 }
    ]
  },
  elara: {
    NONE: [
      { id: 'A', name: 'Bloqueo Ágil', combo: 'Z', cost: 10 },
      { id: 'B', name: 'Punzón', combo: 'X', cost: 5 },
      { id: 'X', name: 'Gesto Burlón', combo: 'C', cost: 0 },
      { id: 'Y', name: 'Finta', combo: 'V', cost: 15 },
    ],
    UP: [
      { id: 'A', name: 'Acrobacia', combo: 'Z', cost: 15 },
      { id: 'B', name: 'Corte Viento', combo: 'X', cost: 25 },
      { id: 'X', name: 'Giro Espiral', combo: 'C', cost: 35 },
      { id: 'Y', name: 'Danza de Nubes', combo: 'V', cost: 20 },
    ],
    RIGHT: [
      { id: 'A', name: 'Puñal Relámpago', combo: 'Z', cost: 10 },
      { id: 'B', name: 'Tajo Fantasma', combo: 'X', cost: 30 },
      { id: 'X', name: 'Patada Flash', combo: 'C', cost: 20 },
      { id: 'Y', name: 'Asalto Neón', combo: 'V', cost: 25 },
    ],
    DOWN: [
      { id: 'A', name: 'Holograma Letal', combo: 'Z', cost: 40 },
      { id: 'B', name: 'Cañón Láser', combo: 'X', cost: 60 },
      { id: 'X', name: 'Falla Cibernética', combo: 'C', cost: 80 },
      { id: 'Y', name: 'Sobrecarga de Red', combo: 'V', cost: 50 },
    ],
    LEFT: [
      { id: 'A', name: 'Reinicio de Sistema', combo: 'Z', cost: 0 },
      { id: 'B', name: 'Inyección de Nanobots', combo: 'X', cost: 30 },
      { id: 'X', name: 'Matriz Defensiva', combo: 'C', cost: 20 },
      { id: 'Y', name: 'Overclock', combo: 'V', cost: 0 },
    ],
    ULTIMATE: [
      { id: 'ULTIMATE', name: 'Singularidad Digital', combo: 'Q', cost: 0 }
    ]
  },
  darius: {
    NONE: [
      { id: 'A', name: 'Guardia de Hierro', combo: 'Z', cost: 10 },
      { id: 'B', name: 'Garfio', combo: 'X', cost: 5 },
      { id: 'X', name: 'Rugido', combo: 'C', cost: 0 },
      { id: 'Y', name: 'Resistir', combo: 'V', cost: 15 },
    ],
    UP: [
      { id: 'A', name: 'Salto Pesado', combo: 'Z', cost: 20 },
      { id: 'B', name: 'Caída Meteórica', combo: 'X', cost: 35 },
      { id: 'X', name: 'Rompecráneos', combo: 'C', cost: 45 },
      { id: 'Y', name: 'Propulsión Brutal', combo: 'V', cost: 25 },
    ],
    RIGHT: [
      { id: 'A', name: 'Gancho Devastador', combo: 'Z', cost: 15 },
      { id: 'B', name: 'Furia de Titán', combo: 'X', cost: 40 },
      { id: 'X', name: 'Embestida de Toro', combo: 'C', cost: 30 },
      { id: 'Y', name: 'Rompe Huesos', combo: 'V', cost: 35 },
    ],
    DOWN: [
      { id: 'A', name: 'Erupción Volcánica', combo: 'Z', cost: 55 },
      { id: 'B', name: 'Infierno Desatado', combo: 'X', cost: 75 },
      { id: 'X', name: 'Fisura Magmática', combo: 'C', cost: 95 },
      { id: 'Y', name: 'Aniquilación', combo: 'V', cost: 65 },
    ],
    LEFT: [
      { id: 'A', name: 'Piel de Piedra', effect: { type: 'ARMOR_UP', duration: 2, chance: 1.0 }, combo: 'Z', cost: 0 },
      { id: 'B', name: 'Regeneración Feroz', combo: 'X', cost: 40 },
      { id: 'X', name: 'Barrera Ígnea', combo: 'C', cost: 30 },
      { id: 'Y', name: 'Ira Contenida', combo: 'V', cost: 0 },
    ],
    ULTIMATE: [
      { id: 'ULTIMATE', name: 'Terremoto Cataclísmico', combo: 'Q', cost: 0 }
    ]
  },
  fisiobriel: {
    NONE: [
      { id: 'A', name: 'Postura Equilibrada', combo: 'Z', cost: 10 },
      { id: 'B', name: 'Palma Suave', combo: 'X', cost: 5 },
      { id: 'X', name: 'Respiración Profunda', combo: 'C', cost: 0 },
      { id: 'Y', name: 'Paso Flotante', combo: 'V', cost: 15 },
    ],
    UP: [
      { id: 'A', name: 'Salto de Grulla', combo: 'Z', cost: 15 },
      { id: 'B', name: 'Patada Loto', combo: 'X', cost: 25 },
      { id: 'X', name: 'Descenso en Espiral', combo: 'C', cost: 35 },
      { id: 'Y', name: 'Impulso Chi', combo: 'V', cost: 20 },
    ],
    RIGHT: [
      { id: 'A', name: 'Palma de Taichí', combo: 'Z', cost: 10 },
      { id: 'B', name: 'Toque Nervioso', effect: { type: 'STAMINA_LEAK', duration: 3, value: 20, chance: 0.7 }, combo: 'X', cost: 30 },
      { id: 'X', name: 'Ajuste Cervical', combo: 'C', cost: 40 },
      { id: 'Y', name: 'Empuje Ondulante', combo: 'V', cost: 25 },
    ],
    DOWN: [
      { id: 'A', name: 'Flujo de Qi', combo: 'Z', cost: 40 },
      { id: 'B', name: 'Terapia de Choque', combo: 'X', cost: 50 },
      { id: 'X', name: 'Desbloqueo de Chakras', combo: 'C', cost: 70 },
      { id: 'Y', name: 'Onda Meridiana', combo: 'V', cost: 45 },
    ],
    LEFT: [
      { id: 'A', name: 'Estiramiento', combo: 'Z', cost: 0 },
      { id: 'B', name: 'Masaje Deportivo', combo: 'X', cost: 35 },
      { id: 'X', name: 'Punción Seca', effect: { type: 'WEAKNESS', duration: 2, chance: 0.8 }, combo: 'C', cost: 25 },
      { id: 'Y', name: 'Rehabilitación', combo: 'V', cost: 0 },
    ],
    ULTIMATE: [
      { id: 'ULTIMATE', name: 'Ajuste Quiropráctico Mortal', combo: 'Q', cost: 0 }
    ]
  },
  mamakathi: {
    NONE: [
      { id: 'A', name: 'Guardia de Abanico', combo: 'Z', cost: 10 },
      { id: 'B', name: 'Toque de Aguja', combo: 'X', cost: 5 },
      { id: 'X', name: 'Mirada Materna', combo: 'C', cost: 0 },
      { id: 'Y', name: 'Finta Casera', combo: 'V', cost: 15 },
    ],
    UP: [
      { id: 'A', name: 'Salto Ligero', combo: 'Z', cost: 15 },
      { id: 'B', name: 'Tajo Volador', combo: 'X', cost: 25 },
      { id: 'X', name: 'Danza de Seda', combo: 'C', cost: 35 },
      { id: 'Y', name: 'Vuelo de Abanico', combo: 'V', cost: 20 },
    ],
    RIGHT: [
      { id: 'A', name: 'Corte de Abanico', combo: 'Z', cost: 15 },
      { id: 'B', name: 'Aguja Punzante', combo: 'X', cost: 25 },
      { id: 'X', name: 'Puntada Letal', combo: 'C', cost: 45 },
      { id: 'Y', name: 'Ráfaga de Viento', combo: 'V', cost: 20 },
    ],
    DOWN: [
      { id: 'A', name: 'Wok Ardiente', combo: 'Z', cost: 50 },
      { id: 'B', name: 'Tornado de Seda', combo: 'X', cost: 60 },
      { id: 'X', name: 'Banquete Picante', combo: 'C', cost: 85 },
      { id: 'Y', name: 'Cuchillo de Chef', combo: 'V', cost: 40 },
    ],
    LEFT: [
      { id: 'A', name: 'Coser Heridas', combo: 'Z', cost: 0 },
      { id: 'B', name: 'Caldo Casero', combo: 'X', cost: 40 },
      { id: 'X', name: 'Zurcido Mágico', combo: 'C', cost: 30 },
      { id: 'Y', name: 'Reposo', combo: 'V', cost: 0 },
    ],
    ULTIMATE: [
      { id: 'ULTIMATE', name: 'Olla a Presión', combo: 'Q', cost: 0 }
    ]
  },
  johnodoctor: {
    NONE: [
      { id: 'A', name: 'Camuflaje Activo', combo: 'Z', cost: 10 },
      { id: 'B', name: 'Codazo Táctico', combo: 'X', cost: 5 },
      { id: 'X', name: 'Ajuste de Graves', combo: 'C', cost: 0 },
      { id: 'Y', name: 'Rollo Evasivo', combo: 'V', cost: 15 },
    ],
    UP: [
      { id: 'A', name: 'Salto Táctico', combo: 'Z', cost: 15 },
      { id: 'B', name: 'Golpe Aéreo', combo: 'X', cost: 25 },
      { id: 'X', name: 'Ataque Halcón', combo: 'C', cost: 35 },
      { id: 'Y', name: 'Impulso Sónico', combo: 'V', cost: 20 },
    ],
    RIGHT: [
      { id: 'A', name: 'Golpe de Caza', combo: 'Z', cost: 15 },
      { id: 'B', name: 'Embestida Salvaje', combo: 'X', cost: 35 },
      { id: 'X', name: 'Bass Kick', combo: 'C', cost: 40 },
      { id: 'Y', name: 'Tajo Oculto', combo: 'V', cost: 25 },
    ],
    DOWN: [
      { id: 'A', name: 'Drop Rompecuellos', combo: 'Z', cost: 50 },
      { id: 'B', name: 'Trampa Explosiva', combo: 'X', cost: 65 },
      { id: 'X', name: 'Onda Subwoofer', combo: 'C', cost: 90 },
      { id: 'Y', name: 'Mina Terrestre', combo: 'V', cost: 45 },
    ],
    LEFT: [
      { id: 'A', name: 'Invisibilidad', combo: 'Z', cost: 0 },
      { id: 'B', name: 'Botiquín Táctico', combo: 'X', cost: 35 },
      { id: 'X', name: 'Ritmo Trance', combo: 'C', cost: 25 },
      { id: 'Y', name: 'Escuchar el Entorno', combo: 'V', cost: 0 },
    ],
    ULTIMATE: [
      { id: 'ULTIMATE', name: 'Drop de Graves Letal', combo: 'Q', cost: 0 }
    ]
  },
  fransiskitou: {
    NONE: [
      { id: 'A', name: 'Firewall', combo: 'Z', cost: 10 },
      { id: 'B', name: 'Golpe Digital', combo: 'X', cost: 5 },
      { id: 'X', name: 'Análisis de Patrones', combo: 'C', cost: 0 },
      { id: 'Y', name: 'Teletransporte Glitch', combo: 'V', cost: 15 },
    ],
    UP: [
      { id: 'A', name: 'Salto Binario', combo: 'Z', cost: 15 },
      { id: 'B', name: 'Caída de Sistema', combo: 'X', cost: 25 },
      { id: 'X', name: 'Descarga Orbital', combo: 'C', cost: 45 },
      { id: 'Y', name: 'Hover Magnético', combo: 'V', cost: 20 },
    ],
    RIGHT: [
      { id: 'A', name: 'Golpe Binario', combo: 'Z', cost: 15 },
      { id: 'B', name: 'Combo Algorítmico', combo: 'X', cost: 35 },
      { id: 'X', name: 'Inyección SQL', effect: { type: 'POISON', duration: 3, value: 150, chance: 1.0 }, combo: 'C', cost: 50 },
      { id: 'Y', name: 'Ráfaga de Pixeles', combo: 'V', cost: 25 },
    ],
    DOWN: [
      { id: 'A', name: 'Sobrecarga de Servidor', combo: 'Z', cost: 45 },
      { id: 'B', name: 'Láser de Datos', combo: 'X', cost: 65 },
      { id: 'X', name: 'Borrado de Memoria', combo: 'C', cost: 95 },
      { id: 'Y', name: 'Red Neuronal', combo: 'V', cost: 55 },
    ],
    LEFT: [
      { id: 'A', name: 'Modo Ahorro', combo: 'Z', cost: 0 },
      { id: 'B', name: 'Restaurar Copia', combo: 'X', cost: 45 },
      { id: 'X', name: 'Desfragmentación', combo: 'C', cost: 30 },
      { id: 'Y', name: 'Calibración', combo: 'V', cost: 0 },
    ],
    ULTIMATE: [
      { id: 'ULTIMATE', name: 'RM -RF /*', combo: 'Q', cost: 0 }
    ]
  }
};

export function getTechnique(charId: string, dir: Direction, button: string): TechniqueDef | undefined {
  const db = CHAR_TECHNIQUES_DB[charId];
  if (!db) return undefined;
  return db[dir]?.find(t => t.id === button);
}

// Temporary backwards compatibility while migrating components
export const TECHNIQUES_DB = CHAR_TECHNIQUES_DB['kaelen'];
