import { Module } from '@nestjs/common';
import { AuthModule } from '../../identity/auth/auth.module';
import { EmailModule } from '../../platform/email/email.module';
import {
  AdminInviteAcceptanceController,
  AdminInvitesController,
} from './admin-invites.controller';
import { AdminInvitesRepository } from './admin-invites.repository';
import { AdminInvitesService } from './admin-invites.service';

@Module({
  imports: [AuthModule, EmailModule],
  controllers: [AdminInvitesController, AdminInviteAcceptanceController],
  providers: [AdminInvitesService, AdminInvitesRepository],
})
export class AdminInvitesModule {}
