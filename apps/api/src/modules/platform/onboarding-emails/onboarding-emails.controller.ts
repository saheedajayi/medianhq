import { Body, Controller, HttpCode, Ip, Post } from '@nestjs/common';
import { AuthRateLimiterService } from '../../identity/auth/auth-rate-limiter.service';
import { OnboardingEmailsService } from './onboarding-emails.service';
import type { UnsubscribeDto } from './dto/unsubscribe.dto';

const UNSUBSCRIBE_LIMIT = 20;
const UNSUBSCRIBE_WINDOW_MS = 60 * 60 * 1000;

@Controller('emails')
export class OnboardingEmailsController {
  constructor(
    private readonly onboardingEmails: OnboardingEmailsService,
    private readonly rateLimiter: AuthRateLimiterService,
  ) {}

  /** The unsubscribe page posts here with the signed link from the email */
  @Post('unsubscribe')
  @HttpCode(200)
  unsubscribe(@Ip() ip: string, @Body() dto: UnsubscribeDto) {
    this.rateLimiter.checkLimit(
      `unsubscribe:${ip}`,
      UNSUBSCRIBE_LIMIT,
      UNSUBSCRIBE_WINDOW_MS,
      'Too many attempts. Please try again in an hour.',
    );
    return this.onboardingEmails.unsubscribe(dto?.userId, dto?.token);
  }
}
