import { Module } from '@nestjs/common';
import { AuthModule } from '../../identity/auth/auth.module';
import { EmailModule } from '../email/email.module';
import { OnboardingEmailsController } from './onboarding-emails.controller';
import { OnboardingEmailsRepository } from './onboarding-emails.repository';
import { OnboardingEmailsService } from './onboarding-emails.service';
import { OnboardingEmailsSweeperService } from './onboarding-emails-sweeper.service';

@Module({
  imports: [AuthModule, EmailModule],
  controllers: [OnboardingEmailsController],
  providers: [
    OnboardingEmailsService,
    OnboardingEmailsRepository,
    OnboardingEmailsSweeperService,
  ],
})
export class OnboardingEmailsModule {}
