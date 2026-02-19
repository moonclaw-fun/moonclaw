import { Injectable, Logger } from '@nestjs/common';
import { GameScript, GameEvent, Round, Player, GameResult } from '../shared/game.types';

export interface GameState {
  gameId: string;
  script: GameScript;
  currentRoundIndex: number;
  isRunning: boolean;
  completedAt?: Date;
  startedAt?: Date;
}

export interface GameMessage {
  playerId: string;
  playerName: string;
  content: string;
  round: number;
  timestamp: number;
}

export interface GameProgress {
  gameId: string;
  isRunning: boolean;
  startedAt?: Date;
  currentRound: number;
  totalRounds: number;
  currentPhase?: 'night' | 'day';
  events: GameEvent[];
  messages: GameMessage[];
  players: {
    alive: { id: string; name: string }[];
    dead: { id: string; name: string; role: string; diedAtRound?: number }[];
  };
  stats: {
    totalDeaths: number;
    eliminations: number;
    nightDeaths: number;
  };
}

@Injectable()
export class GameEngine {
  private readonly logger = new Logger(GameEngine.name);
  private currentState: GameState | null = null;
  private eventCallback: ((event: GameEvent) => void) | null = null;
  private enableDelays: boolean = true;
  private gameEvents: GameEvent[] = [];

  setEventCallback(callback: (event: GameEvent) => void): void {
    this.eventCallback = callback;
  }

  setEnableDelays(enable: boolean): void {
    this.enableDelays = enable;
  }

  startGame(script: GameScript): GameState {
    // Clear previous game events
    this.gameEvents = [];
    
    this.currentState = {
      gameId: script.gameId,
      script,
      currentRoundIndex: 0,
      isRunning: true,
      startedAt: new Date(),
    };

    this.emitEvent({
      type: 'GAME_START',
      gameId: script.gameId,
      data: {
        players: script.players,
        totalRounds: script.rounds.length,
      },
      timestamp: Date.now(),
    });

    this.logger.log(`Game ${script.gameId} started`);
    return this.currentState;
  }

  async runNextPhase(): Promise<boolean> {
    if (!this.currentState || !this.currentState.isRunning) {
      return false;
    }

    const { script, currentRoundIndex } = this.currentState;
    
    if (currentRoundIndex >= script.rounds.length) {
      await this.endGame();
      return false;
    }

    const round = script.rounds[currentRoundIndex];
    await this.executeRound(round);

    this.currentState.currentRoundIndex++;
    
    // Check if this was the last round
    if (this.currentState.currentRoundIndex >= script.rounds.length) {
      await this.endGame();
      return false;
    }
    
    return true;
  }

  private async executeRound(round: Round): Promise<void> {
    const { gameId } = this.currentState!;

    if (round.phase === 'night') {
      // Night phase
      this.emitEvent({
        type: 'NIGHT_START',
        gameId,
        roundNumber: round.roundNumber,
        phase: 'night',
        data: { roundNumber: round.roundNumber },
        timestamp: Date.now(),
      });

      // Execute actions (werewolves deciding who to kill)
      if (round.actions) {
        for (const action of round.actions) {
          await this.sleep(2000);  // 2s for each kill decision
          const actor = this.currentState!.script.players.find(p => p.id === action.actorId);
          const target = this.currentState!.script.players.find(p => p.id === action.targetId);
          
          this.emitEvent({
            type: 'NIGHT_ACTION',
            gameId,
            roundNumber: round.roundNumber,
            phase: 'night',
            data: {
              actor: actor?.name || action.actorId,
              action: action.type,
              target: target?.name || action.targetId,
            },
            timestamp: Date.now(),
          });
        }
      }

      // Death results
      if (round.result.deaths && round.result.deaths.length > 0) {
        await this.sleep(2000);  // 2s to announce deaths
        const deaths = round.result.deaths.map(id => {
          const player = this.currentState!.script.players.find(p => p.id === id);
          return { id, name: player?.name || id };
        });

        this.emitEvent({
          type: 'NIGHT_DEATH',
          gameId,
          roundNumber: round.roundNumber,
          phase: 'night',
          data: { deaths },
          timestamp: Date.now(),
        });
      }
    } else {
      // Day phase
      this.emitEvent({
        type: 'DAY_START',
        gameId,
        roundNumber: round.roundNumber,
        phase: 'day',
        data: { roundNumber: round.roundNumber },
        timestamp: Date.now(),
      });

      // Messages
      if (round.messages) {
        for (const message of round.messages) {
          await this.sleep(3000);  // 3s between each message
          const player = this.currentState!.script.players.find(p => p.id === message.playerId);
          
          this.emitEvent({
            type: 'DAY_MESSAGE',
            gameId,
            roundNumber: round.roundNumber,
            phase: 'day',
            data: {
              playerId: message.playerId,
              playerName: player?.name || message.playerId,
              content: message.content,
            },
            timestamp: Date.now(),
          });
        }
      }

      // Votes
      if (round.votes) {
        await this.sleep(4000);  // 4s for voting
        const voteData = round.votes.map(vote => {
          const voter = this.currentState!.script.players.find(p => p.id === vote.voterId);
          const target = this.currentState!.script.players.find(p => p.id === vote.targetId);
          return {
            voterId: vote.voterId,
            voterName: voter?.name || vote.voterId,
            targetId: vote.targetId,
            targetName: target?.name || vote.targetId,
          };
        });

        this.emitEvent({
          type: 'DAY_VOTE',
          gameId,
          roundNumber: round.roundNumber,
          phase: 'day',
          data: { votes: voteData },
          timestamp: Date.now(),
        });
      }

      // Elimination result
      if (round.result.eliminatedPlayerId) {
        await this.sleep(2000);  // 2s to announce elimination
        const eliminated = this.currentState!.script.players.find(
          p => p.id === round.result.eliminatedPlayerId
        );

        this.emitEvent({
          type: 'DAY_ELIMINATION',
          gameId,
          roundNumber: round.roundNumber,
          phase: 'day',
          data: {
            eliminatedId: round.result.eliminatedPlayerId,
            eliminatedName: eliminated?.name || round.result.eliminatedPlayerId,
          },
          timestamp: Date.now(),
        });
      }
    }
  }

