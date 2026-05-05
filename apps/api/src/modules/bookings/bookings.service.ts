import { Injectable } from '@nestjs/common';
import { BookingStatus } from '@prisma/client';
import type { CreateBookingDto } from './dto/create-booking.dto';

@Injectable()
export class BookingsService {
  create(dto: CreateBookingDto) {
    return {
      status: BookingStatus.PENDING_PAYMENT,
      booking: dto,
    };
  }

  mine() {
    return [];
  }
}
