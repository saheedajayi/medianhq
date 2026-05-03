import { Injectable } from '@nestjs/common';

@Injectable()
export class PaymentsService {
  initialize(bookingId: string) {
    return {
      bookingId,
      provider: 'PAYSTACK',
      status: 'PENDING_IMPLEMENTATION',
    };
  }

  handlePaystackWebhook(payload: unknown) {
    return {
      received: true,
      payload,
    };
  }
}
