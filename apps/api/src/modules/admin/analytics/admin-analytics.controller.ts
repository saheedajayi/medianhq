import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AdminGuard } from '../../identity/auth/guards/admin.guard';
import { AdminAnalyticsService } from './admin-analytics.service';
import type { VisitorsQueryDto } from './dto/admin-analytics.dto';

@Controller('admin/analytics')
@UseGuards(AdminGuard)
export class AdminAnalyticsController {
  constructor(private readonly analyticsService: AdminAnalyticsService) {}

  @Get('funnel')
  getFunnel() {
    return this.analyticsService.getFunnel();
  }

  @Get('demand-ratio')
  getDemandRatio() {
    return this.analyticsService.getDemandRatio();
  }

  @Get('fill-rate')
  getFillRate() {
    return this.analyticsService.getFillRate();
  }

  @Get('performance')
  getPerformance() {
    return this.analyticsService.getPerformance();
  }

  @Get('response-metrics')
  getResponseMetrics() {
    return this.analyticsService.getResponseMetrics();
  }

  @Get('activity')
  getActivity() {
    return this.analyticsService.getActivity();
  }

  @Get('visitors')
  getVisitors(@Query() query: VisitorsQueryDto) {
    return this.analyticsService.getVisitors(query);
  }
}
