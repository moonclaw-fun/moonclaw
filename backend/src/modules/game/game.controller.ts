import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Res,
  Headers,
  HttpException,
  HttpStatus,
  UnauthorizedException,
} from '@nestjs/common';
import { Response } from 'express';
import { readFileSync } from 'fs';
import { join } from 'path';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { GameService } from './game.service';
import { BettingService } from '../betting/betting.service';
import { UserService } from '../user/user.service';
import {
  BetRequestDto,
  BetResponseDto,
  GameStatusResponseDto,
  GameStatsResponseDto,
  AdminActionResponseDto,
  GameHistoryResponseDto,
  GameProgressResponseDto,
  NoGameRunningResponseDto,
} from './dto/game.dto';

@ApiTags('Game')
@Controller('game')
export class GameController {
  constructor(
    private readonly gameService: GameService,
    private readonly bettingService: BettingService,
    private readonly userService: UserService,
  ) {}

  // Get current game status
  @Get('status')
  @ApiOperation({
    summary: 'Get current game status',
    description: 'Get information about the current game state',
  })
  @ApiResponse({
    status: 200,
    description: 'Current game status',
    type: GameStatusResponseDto,
  })
  getStatus() {
    return this.gameService.getCurrentGameInfo();
  }

  // Get current game state
  @Get('current')
  @ApiOperation({
    summary: 'Get current game details',
    description: 'Get detailed information about the currently running game',
  })
  @ApiResponse({ status: 200, description: 'Current game details' })
  @ApiResponse({ status: 404, description: 'No game is currently running' })
  getCurrentGame() {
    const state = this.gameService.getCurrentGameState();
    if (!state) {
      return { message: 'No game is currently running' };
    }
    return {
      gameId: state.gameId,
      isRunning: state.isRunning,
      players: state.script.players,
      currentRound: state.currentRoundIndex,
      totalRounds: state.script.rounds.length,
    };
  }

  // Get game history
  @Get('history')
  @ApiOperation({
    summary: 'Get game history',
    description: 'Get the last N completed games',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of games to return',
    example: 5,
  })
  @ApiResponse({
    status: 200,
    description: 'List of completed games',
    type: GameHistoryResponseDto,
  })
  getHistory(@Query('limit') limit?: string) {
    const count = limit ? parseInt(limit, 10) : 5;
    return this.gameService.getGameHistory(count);
  }

  // Get all game history
  @Get('history/all')
  @ApiOperation({
    summary: 'Get all game history',
    description: 'Get all completed games',
  })
  @ApiResponse({ status: 200, description: 'List of all completed games' })
  getAllHistory() {
    return this.gameService.getAllGameHistory();
  }

  // Get total games played
  @Get('stats')
  @ApiOperation({
    summary: 'Get game statistics',
    description: 'Get win/loss statistics for werewolf vs villager',
  })
  @ApiResponse({
    status: 200,
    description: 'Game statistics',
    type: GameStatsResponseDto,
  })
  getStats() {
    const history = this.gameService.getAllGameHistory();
    const werewolfWins = history.filter(
      (h) => h.result.winner === 'werewolf',
    ).length;
    const villagerWins = history.filter(
      (h) => h.result.winner === 'villager',
    ).length;

    return {
      totalGames: history.length,
      werewolfWins,
      villagerWins,
      winRate: {
        werewolf:
          history.length > 0
            ? ((werewolfWins / history.length) * 100).toFixed(2) + '%'
            : '0%',
        villager:
          history.length > 0
            ? ((villagerWins / history.length) * 100).toFixed(2) + '%'
            : '0%',
      },
    };
  }

  // Get next game preview
  @Get('next-preview')
  @ApiOperation({
    summary: 'Get next game preview',
    description: 'Get a preview of the upcoming game',
  })
  @ApiResponse({ status: 200, description: 'Next game preview' })
  getNextPreview() {
    const preview = this.gameService.getNextGamePreview();
    if (!preview) {
      return { message: 'No upcoming game' };
    }
    return {
      gameId: preview.gameId,
      players: preview.players.map((p) => ({ id: p.id, name: p.name })),
      totalRounds: preview.rounds.length,
    };
  }

  // Admin: Force start next game
  @Post('admin/force-next')
  @ApiOperation({
    summary: '[Admin] Force start next game',
    description: 'Immediately start the next game (admin only)',
  })
  @ApiResponse({
    status: 201,
    description: 'Next game started',
    type: AdminActionResponseDto,
  })
  forceNextGame() {
    this.gameService.forceStartNextGame();
    return { message: 'Next game started' };
  }

  // Admin: Pause auto mode
  @Post('admin/pause')
  @ApiOperation({
    summary: '[Admin] Pause auto mode',
    description: 'Pause the automatic game mode (admin only)',
  })
  @ApiResponse({
    status: 201,
    description: 'Auto mode paused',
    type: AdminActionResponseDto,
  })
  pauseGame() {
    this.gameService.pauseAutoMode();
    return { message: 'Auto mode paused' };
  }

  // Admin: Resume auto mode
  @Post('admin/resume')
  @ApiOperation({
    summary: '[Admin] Resume auto mode',
    description: 'Resume the automatic game mode (admin only)',
  })
  @ApiResponse({
    status: 201,
    description: 'Auto mode resumed',
    type: AdminActionResponseDto,
  })
  resumeGame() {
    this.gameService.resumeAutoMode();
    return { message: 'Auto mode resumed' };
  }

