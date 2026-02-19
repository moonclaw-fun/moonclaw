import { Module } from '@nestjs/common';
import { GameService } from './game.service';
import { GameController } from './game.controller';
import { GameGateway } from './game.gateway';
import { GameEngine } from './game.engine';
import { BettingModule } from '../betting/betting.module';
import { UserModule } from '../user/user.module';

@Module({
  imports: [BettingModule, UserModule],
  providers: [GameService, GameGateway, GameEngine],
  controllers: [GameController],
  exports: [GameService],
})
export class GameModule {}
