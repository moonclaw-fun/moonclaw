import { Module, OnModuleInit } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';

import { UserModule } from './user/user.module';
import { BettingModule } from './betting/betting.module';
import { GameModule } from './game/game.module';
import { HealthCheckModule } from './health-check/health-check.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({ envFilePath: '.env', isGlobal: true }),
    HealthCheckModule,
    UserModule,
    BettingModule,
    GameModule,
  ],
})
export class AppModule implements OnModuleInit {
  async onModuleInit() {
    console.log('🎮 Werewolf Betting Game Server Started!');
    console.log('📡 WebSocket: / (root namespace)' );
    console.log('🔗 API endpoints: /api/game/*');
  }
}
