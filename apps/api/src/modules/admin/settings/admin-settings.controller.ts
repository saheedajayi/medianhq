import { Controller, Get, UseGuards } from '@nestjs/common';
import { AdminGuard } from '../../identity/auth/guards/admin.guard';
import { AdminSettingsService } from './admin-settings.service';

@Controller('admin/settings')
@UseGuards(AdminGuard)
export class AdminSettingsController {
  constructor(private readonly settingsService: AdminSettingsService) {}

  @Get('audit-log')
  getAuditLog() {
    return this.settingsService.getAuditLog();
  }
}
