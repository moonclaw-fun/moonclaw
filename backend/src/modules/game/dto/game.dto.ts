import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsEnum, IsOptional, Min } from 'class-validator';

export class BetRequestDto {
  @ApiProperty({
    description: 'User ID placing the bet',
    example: 'user_1',
  })
  @IsString()
  userId: string;

  @ApiProperty({
    description: 'Game ID to place bet on',
    example: 'game_001',
  })
  @IsString()
  gameId: string;

  @ApiProperty({
    description: 'Type of bet',
    enum: ['WINNER', 'WEREWOLF', 'NEXT_DEATH'],
    example: 'WINNER',
  })
  @IsEnum(['WINNER', 'WEREWOLF', 'NEXT_DEATH'] as const)
  betType: 'WINNER' | 'WEREWOLF' | 'NEXT_DEATH';

  @ApiProperty({
    description: 'Amount to bet',
    example: 100,
    minimum: 1,
  })
  @IsNumber()
  @Min(1)
  amount: number;

  @ApiPropertyOptional({
    description: 'Target player ID (required for WEREWOLF and NEXT_DEATH bets)',
    example: 'p1',
  })
  @IsOptional()
  @IsString()
  targetId?: string;

  @ApiPropertyOptional({
    description: 'Predicted winner team (required for WINNER bets)',
    enum: ['werewolf', 'villager'],
    example: 'werewolf',
  })
  @IsOptional()
  @IsEnum(['werewolf', 'villager'] as const)
  predictedWinner?: 'werewolf' | 'villager';
}

export class BetResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({
    example: {
      id: 'bet_1',
      userId: 'user_1',
      gameId: 'game_001',
      betType: 'WINNER',
      amount: 100,
      odds: 1.5,
      status: 'PENDING',
      createdAt: '2024-01-15T08:30:00.000Z',
    }
  })
  bet: any;
}

export class GameStatusResponseDto {
  @ApiPropertyOptional({ example: 'game_001' })
  currentGameId: string | null;

  @ApiProperty({ example: false })
  isRunning: boolean;

  @ApiProperty({ example: 5 })
  gamesPlayed: number;

  @ApiPropertyOptional({ example: 10000 })
  nextGameIn: number | null;
}

export class GameStatsResponseDto {
  @ApiProperty({ example: 10 })
  totalGames: number;

  @ApiProperty({ example: 6 })
  werewolfWins: number;

  @ApiProperty({ example: 4 })
  villagerWins: number;

  @ApiProperty({
    example: {
      werewolf: '60.00%',
      villager: '40.00%',
    }
  })
  winRate: {
    werewolf: string;
    villager: string;
  };
}

export class AdminActionResponseDto {
  @ApiProperty({ example: 'Auto mode paused' })
  message: string;
}

// Player DTOs
class PlayerInfoDto {
  @ApiProperty({ example: 'p1', description: 'Player ID' })
  id: string;

  @ApiProperty({ example: 'Alice', description: 'Player name' })
  name: string;

  @ApiProperty({ example: 'villager', enum: ['werewolf', 'villager'] })
  role: string;
}

class PlayerAliveDto {
  @ApiProperty({ example: 'p1' })
  id: string;

  @ApiProperty({ example: 'Alice' })
  name: string;
}

class PlayerDeadDto {
  @ApiProperty({ example: 'p2' })
  id: string;

  @ApiProperty({ example: 'Bob' })
  name: string;

  @ApiProperty({ example: 'werewolf' })
  role: string;

  @ApiPropertyOptional({ example: 3 })
  diedAtRound?: number;
}

// Event DTO
class GameEventDto {
  @ApiProperty({ example: 'GAME_START', enum: ['GAME_START', 'NIGHT_START', 'NIGHT_ACTION', 'NIGHT_DEATH', 'DAY_START', 'DAY_MESSAGE', 'DAY_VOTE', 'DAY_ELIMINATION', 'GAME_END'] })
  type: string;

  @ApiProperty({ example: 'game_001' })
  gameId: string;

  @ApiPropertyOptional({ example: 1 })
  roundNumber?: number;

  @ApiPropertyOptional({ example: 'day', enum: ['night', 'day'] })
  phase?: string;

  @ApiPropertyOptional()
  data?: any;

  @ApiProperty({ example: 1707900000000 })
  timestamp: number;
}

// Message DTO
class GameMessageDto {
  @ApiProperty({ example: 'p1' })
  playerId: string;

  @ApiProperty({ example: 'Alice' })
  playerName: string;

  @ApiProperty({ example: 'Tôi nghĩ Bob là ma sói!' })
  content: string;

  @ApiProperty({ example: 2 })
  round: number;

  @ApiProperty({ example: 1707900000000 })
  timestamp: number;
}

// Game History DTOs
class GameResultDto {
  @ApiProperty({ example: 'game_001' })
  gameId: string;

  @ApiProperty({ example: 'werewolf', enum: ['werewolf', 'villager'] })
  winner: string;

  @ApiProperty({
    example: [
      { id: 'p3', name: 'Charlie', role: 'werewolf', isAlive: true }
    ]
  })
  survivors: any[];

