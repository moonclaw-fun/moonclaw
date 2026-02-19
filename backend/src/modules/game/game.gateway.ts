import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { GameService } from './game.service';
import { BettingService, BetResultEvent } from '../betting/betting.service';
import { GameEvent } from '../shared/game.types';

@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true,
  },
  // No namespace - use root namespace
})
export class GameGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private readonly logger = new Logger(GameGateway.name);

  constructor(
    private readonly gameService: GameService,
    private readonly bettingService: BettingService,
  ) {}

  afterInit(server: Server): void {
    this.logger.log('WebSocket Gateway initialized on root namespace');
    
    // Subscribe to game events
    this.gameService.addEventListener((event) => {
      this.broadcastEvent(event);
    });

    // Subscribe to bet result events
    this.bettingService.addEventListener((event) => {
      this.broadcastBetResult(event);
    });
  }

  handleConnection(client: Socket): void {
    this.logger.log(`Client connected: ${client.id}`);
    
    // Send current game state to new client
    const currentState = this.gameService.getCurrentGameState();
    if (currentState) {
      client.emit('game_state', {
        gameId: currentState.gameId,
        isRunning: currentState.isRunning,
        players: currentState.script.players,
        currentRound: currentState.currentRoundIndex,
      });
    }

    // Send game info
    client.emit('game_info', this.gameService.getCurrentGameInfo());
    
    // Send welcome message
    client.emit('connected', { 
      message: 'Connected to Werewolf Game Server',
      socketId: client.id,
      timestamp: new Date().toISOString(),
    });
  }

  handleDisconnect(client: Socket): void {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  private broadcastEvent(event: GameEvent): void {
    this.server.emit('game_event', event);
  }

  private broadcastBetResult(event: BetResultEvent): void {
    this.server.emit('bet_result', event);
    
    // Also emit to specific user room if user is subscribed
    this.server.to(`user_${event.userId}`).emit('user_bet_result', event);
  }

  // Handle client subscriptions
  @SubscribeMessage('subscribe_game')
  handleSubscribeGame(client: Socket): void {
    this.logger.log(`Client ${client.id} subscribed to game updates`);
    client.join('game_updates');
    
    // Send current state
    const currentState = this.gameService.getCurrentGameState();
    client.emit('game_state', currentState);
    client.emit('subscribed', { success: true, room: 'game_updates' });
  }

  @SubscribeMessage('unsubscribe_game')
  handleUnsubscribeGame(client: Socket): void {
    this.logger.log(`Client ${client.id} unsubscribed from game updates`);
    client.leave('game_updates');
    client.emit('unsubscribed', { success: true });
  }

  @SubscribeMessage('get_game_history')
  handleGetGameHistory(client: Socket, limit: number = 5): void {
    const history = this.gameService.getGameHistory(limit);
    client.emit('game_history', history);
  }

  @SubscribeMessage('get_game_info')
  handleGetGameInfo(client: Socket): void {
    client.emit('game_info', this.gameService.getCurrentGameInfo());
  }

  @SubscribeMessage('get_game_progress')
  handleGetGameProgress(client: Socket): void {
    const progress = this.gameService.getGameProgress();
    client.emit('game_progress', progress || { message: 'No game is currently running' });
  }

  @SubscribeMessage('place_bet')
  handlePlaceBet(
    client: Socket,
    payload: {
      userId: string;
      gameId: string;
      betType: 'WINNER' | 'WEREWOLF' | 'NEXT_DEATH';
      amount: number;
      targetId?: string;
      predictedWinner?: 'werewolf' | 'villager';
    },
  ): void {
    try {
      const bet = this.bettingService.placeBet(
        payload.userId,
        payload.gameId,
        payload.betType,
        payload.amount,
        payload.targetId,
        payload.predictedWinner,
      );
      client.emit('bet_placed', { success: true, bet });
    } catch (error) {
      client.emit('bet_error', { success: false, error: error.message });
    }
  }

  @SubscribeMessage('get_user_bets')
  handleGetUserBets(client: Socket, userId: string): void {
    const bets = this.bettingService.getBetsByUser(userId);
    client.emit('user_bets', bets);
  }

  @SubscribeMessage('get_user_balance')
  handleGetUserBalance(client: Socket, userId: string): void {
    try {
      // This would be implemented with UserService
      client.emit('user_balance', { userId, balance: 1000 });
    } catch (error) {
      client.emit('error', { message: error.message });
    }
  }

  @SubscribeMessage('subscribe_user_bets')
  handleSubscribeUserBets(client: Socket, userId: string): void {
    const roomName = `user_${userId}`;
    client.join(roomName);
    this.logger.log(`Client ${client.id} subscribed to user bets: ${userId}`);
    client.emit('subscribed_user_bets', { success: true, userId, room: roomName });
  }

  @SubscribeMessage('unsubscribe_user_bets')
  handleUnsubscribeUserBets(client: Socket, userId: string): void {
    const roomName = `user_${userId}`;
    client.leave(roomName);
    this.logger.log(`Client ${client.id} unsubscribed from user bets: ${userId}`);
    client.emit('unsubscribed_user_bets', { success: true, userId });
  }
}
