import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AdminSectionAccess } from '../../identity/auth/decorators/admin-section.decorator';
import { AdminGuard } from '../../identity/auth/guards/admin.guard';
import { AdminOverviewService } from './admin-overview.service';

@Controller('admin/overview')
@UseGuards(AdminGuard)
@AdminSectionAccess('overview')
export class AdminOverviewController {
  constructor(private readonly overviewService: AdminOverviewService) {}

  @Get()
  getOverview(@Query('range') range?: string) {
    return this.overviewService.getOverview(range);
  }
}
