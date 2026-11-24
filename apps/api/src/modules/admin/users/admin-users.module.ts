import { Module } from '@nestjs/common';
import { AuthModule } from '../../identity/auth/auth.module';
import { EmailModule } from '../../platform/email/email.module';
import { AdminUsersController } from './admin-users.controller';
import { AdminUsersRepository } from './admin-users.repository';
import { AdminUsersService } from './admin-users.service';

@Module({
  imports: [AuthModule, EmailModule],
  controllers: [AdminUsersController],
  providers: [AdminUsersService, AdminUsersRepository],
})
export class AdminUsersModule {}
