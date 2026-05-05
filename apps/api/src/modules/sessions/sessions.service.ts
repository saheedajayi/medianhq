import { Injectable } from '@nestjs/common';
import { BookingStatus } from '@prisma/client';

@Injectable()
export class SessionsService {
  complete(bookingId: string) {
    return {
      bookingId,
      status: BookingStatus.COMPLETED,
    };
  }
}
