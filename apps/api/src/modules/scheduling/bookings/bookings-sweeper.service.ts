import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { BookingsService } from './bookings.service';

const SWEEP_INTERVAL_MS = 60 * 1000;

/**
 * Runs the booking sweep every minute: expires requests the mentor never
 * answered and settles finished sessions. Every change it makes is
 * conditional on the booking's current status, so overlapping runs across
 * several API instances are harmless.
 */
@Injectable()
export class BookingsSweeperService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(BookingsSweeperService.name);
  private timer?: NodeJS.Timeout;
  private isRunning = false;

  constructor(private readonly bookingsService: BookingsService) {}

  onModuleInit() {
    if (process.env.BOOKINGS_SWEEP_DISABLED === 'true') return;
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
      await this.bookingsService.sweep();
    } catch (err) {
      this.logger.error('Booking sweep failed', err);
    } finally {
      this.isRunning = false;
    }
  }
}
