import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { EmailModule } from '../email/email.module';
import { WaitlistController } from './waitlist.controller';
import { WaitlistRepository } from './waitlist.repository';
import { WaitlistService } from './waitlist.service';

@Module({
  imports: [AuthModule, EmailModule],
  controllers: [WaitlistController],
  providers: [WaitlistService, WaitlistRepository],
})
export class WaitlistModule {}
