export interface StorySegment {
  text: string;
  options?: string[];
  locationDescription: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
  image?: string;
  isSystem?: boolean;
}

export enum GameState {
  INTRO = 'INTRO',
  PLAYING = 'PLAYING',
  LOADING = 'LOADING',
  ERROR = 'ERROR',
  GAMEOVER = 'GAMEOVER'
}

export interface PlayerStats {
  health: number;
  maxHealth: number;
  stability: number; // Mental/Time sanity
  maxStability: number;
  fragments: number; // Currency/XP
  level: number;
}

export interface GameAction {
  label: string;
  type: 'combat' | 'exploration' | 'diplomacy' | 'neutral';
}

export interface GameResponse {
  narrative: string;
  sceneDescription: string;
  suggestedActions: GameAction[];
  statUpdates?: {
    healthChange?: number;
    stabilityChange?: number;
    fragmentsChange?: number;
    levelChange?: number;
  };
  inventoryUpdates?: {
    add?: string[];
    remove?: string[];
  };
  gameOver?: boolean;
}