  private async endGame(): Promise<void> {
    if (!this.currentState) return;

    const { script } = this.currentState;
    this.currentState.isRunning = false;
    this.currentState.completedAt = new Date();

    const survivors = script.players.filter(p => p.isAlive);
    const dead = script.players.filter(p => !p.isAlive);

    const result: GameResult = {
      gameId: script.gameId,
      winner: script.winner,
      survivors,
      dead,
      roundsPlayed: script.rounds.length,
    };

    this.emitEvent({
      type: 'GAME_END',
      gameId: script.gameId,
      data: result,
      timestamp: Date.now(),
    });

    this.logger.log(`Game ${script.gameId} ended. Winner: ${script.winner}`);
  }

  private emitEvent(event: GameEvent): void {
    // Store event in history
    this.gameEvents.push(event);
    
    if (this.eventCallback) {
      this.eventCallback(event);
    }
  }

  getCurrentState(): GameState | null {
    return this.currentState;
  }

  getGameProgress(): GameProgress | null {
    if (!this.currentState) {
      return null;
    }

    const { gameId, isRunning, startedAt, script, currentRoundIndex } = this.currentState;
    
    // Get current phase from the most recent event
    let currentPhase: 'night' | 'day' | undefined;
    if (this.gameEvents.length > 0) {
      const lastEvent = this.gameEvents[this.gameEvents.length - 1];
      currentPhase = lastEvent.phase;
    }

    // Calculate player status
    const alivePlayers: { id: string; name: string }[] = [];
    const deadPlayers: { id: string; name: string; role: string; diedAtRound?: number }[] = [];
    
    // Track deaths
    const deathEvents = this.gameEvents.filter(e => e.type === 'NIGHT_DEATH' || e.type === 'DAY_ELIMINATION');
    const deadPlayerIds = new Map<string, number>(); // playerId -> round died
    
    deathEvents.forEach(event => {
      if (event.type === 'NIGHT_DEATH' && event.data?.deaths) {
        event.data.deaths.forEach((death: { id: string; name: string }) => {
          deadPlayerIds.set(death.id, event.roundNumber || 0);
        });
      } else if (event.type === 'DAY_ELIMINATION' && event.data?.eliminatedId) {
        deadPlayerIds.set(event.data.eliminatedId, event.roundNumber || 0);
      }
    });

    script.players.forEach(player => {
      if (deadPlayerIds.has(player.id)) {
        // Dead players: reveal their role
        deadPlayers.push({
          id: player.id,
          name: player.name,
          role: player.role,
          diedAtRound: deadPlayerIds.get(player.id),
        });
      } else {
        // Alive players: hide their role (don't reveal who is werewolf)
        alivePlayers.push({
          id: player.id,
          name: player.name,
        });
      }
    });

    // Calculate stats
    const nightDeaths = this.gameEvents.filter(e => e.type === 'NIGHT_DEATH').reduce((sum, e) => {
      return sum + (e.data?.deaths?.length || 0);
    }, 0);
    const eliminations = this.gameEvents.filter(e => e.type === 'DAY_ELIMINATION').length;

    // Extract messages from DAY_MESSAGE events
    const messages: GameMessage[] = this.gameEvents
      .filter(e => e.type === 'DAY_MESSAGE')
      .map(e => ({
        playerId: e.data?.playerId || '',
        playerName: e.data?.playerName || '',
        content: e.data?.content || '',
        round: e.roundNumber || 0,
        timestamp: e.timestamp,
      }));

    return {
      gameId,
      isRunning,
      startedAt,
      currentRound: currentRoundIndex,
      totalRounds: script.rounds.length,
      currentPhase,
      events: [...this.gameEvents],
      messages,
      players: {
        alive: alivePlayers,
        dead: deadPlayers,
      },
      stats: {
        totalDeaths: deadPlayers.length,
        eliminations,
        nightDeaths,
      },
    };
  }

  clearGameEvents(): void {
    this.gameEvents = [];
  }

  private sleep(ms: number): Promise<void> {
    if (!this.enableDelays) {
      return Promise.resolve();
    }
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
