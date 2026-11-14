import { Module } from '@nestjs/common';
import { AuthModule } from '../../identity/auth/auth.module';
import { AdminOverviewController } from './admin-overview.controller';
import { AdminOverviewRepository } from './admin-overview.repository';
import { AdminOverviewService } from './admin-overview.service';

@Module({
  imports: [AuthModule],
  controllers: [AdminOverviewController],
  providers: [AdminOverviewService, AdminOverviewRepository],
})
export class AdminOverviewModule {}
