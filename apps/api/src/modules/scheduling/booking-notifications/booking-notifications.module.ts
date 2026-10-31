import { Module } from '@nestjs/common';
import { EmailModule } from '../../platform/email/email.module';
import { BookingEventsService } from './booking-events.service';
import { BookingNotificationsService } from './booking-notifications.service';

// Separate from bookings and payments so both can send booking emails without importing each other
@Module({
  imports: [EmailModule],
  providers: [BookingNotificationsService, BookingEventsService],
  exports: [BookingNotificationsService, BookingEventsService],
})
export class BookingNotificationsModule {}
