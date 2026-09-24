import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { SettingsService, type UpdateSettingsDto } from './settings.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthUser } from '../auth/dto/auth.dto';

@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @UseGuards(AuthGuard)
  @Get('me')
  getMySettings(@CurrentUser() user: AuthUser) {
    return this.settingsService.getMySettings(user);
  }

  @UseGuards(AuthGuard)
  @Patch('me')
  updateMySettings(@CurrentUser() user: AuthUser, @Body() dto: UpdateSettingsDto) {
    return this.settingsService.updateMySettings(user, dto);
  }
}
