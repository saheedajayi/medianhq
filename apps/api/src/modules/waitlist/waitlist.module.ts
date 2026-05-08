import { Module } from '@nestjs/common';
import { EmailModule } from '../email/email.module';
import { WaitlistController } from './waitlist.controller';
import { WaitlistRepository } from './waitlist.repository';
import { WaitlistService } from './waitlist.service';

@Module({
  imports: [EmailModule],
  controllers: [WaitlistController],
  providers: [WaitlistService, WaitlistRepository],
})
export class WaitlistModule {}
