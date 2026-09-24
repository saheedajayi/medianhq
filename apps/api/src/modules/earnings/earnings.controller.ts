import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { EarningsService } from './earnings.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthUser } from '../auth/dto/auth.dto';

@Controller('earnings')
export class EarningsController {
  constructor(private readonly earningsService: EarningsService) {}

  @UseGuards(AuthGuard)
  @Get('mentor/summary')
  getMentorSummary(@CurrentUser() user: AuthUser) {
    return this.earningsService.getMentorSummary(user);
  }

  @UseGuards(AuthGuard)
  @Post('mentor/payout')
  requestPayout(
    @CurrentUser() user: AuthUser,
    @Body() dto: { amount: number; accountNumber: string; bankCode: string },
  ) {
    return this.earningsService.requestPayout(user, dto);
  }
}
