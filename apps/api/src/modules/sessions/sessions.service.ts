import { Injectable } from '@nestjs/common';
import { BookingStatus } from '@median/shared';

@Injectable()
export class SessionsService {
  complete(bookingId: string) {
    return {
      bookingId,
      status: BookingStatus.Completed,
    };
  }
}
