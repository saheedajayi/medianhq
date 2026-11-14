import { Module } from '@nestjs/common';
import { PaymentsModule } from '../../finance/payments/payments.module';
import { PayoutsModule } from '../../finance/payouts/payouts.module';
import { AuthModule } from '../../identity/auth/auth.module';
import { EmailModule } from '../../platform/email/email.module';
import { AdminFinanceController } from './admin-finance.controller';
import { AdminFinanceRepository } from './admin-finance.repository';
import { AdminFinanceService } from './admin-finance.service';

@Module({
  imports: [AuthModule, EmailModule, PaymentsModule, PayoutsModule],
  controllers: [AdminFinanceController],
  providers: [AdminFinanceService, AdminFinanceRepository],
})
export class AdminFinanceModule {}
