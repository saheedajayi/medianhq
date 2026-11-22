import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { AccountService } from './account.service';

const SWEEP_INTERVAL_MS = 60 * 60 * 1000;

/**
 * Erases accounts whose deletion grace period has passed, once an hour.
 * Erasing clears the schedule, so overlapping runs across several API
 * instances find nothing left to do.
 */
@Injectable()
export class AccountSweeperService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(AccountSweeperService.name);
  private timer?: NodeJS.Timeout;
  private isRunning = false;

  constructor(private readonly accountService: AccountService) {}

  onModuleInit() {
    if (process.env.ACCOUNT_SWEEP_DISABLED === 'true') return;
    this.timer = setInterval(() => void this.run(), SWEEP_INTERVAL_MS);
    this.timer.unref();
  }

  onModuleDestroy() {
    if (this.timer) clearInterval(this.timer);
  }

  private async run() {
    if (this.isRunning) return;
    this.isRunning = true;
    try {
      await this.accountService.sweep();
    } catch (err) {
      this.logger.error('Account deletion sweep failed', err);
    } finally {
      this.isRunning = false;
    }
  }
}
