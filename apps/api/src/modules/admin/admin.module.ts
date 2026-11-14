import { Module } from '@nestjs/common';
import { AuthModule } from '../identity/auth/auth.module';
import { UploadsModule } from '../platform/uploads/uploads.module';
import { AdminApplicationsModule } from './applications/admin-applications.module';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';

@Module({
  imports: [AuthModule, UploadsModule, AdminApplicationsModule],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
