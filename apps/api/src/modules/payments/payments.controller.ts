import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import { PaystackSignatureGuard } from './paystack-signature.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthUser } from '../auth/dto/auth.dto';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @UseGuards(AuthGuard)
  @Post('initialize/:bookingId')
  initialize(
    @CurrentUser() user: AuthUser,
    @Param('bookingId') bookingId: string,
  ) {
    return this.paymentsService.initialize(user, bookingId);
  }

  @Get('verify/:reference')
  verify(@Param('reference') reference: string) {
    return this.paymentsService.verify(reference);
  }

  // Only Paystack can call this: requests must carry its signature of the body
  @UseGuards(PaystackSignatureGuard)
  @Post('webhook/paystack')
  paystackWebhook(@Body() payload: unknown) {
    return this.paymentsService.handlePaystackWebhook(payload);
  }
}
