import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Bet, BetType, BetStatus } from './bet.entity';
import { UserService } from '../user/user.service';
import { GameResult, Player } from '../shared/game.types';

export interface BetResultEvent {
  type: 'BET_WON' | 'BET_LOST';
  bet: Bet;
  userId: string;
  gameId: string;
  timestamp: number;
}

@Injectable()
export class BettingService {
  private bets: Map<string, Bet> = new Map();
  private idCounter = 1;
  private eventListeners: ((event: BetResultEvent) => void)[] = [];

  // Odds for different bet types
  private readonly ODDS = {
    WINNER: 1.5,      // 1.5x for correct winner prediction
    WEREWOLF: 3.0,    // 3x for correctly identifying werewolf
    NEXT_DEATH: 2.5,  // 2.5x for predicting next death
  };

  constructor(private readonly userService: UserService) {}

  addEventListener(callback: (event: BetResultEvent) => void): void {
    this.eventListeners.push(callback);
  }

  removeEventListener(callback: (event: BetResultEvent) => void): void {
    const index = this.eventListeners.indexOf(callback);
    if (index > -1) {
      this.eventListeners.splice(index, 1);
    }
  }

  private emitBetResultEvent(event: BetResultEvent): void {
    for (const listener of this.eventListeners) {
      listener(event);
    }
  }

  placeBet(
    userId: string,
    gameId: string,
    betType: BetType,
    amount: number,
    targetId?: string,
    predictedWinner?: 'werewolf' | 'villager',
  ): Bet {
    // Validate user and balance
    const user = this.userService.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (amount <= 0) {
      throw new BadRequestException('Bet amount must be positive');
    }
    if (user.balance < amount) {
      throw new BadRequestException('Insufficient balance');
    }

    // Validate bet type specific requirements
    if (betType === 'WINNER' && !predictedWinner) {
      throw new BadRequestException('WINNER bet requires predictedWinner');
    }
    if ((betType === 'WEREWOLF' || betType === 'NEXT_DEATH') && !targetId) {
      throw new BadRequestException(`${betType} bet requires targetId`);
    }

    // Deduct balance
    this.userService.deductBalance(userId, amount);

    // Create bet
    const id = `bet_${this.idCounter++}`;
    const odds = this.ODDS[betType];
    const bet = new Bet(
      id,
      userId,
      gameId,
      betType,
      amount,
      odds,
      targetId,
      predictedWinner,
    );
    this.bets.set(id, bet);

    return bet;
  }

  resolveBets(gameId: string, gameResult: GameResult, players: Player[]): void {
    const gameBets = this.getBetsByGame(gameId);

    for (const bet of gameBets) {
      if (bet.status !== 'PENDING') continue;

      let isWin = false;

      switch (bet.betType) {
        case 'WINNER':
          isWin = gameResult.winner === bet.predictedWinner;
          break;
        case 'WEREWOLF':
          // Check if the target player was the werewolf
          const targetPlayer = players.find(p => p.id === bet.targetId);
          isWin = targetPlayer?.role === 'werewolf';
          break;
        case 'NEXT_DEATH':
          // Resolved immediately when death occurs (NIGHT_DEATH or DAY_ELIMINATION event)
          // See GameService.handleDeathEvent()
          continue;
      }

      this.resolveBet(bet, isWin);
    }
  }

  resolveNextDeathBet(betId: string, actualDeathIds: string[]): void {
    const bet = this.bets.get(betId);
    if (!bet || bet.status !== 'PENDING') return;

    // Win if the predicted player died in this event
    const isWin = actualDeathIds.includes(bet.targetId!);
    this.resolveBet(bet, isWin);
  }

  private resolveBet(bet: Bet, isWin: boolean): void {
    bet.status = isWin ? 'WON' : 'LOST';
    bet.resolvedAt = new Date();

    if (isWin) {
      bet.payout = bet.amount * bet.odds;
      this.userService.addBalance(bet.userId, bet.payout);
    }

    // Emit bet result event via socket
    const event: BetResultEvent = {
      type: isWin ? 'BET_WON' : 'BET_LOST',
      bet,
      userId: bet.userId,
      gameId: bet.gameId,
      timestamp: Date.now(),
    };
    this.emitBetResultEvent(event);
  }

  getBetById(id: string): Bet | undefined {
    return this.bets.get(id);
  }

  getBetsByUser(userId: string): Bet[] {
    return Array.from(this.bets.values()).filter(bet => bet.userId === userId);
  }

  getBetsByGame(gameId: string): Bet[] {
    return Array.from(this.bets.values()).filter(bet => bet.gameId === gameId);
  }

  getPendingBetsForGame(gameId: string): Bet[] {
    return this.getBetsByGame(gameId).filter(bet => bet.status === 'PENDING');
  }

  getUserBetHistory(userId: string): Bet[] {
    return this.getBetsByUser(userId).sort((a, b) => 
      b.createdAt.getTime() - a.createdAt.getTime()
    );
  }
}
