import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AdminGuard } from '../../identity/auth/guards/admin.guard';
import { AdminOverviewService } from './admin-overview.service';

@Controller('admin/overview')
@UseGuards(AdminGuard)
export class AdminOverviewController {
  constructor(private readonly overviewService: AdminOverviewService) {}

  @Get()
  getOverview(@Query('range') range?: string) {
    return this.overviewService.getOverview(range);
  }
}
