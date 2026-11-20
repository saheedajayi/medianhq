import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../../identity/auth/decorators/current-user.decorator';
import type { AuthUser } from '../../identity/auth/dto/auth.dto';
import { AuthGuard } from '../../identity/auth/guards/auth.guard';
import type {
  EarningsQueryDto,
  PayoutAccountDto,
  PayoutsQueryDto,
  RequestPayoutDto,
} from './dto/earnings.dto';
import { EarningsService } from './earnings.service';
import { MentorPayoutsService } from './mentor-payouts.service';

@Controller('earnings/mentor')
@UseGuards(AuthGuard)
export class EarningsController {
  constructor(
    private readonly earningsService: EarningsService,
    private readonly mentorPayoutsService: MentorPayoutsService,
  ) {}

  @Get('summary')
  getMentorSummary(@CurrentUser() user: AuthUser) {
    return this.earningsService.getMentorSummary(user);
  }

  @Get('sessions')
  getEarnings(@CurrentUser() user: AuthUser, @Query() query: EarningsQueryDto) {
    return this.earningsService.getEarnings(user, query);
  }

  @Get('sessions/:earningId')
  getEarning(
    @CurrentUser() user: AuthUser,
    @Param('earningId') earningId: string,
  ) {
    return this.earningsService.getEarning(user, earningId);
  }

  @Get('banks')
  listBanks(@CurrentUser() user: AuthUser) {
    return this.mentorPayoutsService.listBanks(user);
  }

  @Get('payout-account')
  getPayoutAccount(@CurrentUser() user: AuthUser) {
    return this.mentorPayoutsService.getAccount(user);
  }

  @Post('payout-account/resolve')
  resolvePayoutAccount(
    @CurrentUser() user: AuthUser,
    @Body() dto: PayoutAccountDto,
  ) {
    return this.mentorPayoutsService.resolveAccount(user, dto);
  }

  @Put('payout-account')
  savePayoutAccount(
    @CurrentUser() user: AuthUser,
    @Body() dto: PayoutAccountDto,
  ) {
    return this.mentorPayoutsService.saveAccount(user, dto);
  }

  @Get('payouts')
  getPayouts(@CurrentUser() user: AuthUser, @Query() query: PayoutsQueryDto) {
    return this.mentorPayoutsService.getPayouts(user, query);
  }

  @Get('payouts/:payoutId/statement')
  getPayoutStatement(
    @CurrentUser() user: AuthUser,
    @Param('payoutId') payoutId: string,
  ) {
    return this.mentorPayoutsService.getStatement(user, payoutId);
  }

  @Post('payout')
  requestPayout(@CurrentUser() user: AuthUser, @Body() dto: RequestPayoutDto) {
    return this.mentorPayoutsService.requestPayout(user, dto);
  }
}
