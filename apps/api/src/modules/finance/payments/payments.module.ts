import { Module } from '@nestjs/common';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { PaymentsRepository } from './payments.repository';
import { BookingNotificationsModule } from '../../scheduling/booking-notifications/booking-notifications.module';
import { PayoutsModule } from '../payouts/payouts.module';

@Module({
  imports: [BookingNotificationsModule, PayoutsModule],
  controllers: [PaymentsController],
  providers: [PaymentsService, PaymentsRepository],
  exports: [PaymentsService, PaymentsRepository],
})
export class PaymentsModule {}