  // Betting: Place a bet
  @Post('bet')
  @ApiOperation({
    summary: 'Place a bet',
    description: 'Place a bet on the current game',
  })
  @ApiBody({
    type: BetRequestDto,
    examples: {
      'WINNER Bet': {
        value: {
          userId: 'user_1',
          gameId: 'game_001',
          betType: 'WINNER',
          amount: 100,
          predictedWinner: 'werewolf',
        },
        description: 'Bet on which team will win (werewolf or villager)',
      },
      'WEREWOLF Bet': {
        value: {
          userId: 'user_1',
          gameId: 'game_001',
          betType: 'WEREWOLF',
          amount: 100,
          targetId: 'p1',
        },
        description: 'Bet on which player is the werewolf',
      },
      'NEXT_DEATH Bet': {
        value: {
          userId: 'user_1',
          gameId: 'game_001',
          betType: 'NEXT_DEATH',
          amount: 100,
          targetId: 'p2',
        },
        description: 'Bet on which player will die in the next phase',
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Bet placed successfully',
    type: BetResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid bet parameters' })
  placeBet(@Body() betRequest: BetRequestDto) {
    console.log(betRequest);
    const bet = this.bettingService.placeBet(
      betRequest.userId,
      betRequest.gameId,
      betRequest.betType,
      betRequest.amount,
      betRequest.targetId,
      betRequest.predictedWinner,
    );
    return { success: true, bet };
  }

  // Betting: Place a bet with access token
  @Post('bet/token')
  @ApiOperation({
    summary: 'Place a bet with access token',
    description:
      'Place a bet on the current game using Bearer token authentication. No userId required in body.',
  })
  @ApiBody({
    type: BetRequestDto,
    examples: {
      'WINNER Bet with Token': {
        value: {
          gameId: 'game_001',
          betType: 'WINNER',
          amount: 100,
          predictedWinner: 'werewolf',
        },
        description: 'Bet on which team will win using access token',
      },
      'WEREWOLF Bet with Token': {
        value: {
          gameId: 'game_001',
          betType: 'WEREWOLF',
          amount: 100,
          targetId: 'p1',
        },
        description: 'Bet on which player is the werewolf using access token',
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Bet placed successfully',
    type: BetResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
  })
  @ApiResponse({ status: 400, description: 'Invalid bet parameters' })
  @ApiBearerAuth('access-token')
  placeBetByToken(
    @Body() betRequest: Omit<BetRequestDto, 'userId'>,
    @Headers() headers: Record<string, string>,
  ) {
    console.log('All headers:', headers);
    
    // Get authorization header (case-insensitive)
    const auth = headers['authorization'] || headers['Authorization'];

    // Validate token
    if (!auth) {
      throw new UnauthorizedException('Authorization header required');
    }

    const token = auth.replace(/^Bearer\s+/i, '').trim();
    if (!token) {
      throw new UnauthorizedException('Bearer token required');
    }

    const user = this.userService.findByAccessToken(token);
    if (!user) {
      throw new UnauthorizedException('Invalid token');
    }

    // Place bet with authenticated user
    const bet = this.bettingService.placeBet(
      user.id,
      betRequest.gameId,
      betRequest.betType,
      betRequest.amount,
      betRequest.targetId,
      betRequest.predictedWinner,
    );

    return { success: true, bet };
  }

  // Get user's bets
  @Get('bets/:userId')
  @ApiOperation({
    summary: "Get user's bets",
    description: 'Get all bets placed by a specific user',
  })
  @ApiParam({ name: 'userId', description: 'User ID', example: 'user_1' })
  @ApiResponse({ status: 200, description: 'List of user bets' })
  getUserBets(@Param('userId') userId: string) {
    return this.bettingService.getUserBetHistory(userId);
  }

  // Get user's pending bets
  @Get('bets/:userId/pending')
  @ApiOperation({
    summary: "Get user's pending bets",
    description: 'Get all pending bets for a specific user',
  })
  @ApiParam({ name: 'userId', description: 'User ID', example: 'user_1' })
  @ApiResponse({ status: 200, description: 'List of pending bets' })
  getUserPendingBets(@Param('userId') userId: string) {
    const bets = this.bettingService.getBetsByUser(userId);
    return bets.filter((b) => b.status === 'PENDING');
  }

  // Get current game players for betting reference
  @Get('current/players')
  @ApiOperation({
    summary: 'Get current game players',
    description:
      'Get list of players in the current game for betting reference',
  })
  @ApiResponse({ status: 200, description: 'List of players' })
  getCurrentPlayers() {
    const state = this.gameService.getCurrentGameState();
    if (!state) {
      return { message: 'No game is currently running' };
    }
    return {
      gameId: state.gameId,
      players: state.script.players.map((p) => ({
        id: p.id,
        name: p.name,
        isAlive: p.isAlive,
      })),
    };
  }

  // Get current game progress - detailed timeline from start to now
  @Get('progress')
  @ApiOperation({
    summary: 'Get current game progress',
    description:
      'Get detailed game progress including all events from the start of the current game to now',
  })
  @ApiResponse({
    status: 200,
    description: 'Current game progress with events timeline',
    type: GameProgressResponseDto,
  })
  @ApiResponse({
    status: 200,
    description: 'No game is currently running',
    type: NoGameRunningResponseDto,
  })
  getGameProgress() {
    const progress = this.gameService.getGameProgress();
    if (!progress) {
      return { message: 'No game is currently running' };
    }
    return progress;
  }

  // Get skills.md file
  @Get('skills')
  getSkills(@Res() res: Response) {
    const skillsPath = join(process.cwd(), 'skills.md');
    res.sendFile(
      skillsPath,
      {
        headers: {
          'Content-Type': 'text/markdown; charset=utf-8',
        },
      },
      (err) => {
        if (err) {
          res.status(500).send('Failed to read skills.md file');
        }
      },
    );
  }
}
