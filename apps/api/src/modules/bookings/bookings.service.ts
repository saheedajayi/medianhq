import { Injectable } from '@nestjs/common';
import { BookingStatus } from '@median/shared';
import type { CreateBookingDto } from './dto/create-booking.dto';

@Injectable()
export class BookingsService {
  create(dto: CreateBookingDto) {
    return {
      status: BookingStatus.PendingPayment,
      booking: dto,
    };
  }

  mine() {
    return [];
  }
}
