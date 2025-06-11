
export interface Player {
  id: string;
  game_id?: string;
  name: string;
  code: string;
  is_alive: boolean;
  target_id?: string;
  last_action?: string;
  has_logged_in: boolean;
  pending_kill_confirmation?: {
    killerId: string;
    timestamp: string;
    killMethod?: string;
    killDescription?: string;
  };
  created_at?: string;
  updated_at?: string;
}

export interface Game {
  id: string;
  status: 'setup' | 'active' | 'finished';
  created_at?: string;
  updated_at?: string;
}

export interface GameState {
  game: Game | null;
  players: Player[];
}

export interface KillRequest {
  id?: string;
  game_id: string;
  killer_id: string;
  target_id: string;
  confirmed?: boolean;
  kill_method?: string;
  kill_description?: string;
  created_at?: string;
}
