import { Module } from '@nestjs/common';
import { AuthModule } from '../../identity/auth/auth.module';
import { AdminSettingsController } from './admin-settings.controller';
import { AdminSettingsRepository } from './admin-settings.repository';
import { AdminSettingsService } from './admin-settings.service';

@Module({
  imports: [AuthModule],
  controllers: [AdminSettingsController],
  providers: [AdminSettingsService, AdminSettingsRepository],
})
export class AdminSettingsModule {}
