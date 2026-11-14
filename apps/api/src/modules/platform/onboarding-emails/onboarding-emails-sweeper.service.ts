import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { OnboardingEmailsService } from './onboarding-emails.service';

const SWEEP_INTERVAL_MS = 30 * 60 * 1000;
/** After a restart, catch up on steps that fell due while the server was down */
const CATCH_UP_MS = 3 * 60 * 60 * 1000;

/** Sends the onboarding steps that fell due, every 30 minutes */
@Injectable()
export class OnboardingEmailsSweeperService
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(OnboardingEmailsSweeperService.name);
  private timer?: NodeJS.Timeout;
  private isRunning = false;
  private lastRunAt = new Date(Date.now() - CATCH_UP_MS);

  constructor(private readonly onboardingEmails: OnboardingEmailsService) {}

  onModuleInit() {
    if (process.env.ONBOARDING_EMAILS_DISABLED === 'true') return;
    // A laptop running against the shared database would email real people
    // links to localhost, so the series only runs on a deployed server
    const webOrigin = process.env.WEB_ORIGIN ?? '';
    if (!webOrigin || /\/\/(localhost|127\.0\.0\.1)(:\d+)?/i.test(webOrigin)) {
      this.logger.log('Onboarding emails are off: WEB_ORIGIN is local.');
      return;
    }
    this.timer = setInterval(() => void this.run(), SWEEP_INTERVAL_MS);
    this.timer.unref();
  }

  onModuleDestroy() {
    if (this.timer) clearInterval(this.timer);
  }

  async run() {
    if (this.isRunning) return;
    this.isRunning = true;
    const now = new Date();
    try {
      const sent = await this.onboardingEmails.sendDue(this.lastRunAt, now);
      this.lastRunAt = now;
      if (sent) this.logger.log(`Sent ${sent} onboarding emails`);
    } catch (err) {
      // lastRunAt stays put, so the next run retries this window
      this.logger.error('Onboarding email run failed', err);
    } finally {
      this.isRunning = false;
    }
  }
}
