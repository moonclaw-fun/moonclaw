export type BetType = 'WINNER' | 'WEREWOLF' | 'NEXT_DEATH';
export type BetStatus = 'PENDING' | 'WON' | 'LOST';

export class Bet {
  id: string;
  userId: string;
  gameId: string;
  betType: BetType;
  targetId?: string; // For WEREWOLF and NEXT_DEATH bets
  predictedWinner?: 'werewolf' | 'villager'; // For WINNER bet
  amount: number;
  odds: number;
  status: BetStatus;
  payout: number;
  createdAt: Date;
  resolvedAt?: Date;

  constructor(
    id: string,
    userId: string,
    gameId: string,
    betType: BetType,
    amount: number,
    odds: number,
    targetId?: string,
    predictedWinner?: 'werewolf' | 'villager',
  ) {
    this.id = id;
    this.userId = userId;
    this.gameId = gameId;
    this.betType = betType;
    this.targetId = targetId;
    this.predictedWinner = predictedWinner;
    this.amount = amount;
    this.odds = odds;
    this.status = 'PENDING';
    this.payout = 0;
    this.createdAt = new Date();
  }
}
