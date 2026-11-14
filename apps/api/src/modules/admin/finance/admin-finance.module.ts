import { Module } from '@nestjs/common';
import { AuthModule } from '../../identity/auth/auth.module';
import { AdminFinanceController } from './admin-finance.controller';
import { AdminFinanceRepository } from './admin-finance.repository';
import { AdminFinanceService } from './admin-finance.service';

@Module({
  imports: [AuthModule],
  controllers: [AdminFinanceController],
  providers: [AdminFinanceService, AdminFinanceRepository],
})
export class AdminFinanceModule {}
