import { Module } from '@nestjs/common';
import { AuthModule } from '../../identity/auth/auth.module';
import { AdminAnalyticsController } from './admin-analytics.controller';
import { AdminAnalyticsRepository } from './admin-analytics.repository';
import { AdminAnalyticsService } from './admin-analytics.service';

@Module({
  imports: [AuthModule],
  controllers: [AdminAnalyticsController],
  providers: [AdminAnalyticsService, AdminAnalyticsRepository],
})
export class AdminAnalyticsModule {}
