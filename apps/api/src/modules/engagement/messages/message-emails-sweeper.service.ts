import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { MessageEmailsService } from './message-emails.service';

const SWEEP_INTERVAL_MS = 60 * 1000;
/** After a restart, catch up on messages that passed the wait while the server was down */
const CATCH_UP_MS = 30 * 60 * 1000;

/** Emails people about messages left unread, checking every minute */
@Injectable()
export class MessageEmailsSweeperService
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(MessageEmailsSweeperService.name);
  private timer?: NodeJS.Timeout;
  private isRunning = false;
  private lastRunAt = new Date(Date.now() - CATCH_UP_MS);

  constructor(private readonly messageEmails: MessageEmailsService) {}

  onModuleInit() {
    if (process.env.MESSAGE_EMAILS_DISABLED === 'true') return;
    // A laptop running against the shared database would email real people
    // links to localhost, so these only go out from a deployed server
    const webOrigin = process.env.WEB_ORIGIN ?? '';
    if (!webOrigin || /\/\/(localhost|127\.0\.0\.1)(:\d+)?/i.test(webOrigin)) {
      this.logger.log('New message emails are off: WEB_ORIGIN is local.');
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
      const sent = await this.messageEmails.sendDue(this.lastRunAt, now);
      this.lastRunAt = now;
      if (sent) this.logger.log(`Sent ${sent} new message emails`);
    } catch (err) {
      // lastRunAt stays put, so the next run retries this window
      this.logger.error('New message email run failed', err);
    } finally {
      this.isRunning = false;
    }
  }
}
