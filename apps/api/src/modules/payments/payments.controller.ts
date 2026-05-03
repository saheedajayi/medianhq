import { Body, Controller, Param, Post } from '@nestjs/common';
import { PaymentsService } from './payments.service';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('initialize/:bookingId')
  initialize(@Param('bookingId') bookingId: string) {
    return this.paymentsService.initialize(bookingId);
  }

  @Post('webhook/paystack')
  paystackWebhook(@Body() payload: unknown) {
    return this.paymentsService.handlePaystackWebhook(payload);
  }
}
