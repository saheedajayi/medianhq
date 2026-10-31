import { Module } from '@nestjs/common';
import { AuthModule } from '../identity/auth/auth.module';
import { EmailModule } from '../platform/email/email.module';
import { UploadsModule } from '../platform/uploads/uploads.module';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';

@Module({
  imports: [AuthModule, EmailModule, UploadsModule],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
