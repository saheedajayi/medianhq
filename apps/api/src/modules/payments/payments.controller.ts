import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { AuthGuard } from '../auth/guards/auth.guard';
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

  @Post('webhook/paystack')
  paystackWebhook(@Body() payload: unknown) {
    return this.paymentsService.handlePaystackWebhook(payload);
  }
}
