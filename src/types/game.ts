
export interface Player {
  id: string;
  name: string;
  code: string;
  isAlive: boolean;
  targetId?: string;
  lastAction?: Date;
  pendingKillConfirmation?: {
    killerId: string;
    timestamp: Date;
  };
}

export interface GameState {
  players: Player[];
  isGameActive: boolean;
}

export interface KillRequest {
  killerId: string;
  targetId: string;
  timestamp: Date;
}
