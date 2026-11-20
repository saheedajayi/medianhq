import { Module } from '@nestjs/common';
import { PayoutsModule } from '../payouts/payouts.module';
import { EarningsController } from './earnings.controller';
import { EarningsRepository } from './earnings.repository';
import { EarningsService } from './earnings.service';
import { MentorPayoutsService } from './mentor-payouts.service';

@Module({
  imports: [PayoutsModule],
  controllers: [EarningsController],
  providers: [EarningsService, MentorPayoutsService, EarningsRepository],
  exports: [EarningsService],
})
export class EarningsModule {}
