import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { RecordingsService } from './recordings.service';

const SWEEP_INTERVAL_MS = 60 * 60 * 1000;

/**
 * Deletes recordings once they are past retention, every hour. Each file
 * is marked deleted only after the bucket confirms, so a failed delete is
 * retried on the next run.
 */
@Injectable()
export class RecordingsSweeperService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RecordingsSweeperService.name);
  private timer?: NodeJS.Timeout;
  private isRunning = false;

  constructor(private readonly recordingsService: RecordingsService) {}

  onModuleInit() {
    if (process.env.RECORDINGS_SWEEP_DISABLED === 'true') return;
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
      await this.recordingsService.sweepExpired();
    } catch (err) {
      this.logger.error('Recording retention sweep failed', err);
    } finally {
      this.isRunning = false;
    }
  }
}
