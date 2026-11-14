import { Module } from '@nestjs/common';
import { HealthChecksHeartbeatService } from './health-checks-heartbeat.service';
import { HealthChecksRepository } from './health-checks.repository';
import { HealthChecksService } from './health-checks.service';

@Module({
  providers: [
    HealthChecksService,
    HealthChecksRepository,
    HealthChecksHeartbeatService,
  ],
  exports: [HealthChecksService],
})
export class HealthChecksModule {}
