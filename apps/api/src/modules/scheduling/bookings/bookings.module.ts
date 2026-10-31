import { Module } from '@nestjs/common';
import { BookingsController } from './bookings.controller';
import { BookingsService } from './bookings.service';
import { BookingsRepository } from './bookings.repository';
import { BookingsSweeperService } from './bookings-sweeper.service';
import { PaymentsModule } from '../../finance/payments/payments.module';
import { BookingNotificationsModule } from '../booking-notifications/booking-notifications.module';

@Module({
  imports: [PaymentsModule, BookingNotificationsModule],
  controllers: [BookingsController],
  providers: [BookingsService, BookingsRepository, BookingsSweeperService],
  exports: [BookingsService, BookingsRepository],
})
export class BookingsModule {}
