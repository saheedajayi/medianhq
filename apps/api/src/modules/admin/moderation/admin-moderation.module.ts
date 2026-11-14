import { Module } from '@nestjs/common';
import { AuthModule } from '../../identity/auth/auth.module';
import { AdminModerationController } from './admin-moderation.controller';
import { AdminModerationRepository } from './admin-moderation.repository';
import { AdminModerationService } from './admin-moderation.service';

@Module({
  imports: [AuthModule],
  controllers: [AdminModerationController],
  providers: [AdminModerationService, AdminModerationRepository],
})
export class AdminModerationModule {}
