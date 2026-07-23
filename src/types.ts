export type PlayerType = 'P1' | 'P2' | 'CPU';

export type StatusEffectType = 'POISON' | 'REGEN' | 'ARMOR_UP' | 'WEAKNESS' | 'STAMINA_LEAK';

export interface StatusEffect {
  id: string;
  type: StatusEffectType;
  duration: number; // turns remaining
  value?: number; // magnitude of the effect (e.g. poison damage per turn)
}

export interface Player {
  id: PlayerType;
  charId: string;
  name: string;
  hp: number;
  maxHp: number;
  stamina: number;
  maxStamina: number;
  limit: number; // 0 to 100
  isKnockedDown: boolean;
  isAirborne: boolean;
  clashScore: number;
  comboCount: number;
  isExhausted: boolean;
  effects: StatusEffect[];
  avatars: {
    base: string;
    idle: string;
    attack: string;
    hurt: string;
    air: string;
    fall: string;
    cinematicIntro: string;
    cinematicDefeat: string;
    cinematicWin: string;
  };
  color: string;
  bgGradient: string;
  arenaBg: string;
  arenaBorder: string;
  arenaText: string;
}

export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT' | 'NONE' | 'ULTIMATE';
export type ActionButton = string;

export type GamePhase = 
  | 'INIT'
  | 'DIALOGUE'
  | 'NEUTRAL' // Both players can charge
  | 'P1_REACTION' // CPU executed an action, P1 has a window to react
  | 'CPU_REACTION' // P1 executed an action, CPU has a window to react
  | 'P2_REACTION'
  | 'RESOLVING' // Animation/calculation of the turn
  | 'GAME_OVER';

export interface ActionPayload {
  direction: Direction;
  button: ActionButton;
  charge: number; // 0 to 100
  techId: string;
}

export interface CombatLogEntry {
  text: string;
  type: 'info' | 'attack' | 'damage' | 'heal' | 'block' | 'dodge' | 'system' | 'status';
}

export interface TurnState {
  p1Action: ActionPayload | null;
  cpuAction: ActionPayload | null;
}

export interface CinematicState {
  activePlayer: 'P1' | 'CPU' | null;
  event: 'technique_intro' | 'hit' | 'dodge' | 'block' | 'heal' | 'ultimate_intro' | null;
  techniqueName: string | null;
  damage?: number;
}

export interface FloatingText {
  id: string;
  text: string;
  type: 'damage' | 'heal' | 'crit' | 'combo' | 'block' | 'dodge' | 'exhausted' | 'status';
  player: 'P1' | 'CPU';
  xOffset?: number;
  yOffset?: number;
}
