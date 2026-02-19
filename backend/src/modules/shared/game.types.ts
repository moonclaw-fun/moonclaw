export interface Player {
  id: string;
  name: string;
  role: 'werewolf' | 'villager';
  isAlive: boolean;
}

export interface Action {
  actorId: string;
  role: string;
  type: string;
  targetId: string;
}

export interface Message {
  id: string;
  playerId: string;
  content: string;
  timestamp: number;
}

export interface Vote {
  voterId: string;
  targetId: string;
}

export interface Round {
  roundNumber: number;
  phase: 'night' | 'day';
  actions?: Action[];
  messages?: Message[];
  votes?: Vote[];
  result: {
    deaths?: string[];
    eliminatedPlayerId?: string;
  };
}

export interface GameScript {
  gameId: string;
  status: string;
  winner: 'werewolf' | 'villager';
  players: Player[];
  rounds: Round[];
}

export interface GameEvent {
  type: 'GAME_START' | 'NIGHT_START' | 'NIGHT_ACTION' | 'NIGHT_DEATH' | 'DAY_START' | 'DAY_MESSAGE' | 'DAY_VOTE' | 'DAY_ELIMINATION' | 'GAME_END';
  gameId: string;
  roundNumber?: number;
  phase?: 'night' | 'day';
  data?: any;
  timestamp: number;
}

export interface GameResult {
  gameId: string;
  winner: 'werewolf' | 'villager';
  survivors: Player[];
  dead: Player[];
  roundsPlayed: number;
}

export interface GameHistory {
  gameId: string;
  result: GameResult;
  completedAt: Date;
}
