import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { AuthGuard } from '../../identity/auth/guards/auth.guard';
import { PaystackSignatureGuard } from './paystack-signature.guard';
import { FlutterwaveSignatureGuard } from './flutterwave-signature.guard';
import { CurrentUser } from '../../identity/auth/decorators/current-user.decorator';
import type { AuthUser } from '../../identity/auth/dto/auth.dto';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  /** What the mentee would pay in a currency, before paying */
  @UseGuards(AuthGuard)
  @Get('quote/:bookingId')
  quote(
    @CurrentUser() user: AuthUser,
    @Param('bookingId') bookingId: string,
    @Query('currency') currency?: string,
  ) {
    return this.paymentsService.quote(user, bookingId, currency || 'NGN');
  }

  @UseGuards(AuthGuard)
  @Post('initialize/:bookingId')
  initialize(
    @CurrentUser() user: AuthUser,
    @Param('bookingId') bookingId: string,
    @Body() body?: { currency?: string },
  ) {
    return this.paymentsService.initialize(
      user,
      bookingId,
      body?.currency || 'NGN',
    );
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

  // Only Flutterwave can call this: requests must carry the dashboard's secret hash
  @UseGuards(FlutterwaveSignatureGuard)
  @Post('webhook/flutterwave')
  flutterwaveWebhook(@Body() payload: unknown) {
    return this.paymentsService.handleFlutterwaveWebhook(payload);
  }
}
