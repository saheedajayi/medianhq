import { Module } from '@nestjs/common';
import { EmailModule } from '../../platform/email/email.module';
import { PayoutsRepository } from './payouts.repository';
import { PayoutsService } from './payouts.service';

@Module({
  imports: [EmailModule],
  providers: [PayoutsService, PayoutsRepository],
  exports: [PayoutsService],
})
export class PayoutsModule {}
