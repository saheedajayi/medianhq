import { Module } from '@nestjs/common';
import { BookingsModule } from '../../scheduling/bookings/bookings.module';
import { AccountController } from './account.controller';
import { AccountRepository } from './account.repository';
import { AccountService } from './account.service';
import { AccountSweeperService } from './account-sweeper.service';

@Module({
  imports: [BookingsModule],
  controllers: [AccountController],
  providers: [AccountService, AccountRepository, AccountSweeperService],
})
export class AccountModule {}
