import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../../identity/auth/decorators/current-user.decorator';
import type { AdminActor } from '../common/admin-actor';
import type { UpdateAdminDto } from './dto/admin-settings.dto';
import { AdminSectionAccess } from '../../identity/auth/decorators/admin-section.decorator';
import { AdminGuard } from '../../identity/auth/guards/admin.guard';
import { AdminSettingsService } from './admin-settings.service';

@Controller('admin/settings')
@UseGuards(AdminGuard)
@AdminSectionAccess('settings')
export class AdminSettingsController {
  constructor(private readonly settingsService: AdminSettingsService) {}

  @Get('admins')
  listAdmins() {
    return this.settingsService.listAdmins();
  }

  @Patch('admins/:adminId')
  updateAdmin(
    @Param('adminId') adminId: string,
    @Body() dto: UpdateAdminDto,
    @CurrentUser() admin?: AdminActor,
  ) {
    return this.settingsService.updateAdmin(adminId, dto, admin);
  }

  @Get('audit-log')
  getAuditLog() {
    return this.settingsService.getAuditLog();
  }
}
