import { Module } from '@nestjs/common';
import { AuthModule } from '../../identity/auth/auth.module';
import { BackofficeWaitlistController } from './backoffice-waitlist.controller';
import { BackofficeWaitlistRepository } from './backoffice-waitlist.repository';
import { BackofficeWaitlistService } from './backoffice-waitlist.service';

@Module({
  imports: [AuthModule],
  controllers: [BackofficeWaitlistController],
  providers: [BackofficeWaitlistService, BackofficeWaitlistRepository],
})
export class BackofficeWaitlistModule {}
