import { Module } from '@nestjs/common';
import { AuthModule } from '../../identity/auth/auth.module';
import { EmailModule } from '../../platform/email/email.module';
import { AdminModerationController } from './admin-moderation.controller';
import { AdminModerationRepository } from './admin-moderation.repository';
import { AdminModerationService } from './admin-moderation.service';

@Module({
  imports: [AuthModule, EmailModule],
  controllers: [AdminModerationController],
  providers: [AdminModerationService, AdminModerationRepository],
})
export class AdminModerationModule {}
