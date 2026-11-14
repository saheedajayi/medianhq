import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { HealthChecksService } from './health-checks.service';

const CHECK_INTERVAL_MS = 60 * 1000;
// Old checks are cleared once an hour
const PRUNE_EVERY_RUNS = 60;

/** Runs the health check every minute */
@Injectable()
export class HealthChecksHeartbeatService
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(HealthChecksHeartbeatService.name);
  private timer?: NodeJS.Timeout;
  private isRunning = false;
  private runs = 0;

  constructor(private readonly healthChecks: HealthChecksService) {}

  onModuleInit() {
    if (process.env.HEALTH_CHECKS_DISABLED === 'true') return;
    this.timer = setInterval(() => void this.run(), CHECK_INTERVAL_MS);
    this.timer.unref();
  }

  onModuleDestroy() {
    if (this.timer) clearInterval(this.timer);
  }

  private async run() {
    if (this.isRunning) return;
    this.isRunning = true;
    try {
      await this.healthChecks.runCheck();
      this.runs += 1;
      if (this.runs % PRUNE_EVERY_RUNS === 0) await this.healthChecks.prune();
    } catch (err) {
      this.logger.error('Health check failed', err);
    } finally {
      this.isRunning = false;
    }
  }
}
