import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../../identity/auth/decorators/current-user.decorator';
import type { AdminActor } from '../common/admin-actor';
import { AdminSectionAccess } from '../../identity/auth/decorators/admin-section.decorator';
import { AdminGuard } from '../../identity/auth/guards/admin.guard';
import { AdminFinanceService } from './admin-finance.service';
import type {
  FinanceReasonDto,
  PayoutsQueryDto,
  RefundNoteDto,
  RefundsQueryDto,
  RevenueQueryDto,
  ServiceReportQueryDto,
} from './dto/admin-finance.dto';

@Controller('admin/finance')
@UseGuards(AdminGuard)
@AdminSectionAccess('finance')
export class AdminFinanceController {
  constructor(private readonly financeService: AdminFinanceService) {}

  @Get('revenue')
  getRevenue(@Query() query: RevenueQueryDto) {
    return this.financeService.getRevenue(query);
  }

  @Get('payouts')
  getPayouts(@Query() query: PayoutsQueryDto) {
    return this.financeService.getPayouts(query);
  }

  @Get('payouts/export')
  exportPayouts(@Query() query: PayoutsQueryDto) {
    return this.financeService.exportPayouts(query);
  }

  @Get('service/sessions')
  getSessionReport(@Query() query: ServiceReportQueryDto) {
    return this.financeService.getSessionReport(query);
  }

  @Get('service/sessions/export')
  exportSessionReport(@Query() query: ServiceReportQueryDto) {
    return this.financeService.exportSessionReport(query);
  }

  @Get('service/mentors')
  getMentorReport(@Query() query: ServiceReportQueryDto) {
    return this.financeService.getMentorReport(query);
  }

  @Get('service/mentors/export')
  exportMentorReport(@Query() query: ServiceReportQueryDto) {
    return this.financeService.exportMentorReport(query);
  }

  @Get('refunds')
  getRefunds(@Query() query: RefundsQueryDto) {
    return this.financeService.getRefunds(query);
  }

  @Post('refunds/:paymentId/approve')
  approveRefund(
    @Param('paymentId') paymentId: string,
    @CurrentUser() admin?: AdminActor,
  ) {
    return this.financeService.approveRefund(paymentId, admin);
  }

  @Post('refunds/:paymentId/reject')
  rejectRefund(
    @Param('paymentId') paymentId: string,
    @Body() dto: FinanceReasonDto,
    @CurrentUser() admin?: AdminActor,
  ) {
    return this.financeService.rejectRefund(paymentId, dto.reason, admin);
  }

  @Post('refunds/:paymentId/request-info')
  requestRefundInfo(
    @Param('paymentId') paymentId: string,
    @CurrentUser() admin?: AdminActor,
  ) {
    return this.financeService.requestRefundInfo(paymentId, admin);
  }

  @Patch('refunds/:paymentId/note')
  saveRefundNote(
    @Param('paymentId') paymentId: string,
    @Body() dto: RefundNoteDto,
    @CurrentUser() admin?: AdminActor,
  ) {
    return this.financeService.saveRefundNote(paymentId, dto.note, admin);
  }

  @Post('payouts/:payoutId/approve')
  approvePayout(
    @Param('payoutId') payoutId: string,
    @CurrentUser() admin?: AdminActor,
  ) {
    return this.financeService.approvePayout(payoutId, admin);
  }

  @Post('payouts/:payoutId/reject')
  rejectPayout(
    @Param('payoutId') payoutId: string,
    @Body() dto: FinanceReasonDto,
    @CurrentUser() admin?: AdminActor,
  ) {
    return this.financeService.rejectPayout(payoutId, dto.reason, admin);
  }

  @Post('payouts/:payoutId/sync')
  syncPayout(@Param('payoutId') payoutId: string) {
    return this.financeService.syncPayout(payoutId);
  }

  @Get('refunds/export')
  exportRefunds(@Query() query: RefundsQueryDto) {
    return this.financeService.exportRefunds(query);
  }
}
