import { Module } from '@nestjs/common';
import { BettingService } from './betting.service';
import { UserModule } from '../user/user.module';

@Module({
  imports: [UserModule],
  providers: [BettingService],
  exports: [BettingService],
})
export class BettingModule {}
