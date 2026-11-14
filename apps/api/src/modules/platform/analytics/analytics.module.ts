import { Global, Module } from '@nestjs/common';
import { AuthModule } from '../../identity/auth/auth.module';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsRepository } from './analytics.repository';
import { AnalyticsTrackerService } from './analytics-tracker.service';

/** Global, so any feature can log the events the admin analytics page reads */
@Global()
@Module({
  imports: [AuthModule],
  controllers: [AnalyticsController],
  providers: [AnalyticsTrackerService, AnalyticsRepository],
  exports: [AnalyticsTrackerService],
})
export class AnalyticsModule {}
