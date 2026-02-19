import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { GameEngine, GameState, GameProgress } from './game.engine';
import { BettingService } from '../betting/betting.service';
import { GameScript, GameResult, GameHistory, GameEvent } from '../shared/game.types';

@Injectable()
export class GameService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(GameService.name);
  private scripts: GameScript[] = [];
  private gameHistory: GameHistory[] = [];
  private totalGamesPlayed = 0; // Total games counter (includes deleted history)
  private currentGameIndex = 0;
  private isRunning = false;
  private gameInterval: NodeJS.Timeout | null = null;
  private breakTimeout: NodeJS.Timeout | null = null;
  private eventListeners: ((event: GameEvent) => void)[] = [];

  // Configuration
  private readonly GAME_BREAK_MS = 10000; // 10 seconds between games
  private readonly SCRIPT_FILE = 'games.json';
  private readonly MAX_HISTORY_GAMES = 10; // Keep only last 10 games in history

  constructor(
    private readonly gameEngine: GameEngine,
    private readonly bettingService: BettingService,
  ) {
    this.gameEngine.setEventCallback((event) => this.handleGameEvent(event));
  }

  onModuleInit(): void {
    this.loadScripts();
    this.startAutoMode();
  }

  onModuleDestroy(): void {
    this.stopAutoMode();
  }

  private loadScripts(): void {
    try {
      const filePath = path.join(process.cwd(), this.SCRIPT_FILE);
      const content = fs.readFileSync(filePath, 'utf-8');
      this.scripts = JSON.parse(content);
      this.logger.log(`Loaded ${this.scripts.length} game scripts`);
    } catch (error) {
      this.logger.error('Failed to load game scripts:', error.message);
      this.scripts = [];
    }
  }

  addEventListener(callback: (event: GameEvent) => void): void {
    this.eventListeners.push(callback);
  }

  removeEventListener(callback: (event: GameEvent) => void): void {
    const index = this.eventListeners.indexOf(callback);
    if (index > -1) {
      this.eventListeners.splice(index, 1);
    }
  }

  private handleGameEvent(event: GameEvent): void {
    // Broadcast to all listeners (WebSocket, etc.)
    for (const listener of this.eventListeners) {
      listener(event);
    }

    // Handle death events - resolve NEXT_DEATH bets
    if (event.type === 'NIGHT_DEATH' || event.type === 'DAY_ELIMINATION') {
      this.handleDeathEvent(event);
    }

    // Handle game end
    if (event.type === 'GAME_END') {
      this.handleGameEnd(event.data as GameResult);
    }
  }

  private handleDeathEvent(event: GameEvent): void {
    const gameId = event.gameId;
    const pendingBets = this.bettingService.getPendingBetsForGame(gameId);
    
    // Get the player(s) who died
    let deathIds: string[] = [];
    if (event.type === 'NIGHT_DEATH' && event.data?.deaths) {
      deathIds = event.data.deaths.map((d: { id: string }) => d.id);
    } else if (event.type === 'DAY_ELIMINATION' && event.data?.eliminatedId) {
      deathIds = [event.data.eliminatedId];
    }

    // Resolve NEXT_DEATH bets
    for (const bet of pendingBets) {
      if (bet.betType === 'NEXT_DEATH') {
        this.bettingService.resolveNextDeathBet(bet.id, deathIds);
      }
    }
  }

  private handleGameEnd(result: GameResult): void {
    // Resolve bets
    const currentScript = this.scripts[this.currentGameIndex];
    this.bettingService.resolveBets(result.gameId, result, currentScript.players);

    // Increment total games counter
    this.totalGamesPlayed++;

    // Add to history
    this.gameHistory.push({
      gameId: result.gameId,
      result,
      completedAt: new Date(),
    });

    // Keep only last 10 games in history, remove older ones
    if (this.gameHistory.length > this.MAX_HISTORY_GAMES) {
      this.gameHistory.shift(); // Remove oldest game
    }

    this.logger.log(`Game ${result.gameId} completed. Total games played: ${this.totalGamesPlayed}, History kept: ${this.gameHistory.length}`);
  }

  startAutoMode(): void {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.logger.log('Starting auto game mode');
    this.scheduleNextGame();
  }

  stopAutoMode(): void {
    this.isRunning = false;
    if (this.gameInterval) {
      clearTimeout(this.gameInterval);
      this.gameInterval = null;
    }
    if (this.breakTimeout) {
      clearTimeout(this.breakTimeout);
      this.breakTimeout = null;
    }
    this.logger.log('Stopped auto game mode');
  }

  private scheduleNextGame(): void {
    if (!this.isRunning) return;

    this.logger.log(`Next game starting in ${this.GAME_BREAK_MS / 1000} seconds...`);

    this.breakTimeout = setTimeout(() => {
      this.startNextGame();
    }, this.GAME_BREAK_MS);
  }

  private async startNextGame(): Promise<void> {
    if (!this.isRunning || this.scripts.length === 0) return;

    const script = this.scripts[this.currentGameIndex];
    this.currentGameIndex = (this.currentGameIndex + 1) % this.scripts.length;

    this.logger.log(`Starting game: ${script.gameId}`);

    // Start the game
    this.gameEngine.startGame(script);

    // Run game phases
    await this.runGamePhases();
  }

  private async runGamePhases(): Promise<void> {
    while (this.isRunning) {
      const hasMore = await this.gameEngine.runNextPhase();
      if (!hasMore) {
        // Game ended, schedule next
        this.scheduleNextGame();
        break;
      }
      // Small delay between phases
      await this.sleep(500);
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Public API methods
  getCurrentGameState(): GameState | null {
    return this.gameEngine.getCurrentState();
  }

  getGameProgress(): GameProgress | null {
    return this.gameEngine.getGameProgress();
  }

  getGameHistory(limit: number = 5): GameHistory[] {
    return this.gameHistory
      .slice(-limit)
      .reverse();
  }

  getAllGameHistory(): GameHistory[] {
    return [...this.gameHistory].reverse();
  }

  getTotalGamesPlayed(): number {
    return this.totalGamesPlayed;
  }

  getCurrentGameInfo(): {
    currentGameId: string | null;
    isRunning: boolean;
    gamesPlayed: number;
    nextGameIn: number | null;
  } {
    const state = this.getCurrentGameState();
    return {
      currentGameId: state?.gameId || null,
      isRunning: this.isRunning && !!state?.isRunning,
      gamesPlayed: this.getTotalGamesPlayed(),
      nextGameIn: !state?.isRunning && this.isRunning ? this.GAME_BREAK_MS : null,
    };
  }

  getNextGamePreview(): GameScript | null {
    if (!this.isRunning) return null;
    const nextIndex = this.currentGameIndex % this.scripts.length;
    return this.scripts[nextIndex];
  }

  forceStartNextGame(): void {
    if (this.breakTimeout) {
      clearTimeout(this.breakTimeout);
    }
    this.startNextGame();
  }

  pauseAutoMode(): void {
    this.isRunning = false;
    if (this.breakTimeout) {
      clearTimeout(this.breakTimeout);
    }
    this.logger.log('Auto mode paused');
  }

  resumeAutoMode(): void {
    if (!this.isRunning) {
      this.isRunning = true;
      this.scheduleNextGame();
      this.logger.log('Auto mode resumed');
    }
  }
}
