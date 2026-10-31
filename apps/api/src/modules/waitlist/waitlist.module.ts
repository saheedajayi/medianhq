import { Module } from '@nestjs/common';
import { AuthModule } from '../identity/auth/auth.module';
import { EmailModule } from '../platform/email/email.module';
import { WaitlistController } from './waitlist.controller';
import { WaitlistRepository } from './waitlist.repository';
import { WaitlistService } from './waitlist.service';

@Module({
  imports: [AuthModule, EmailModule],
  controllers: [WaitlistController],
  providers: [WaitlistService, WaitlistRepository],
})
export class WaitlistModule {}