  @ApiProperty({
    example: [
      { id: 'p1', name: 'Alice', role: 'villager', isAlive: false },
      { id: 'p2', name: 'Bob', role: 'villager', isAlive: false }
    ]
  })
  dead: any[];

  @ApiProperty({ example: 8 })
  roundsPlayed: number;
}

export class GameHistoryItemDto {
  @ApiProperty({ example: 'game_001' })
  gameId: string;

  @ApiProperty({ type: GameResultDto })
  result: GameResultDto;

  @ApiProperty({ example: '2024-01-15T09:00:00.000Z' })
  completedAt: string;
}

export class GameHistoryResponseDto {
  @ApiProperty({
    type: [GameHistoryItemDto],
    example: [
      {
        gameId: 'game_001',
        result: {
          gameId: 'game_001',
          winner: 'werewolf',
          survivors: [
            { id: 'p3', name: 'Charlie', role: 'werewolf', isAlive: true },
            { id: 'p4', name: 'Diana', role: 'werewolf', isAlive: true }
          ],
          dead: [
            { id: 'p1', name: 'Alice', role: 'villager', isAlive: false },
            { id: 'p2', name: 'Bob', role: 'villager', isAlive: false },
            { id: 'p5', name: 'Eve', role: 'villager', isAlive: false }
          ],
          roundsPlayed: 8
        },
        completedAt: '2024-01-15T09:00:00.000Z'
      },
      {
        gameId: 'game_002',
        result: {
          gameId: 'game_002',
          winner: 'villager',
          survivors: [
            { id: 'p1', name: 'Alice', role: 'villager', isAlive: true },
            { id: 'p2', name: 'Bob', role: 'villager', isAlive: true }
          ],
          dead: [
            { id: 'p3', name: 'Charlie', role: 'werewolf', isAlive: false }
          ],
          roundsPlayed: 6
        },
        completedAt: '2024-01-15T08:45:00.000Z'
      }
    ]
  })
  history: GameHistoryItemDto[];
}

// Game Progress DTOs
class PlayersProgressDto {
  @ApiProperty({ type: [PlayerAliveDto] })
  alive: PlayerAliveDto[];

  @ApiProperty({ type: [PlayerDeadDto] })
  dead: PlayerDeadDto[];
}

class GameStatsDto {
  @ApiProperty({ example: 3, description: 'Total deaths in game' })
  totalDeaths: number;

  @ApiProperty({ example: 1, description: 'Number of day eliminations' })
  eliminations: number;

  @ApiProperty({ example: 2, description: 'Number of night deaths' })
  nightDeaths: number;
}

export class GameProgressResponseDto {
  @ApiProperty({ example: 'game_001' })
  gameId: string;

  @ApiProperty({ example: true })
  isRunning: boolean;

  @ApiPropertyOptional({ example: '2024-01-15T08:30:00.000Z' })
  startedAt?: string;

  @ApiProperty({ example: 3 })
  currentRound: number;

  @ApiProperty({ example: 10 })
  totalRounds: number;

  @ApiPropertyOptional({ example: 'day', enum: ['night', 'day'] })
  currentPhase?: string;

  @ApiProperty({
    type: [GameEventDto],
    example: [
      {
        type: 'GAME_START',
        gameId: 'game_001',
        data: { players: [], totalRounds: 10 },
        timestamp: 1707900000000
      },
      {
        type: 'NIGHT_START',
        gameId: 'game_001',
        roundNumber: 1,
        phase: 'night',
        data: { roundNumber: 1 },
        timestamp: 1707900010000
      },
      {
        type: 'NIGHT_DEATH',
        gameId: 'game_001',
        roundNumber: 1,
        phase: 'night',
        data: { deaths: [{ id: 'p1', name: 'Alice' }] },
        timestamp: 1707900030000
      },
      {
        type: 'DAY_START',
        gameId: 'game_001',
        roundNumber: 1,
        phase: 'day',
        data: { roundNumber: 1 },
        timestamp: 1707900040000
      },
      {
        type: 'DAY_MESSAGE',
        gameId: 'game_001',
        roundNumber: 1,
        phase: 'day',
        data: { playerId: 'p2', playerName: 'Bob', content: 'Tôi nghĩ Charlie là ma sói!' },
        timestamp: 1707900050000
      }
    ]
  })
  events: GameEventDto[];

  @ApiProperty({
    type: [GameMessageDto],
    example: [
      {
        playerId: 'p2',
        playerName: 'Bob',
        content: 'Tôi nghĩ Charlie là ma sói!',
        round: 1,
        timestamp: 1707900050000
      },
      {
        playerId: 'p3',
        playerName: 'Charlie',
        content: 'Không, Bob mới là ma sói!',
        round: 1,
        timestamp: 1707900060000
      },
      {
        playerId: 'p4',
        playerName: 'Diana',
        content: 'Tôi tin Bob hơn...',
        round: 1,
        timestamp: 1707900070000
      }
    ]
  })
  messages: GameMessageDto[];

  @ApiProperty({ type: PlayersProgressDto })
  players: PlayersProgressDto;

  @ApiProperty({ type: GameStatsDto })
  stats: GameStatsDto;
}

export class NoGameRunningResponseDto {
  @ApiProperty({ example: 'No game is currently running' })
  message: string;
}
