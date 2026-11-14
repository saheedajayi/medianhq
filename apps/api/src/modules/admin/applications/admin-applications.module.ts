import { Module } from '@nestjs/common';
import { AuthModule } from '../../identity/auth/auth.module';
import { EmailModule } from '../../platform/email/email.module';
import { UploadsModule } from '../../platform/uploads/uploads.module';
import { AdminApplicationsController } from './admin-applications.controller';
import { AdminApplicationsRepository } from './admin-applications.repository';
import { AdminApplicationsService } from './admin-applications.service';

@Module({
  imports: [AuthModule, EmailModule, UploadsModule],
  controllers: [AdminApplicationsController],
  providers: [AdminApplicationsService, AdminApplicationsRepository],
  exports: [AdminApplicationsService],
})
export class AdminApplicationsModule {}
