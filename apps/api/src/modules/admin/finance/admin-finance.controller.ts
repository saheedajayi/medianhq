import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AdminGuard } from '../../identity/auth/guards/admin.guard';
import { AdminFinanceService } from './admin-finance.service';
import type {
  PayoutsQueryDto,
  RefundsQueryDto,
  RevenueQueryDto,
  ServiceReportQueryDto,
} from './dto/admin-finance.dto';

@Controller('admin/finance')
@UseGuards(AdminGuard)
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

  @Get('refunds/export')
  exportRefunds(@Query() query: RefundsQueryDto) {
    return this.financeService.exportRefunds(query);
  }
}
