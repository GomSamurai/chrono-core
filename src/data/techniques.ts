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
      { id: 'A', name: 'Guardia Básica', combo: 'Z', cost: 10, effect: { type: 'ARMOR_UP', duration: 1, chance: 0.5 } },
      { id: 'B', name: 'Bloqueo Reforzado', combo: 'X', cost: 15, effect: { type: 'ARMOR_UP', duration: 2, chance: 1.0 } },
      { id: 'X', name: 'Esquiva Estática', combo: 'C', cost: 5 },
      { id: 'Y', name: 'Parada Perfecta', combo: 'V', cost: 20 },
    ],
    UP: [
      { id: 'A', name: 'Salto Evasivo', combo: 'Z', cost: 15 },
      { id: 'B', name: 'Finta Rápida', combo: 'X', cost: 20 },
      { id: 'X', name: 'Evasión Acrobática', combo: 'C', cost: 25 },
      { id: 'Y', name: 'Retirada Táctica', combo: 'V', cost: 20 },
    ],
    RIGHT: [
      { id: 'A', name: 'Corte Rápido', combo: 'Z', cost: 15 },
      { id: 'B', name: 'Combo Demoledor', combo: 'X', cost: 35 },
      { id: 'X', name: 'Golpe Penetrante', combo: 'C', cost: 25 },
      { id: 'Y', name: 'Embestida Frontal', combo: 'V', cost: 30 },
    ],
    DOWN: [
      { id: 'A', name: 'Onda Sísmica', combo: 'Z', cost: 40 },
      { id: 'B', name: 'Estallido de Ki', combo: 'X', cost: 65 },
      { id: 'X', name: 'Furia Dragón', combo: 'C', cost: 85 },
      { id: 'Y', name: 'Colmillo Terrestre', combo: 'V', cost: 55 },
    ],
    LEFT: [
      { id: 'A', name: 'Recuperar Aliento', combo: 'Z', cost: 0 },
      { id: 'B', name: 'Aura Sanadora', combo: 'X', cost: 30, effect: { type: 'REGEN', duration: 2, value: 300, chance: 1.0 } },
      { id: 'X', name: 'Concentración Máxima', combo: 'C', cost: 0 },
      { id: 'Y', name: 'Voluntad de Acero', combo: 'V', cost: 20 },
    ],
    ULTIMATE: [
      { id: 'ULTIMATE', name: 'Corte de Leyenda', combo: 'Q', cost: 0 }
    ]
  },
  valeria: {
    NONE: [
      { id: 'A', name: 'Guardia Firme', combo: 'Z', cost: 10 },
      { id: 'B', name: 'Escudo de Hielo', combo: 'X', cost: 15, effect: { type: 'ARMOR_UP', duration: 2, chance: 0.8 } },
      { id: 'X', name: 'Paso Atrás', combo: 'C', cost: 5 },
      { id: 'Y', name: 'Muro Glacial', combo: 'V', cost: 20 },
    ],
    UP: [
      { id: 'A', name: 'Salto Mortal', combo: 'Z', cost: 15 },
      { id: 'B', name: 'Evasión Congelada', combo: 'X', cost: 25 },
      { id: 'X', name: 'Brisa Veloz', combo: 'C', cost: 20 },
      { id: 'Y', name: 'Vuelo Ligero', combo: 'V', cost: 20 },
    ],
    RIGHT: [
      { id: 'A', name: 'Ráfaga de Puños', combo: 'Z', cost: 15 },
      { id: 'B', name: 'Impacto Trueno', combo: 'X', cost: 35 },
      { id: 'X', name: 'Barrido Ciclón', combo: 'C', cost: 25 },
      { id: 'Y', name: 'Golpe Penetrante', combo: 'V', cost: 30 },
    ],
    DOWN: [
      { id: 'A', name: 'Rayo Celestial', combo: 'Z', cost: 45 },
      { id: 'B', name: 'Tormenta de Plasma', combo: 'X', cost: 70 },
      { id: 'X', name: 'Cero Absoluto', combo: 'C', cost: 90 },
      { id: 'Y', name: 'Explosión Estelar', combo: 'V', cost: 60 },
    ],
    LEFT: [
      { id: 'A', name: 'Meditación', combo: 'Z', cost: 0 },
      { id: 'B', name: 'Luz Restauradora', combo: 'X', cost: 35, effect: { type: 'REGEN', duration: 3, value: 200, chance: 1.0 } },
      { id: 'X', name: 'Manto Prismático', combo: 'C', cost: 25 },
      { id: 'Y', name: 'Canalizar Ki', combo: 'V', cost: 0 },
    ],
    ULTIMATE: [
      { id: 'ULTIMATE', name: 'Cero Absoluto Final', combo: 'Q', cost: 0 }
    ]
  },
  elara: {
    NONE: [
      { id: 'A', name: 'Bloqueo Ágil', combo: 'Z', cost: 10 },
      { id: 'B', name: 'Finta Defensiva', combo: 'X', cost: 5 },
      { id: 'X', name: 'Escudo Holográfico', combo: 'C', cost: 15, effect: { type: 'ARMOR_UP', duration: 2, chance: 1.0 } },
      { id: 'Y', name: 'Esquiva Lateral', combo: 'V', cost: 15 },
    ],
    UP: [
      { id: 'A', name: 'Acrobacia Evasiva', combo: 'Z', cost: 15 },
      { id: 'B', name: 'Salto Binario', combo: 'X', cost: 20 },
      { id: 'X', name: 'Giro Espiral', combo: 'C', cost: 25 },
      { id: 'Y', name: 'Danza de Nubes', combo: 'V', cost: 20 },
    ],
    RIGHT: [
      { id: 'A', name: 'Puñal Relámpago', combo: 'Z', cost: 15 },
      { id: 'B', name: 'Tajo Fantasma', combo: 'X', cost: 35 },
      { id: 'X', name: 'Patada Flash', combo: 'C', cost: 25 },
      { id: 'Y', name: 'Asalto Neón', combo: 'V', cost: 30 },
    ],
    DOWN: [
      { id: 'A', name: 'Holograma Letal', combo: 'Z', cost: 45 },
      { id: 'B', name: 'Cañón Láser', combo: 'X', cost: 65 },
      { id: 'X', name: 'Falla Cibernética', combo: 'C', cost: 85 },
      { id: 'Y', name: 'Sobrecarga de Red', combo: 'V', cost: 55 },
    ],
    LEFT: [
      { id: 'A', name: 'Reinicio de Sistema', combo: 'Z', cost: 0 },
      { id: 'B', name: 'Inyección de Nanobots', combo: 'X', cost: 30, effect: { type: 'REGEN', duration: 2, value: 250, chance: 1.0 } },
      { id: 'X', name: 'Matriz Defensiva', combo: 'C', cost: 20 },
      { id: 'Y', name: 'Overclock', combo: 'V', cost: 0 },
    ],
    ULTIMATE: [
      { id: 'ULTIMATE', name: 'Singularidad Digital', combo: 'Q', cost: 0 }
    ]
  },
  darius: {
    NONE: [
      { id: 'A', name: 'Guardia de Hierro', combo: 'Z', cost: 10, effect: { type: 'ARMOR_UP', duration: 3, chance: 1.0 } },
      { id: 'B', name: 'Piel de Piedra', combo: 'X', cost: 15 },
      { id: 'X', name: 'Paso Pesado', combo: 'C', cost: 5 },
      { id: 'Y', name: 'Resistir Impacto', combo: 'V', cost: 20 },
    ],
    UP: [
      { id: 'A', name: 'Evasión Brusca', combo: 'Z', cost: 20 },
      { id: 'B', name: 'Salto Pesado', combo: 'X', cost: 25 },
      { id: 'X', name: 'Rodar', combo: 'C', cost: 20 },
      { id: 'Y', name: 'Bloqueo en Salto', combo: 'V', cost: 25 },
    ],
    RIGHT: [
      { id: 'A', name: 'Gancho Devastador', combo: 'Z', cost: 20 },
      { id: 'B', name: 'Furia de Titán', combo: 'X', cost: 45 },
      { id: 'X', name: 'Embestida de Toro', combo: 'C', cost: 35 },
      { id: 'Y', name: 'Rompe Huesos', combo: 'V', cost: 40 },
    ],
    DOWN: [
      { id: 'A', name: 'Erupción Volcánica', combo: 'Z', cost: 60 },
      { id: 'B', name: 'Infierno Desatado', combo: 'X', cost: 80 },
      { id: 'X', name: 'Fisura Magmática', combo: 'C', cost: 100 },
      { id: 'Y', name: 'Aniquilación', combo: 'V', cost: 70 },
    ],
    LEFT: [
      { id: 'A', name: 'Ira Contenida', combo: 'Z', cost: 0 },
      { id: 'B', name: 'Regeneración Feroz', combo: 'X', cost: 40, effect: { type: 'REGEN', duration: 2, value: 400, chance: 1.0 } },
      { id: 'X', name: 'Barrera Ígnea', combo: 'C', cost: 30 },
      { id: 'Y', name: 'Respiro Profundo', combo: 'V', cost: 0 },
    ],
    ULTIMATE: [
      { id: 'ULTIMATE', name: 'Cataclismo Volcánico', combo: 'Q', cost: 0 }
    ]
  },
  fisiobriel: {
    NONE: [
      { id: 'A', name: 'Postura Equilibrada', combo: 'Z', cost: 10 },
      { id: 'B', name: 'Guardia Suave', combo: 'X', cost: 15 },
      { id: 'X', name: 'Esquiva Fluida', combo: 'C', cost: 5 },
      { id: 'Y', name: 'Paso Flotante', combo: 'V', cost: 15 },
    ],
    UP: [
      { id: 'A', name: 'Evasión de Grulla', combo: 'Z', cost: 15 },
      { id: 'B', name: 'Salto Ligero', combo: 'X', cost: 20 },
      { id: 'X', name: 'Vuelo Etéreo', combo: 'C', cost: 25 },
      { id: 'Y', name: 'Impulso Chi', combo: 'V', cost: 20 },
    ],
    RIGHT: [
      { id: 'A', name: 'Palma de Taichí', combo: 'Z', cost: 15 },
      { id: 'B', name: 'Toque Nervioso', effect: { type: 'STAMINA_LEAK', duration: 3, value: 20, chance: 0.7 }, combo: 'X', cost: 35 },
      { id: 'X', name: 'Ajuste Cervical', combo: 'C', cost: 45 },
      { id: 'Y', name: 'Empuje Ondulante', combo: 'V', cost: 30 },
    ],
    DOWN: [
      { id: 'A', name: 'Flujo de Qi', combo: 'Z', cost: 45 },
      { id: 'B', name: 'Terapia de Choque', combo: 'X', cost: 55 },
      { id: 'X', name: 'Desbloqueo de Chakras', combo: 'C', cost: 75 },
      { id: 'Y', name: 'Onda Meridiana', combo: 'V', cost: 50 },
    ],
    LEFT: [
      { id: 'A', name: 'Estiramiento', combo: 'Z', cost: 0 },
      { id: 'B', name: 'Masaje Deportivo', combo: 'X', cost: 35, effect: { type: 'REGEN', duration: 2, value: 300, chance: 1.0 } },
      { id: 'X', name: 'Punción Seca', effect: { type: 'WEAKNESS', duration: 2, chance: 0.8 }, combo: 'C', cost: 25 },
      { id: 'Y', name: 'Respiración Profunda', combo: 'V', cost: 0 },
    ],
    ULTIMATE: [
      { id: 'ULTIMATE', name: 'Ajuste Quiropráctico Mortal', combo: 'Q', cost: 0 }
    ]
  },
  mamakathi: {
    NONE: [
      { id: 'A', name: 'Guardia de Abanico', combo: 'Z', cost: 10 },
      { id: 'B', name: 'Bloqueo Maternal', combo: 'X', cost: 15, effect: { type: 'ARMOR_UP', duration: 2, chance: 0.9 } },
      { id: 'X', name: 'Paso Evasivo', combo: 'C', cost: 5 },
      { id: 'Y', name: 'Finta Casera', combo: 'V', cost: 15 },
    ],
    UP: [
      { id: 'A', name: 'Salto Ligero', combo: 'Z', cost: 15 },
      { id: 'B', name: 'Evasión con Abanico', combo: 'X', cost: 20 },
      { id: 'X', name: 'Vuelo de Seda', combo: 'C', cost: 25 },
      { id: 'Y', name: 'Danza Aérea', combo: 'V', cost: 20 },
    ],
    RIGHT: [
      { id: 'A', name: 'Corte de Abanico', combo: 'Z', cost: 15 },
      { id: 'B', name: 'Aguja Punzante', combo: 'X', cost: 30 },
      { id: 'X', name: 'Puntada Letal', combo: 'C', cost: 45 },
      { id: 'Y', name: 'Ráfaga de Viento', combo: 'V', cost: 25 },
    ],
    DOWN: [
      { id: 'A', name: 'Wok Ardiente', combo: 'Z', cost: 55 },
      { id: 'B', name: 'Tornado de Seda', combo: 'X', cost: 65 },
      { id: 'X', name: 'Banquete Picante', combo: 'C', cost: 90 },
      { id: 'Y', name: 'Cuchillo de Chef', combo: 'V', cost: 45 },
    ],
    LEFT: [
      { id: 'A', name: 'Reposo', combo: 'Z', cost: 0 },
      { id: 'B', name: 'Caldo Casero', combo: 'X', cost: 40, effect: { type: 'REGEN', duration: 3, value: 350, chance: 1.0 } },
      { id: 'X', name: 'Zurcido Mágico', combo: 'C', cost: 30 },
      { id: 'Y', name: 'Mirada Materna', combo: 'V', cost: 0 },
    ],
    ULTIMATE: [
      { id: 'ULTIMATE', name: 'Olla a Presión', combo: 'Q', cost: 0 }
    ]
  },
  johnodoctor: {
    NONE: [
      { id: 'A', name: 'Guardia Táctica', combo: 'Z', cost: 10 },
      { id: 'B', name: 'Camuflaje Activo', combo: 'X', cost: 15 },
      { id: 'X', name: 'Rollo Evasivo', combo: 'C', cost: 5 },
      { id: 'Y', name: 'Posición Defensiva', combo: 'V', cost: 15 },
    ],
    UP: [
      { id: 'A', name: 'Salto Táctico', combo: 'Z', cost: 15 },
      { id: 'B', name: 'Evasión Aérea', combo: 'X', cost: 20 },
      { id: 'X', name: 'Impulso Sónico', combo: 'C', cost: 25 },
      { id: 'Y', name: 'Retirada Aérea', combo: 'V', cost: 20 },
    ],
    RIGHT: [
      { id: 'A', name: 'Golpe de Caza', combo: 'Z', cost: 20 },
      { id: 'B', name: 'Embestida Salvaje', combo: 'X', cost: 40 },
      { id: 'X', name: 'Bass Kick', combo: 'C', cost: 45 },
      { id: 'Y', name: 'Codazo Táctico', combo: 'V', cost: 25 },
    ],
    DOWN: [
      { id: 'A', name: 'Drop Rompecuellos', combo: 'Z', cost: 55 },
      { id: 'B', name: 'Trampa Explosiva', combo: 'X', cost: 70 },
      { id: 'X', name: 'Onda Subwoofer', combo: 'C', cost: 95 },
      { id: 'Y', name: 'Mina Terrestre', combo: 'V', cost: 50 },
    ],
    LEFT: [
      { id: 'A', name: 'Escuchar el Entorno', combo: 'Z', cost: 0 },
      { id: 'B', name: 'Botiquín Táctico', combo: 'X', cost: 35, effect: { type: 'REGEN', duration: 2, value: 300, chance: 1.0 } },
      { id: 'X', name: 'Ritmo Trance', combo: 'C', cost: 25 },
      { id: 'Y', name: 'Invisibilidad', combo: 'V', cost: 0 },
    ],
    ULTIMATE: [
      { id: 'ULTIMATE', name: 'Drop de Graves Letal', combo: 'Q', cost: 0 }
    ]
  },
  fransiskitou: {
    NONE: [
      { id: 'A', name: 'Firewall', combo: 'Z', cost: 10, effect: { type: 'ARMOR_UP', duration: 2, chance: 1.0 } },
      { id: 'B', name: 'Escudo de Pixeles', combo: 'X', cost: 15 },
      { id: 'X', name: 'Esquiva Glitch', combo: 'C', cost: 5 },
      { id: 'Y', name: 'Teletransporte Breve', combo: 'V', cost: 15 },
    ],
    UP: [
      { id: 'A', name: 'Salto Binario', combo: 'Z', cost: 15 },
      { id: 'B', name: 'Hover Magnético', combo: 'X', cost: 20 },
      { id: 'X', name: 'Evasión Algorítmica', combo: 'C', cost: 25 },
      { id: 'Y', name: 'Vuelo Digital', combo: 'V', cost: 20 },
    ],
    RIGHT: [
      { id: 'A', name: 'Golpe Binario', combo: 'Z', cost: 15 },
      { id: 'B', name: 'Combo Algorítmico', combo: 'X', cost: 35 },
      { id: 'X', name: 'Inyección SQL', effect: { type: 'POISON', duration: 3, value: 300, chance: 1.0 }, combo: 'C', cost: 50 },
      { id: 'Y', name: 'Golpe Digital', combo: 'V', cost: 25 },
    ],
    DOWN: [
      { id: 'A', name: 'Sobrecarga de Servidor', combo: 'Z', cost: 50 },
      { id: 'B', name: 'Láser de Datos', combo: 'X', cost: 70 },
      { id: 'X', name: 'Borrado de Memoria', combo: 'C', cost: 100 },
      { id: 'Y', name: 'Descarga Orbital', combo: 'V', cost: 60 },
    ],
    LEFT: [
      { id: 'A', name: 'Modo Ahorro', combo: 'Z', cost: 0 },
      { id: 'B', name: 'Restaurar Copia', combo: 'X', cost: 45, effect: { type: 'REGEN', duration: 2, value: 400, chance: 1.0 } },
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
