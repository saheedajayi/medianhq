import { Module } from '@nestjs/common';
import { AdminAnalyticsModule } from './analytics/admin-analytics.module';
import { AdminApplicationsModule } from './applications/admin-applications.module';
import { AdminFinanceModule } from './finance/admin-finance.module';
import { AdminInvitesModule } from './invites/admin-invites.module';
import { AdminModerationModule } from './moderation/admin-moderation.module';
import { AdminOverviewModule } from './overview/admin-overview.module';
import { AdminSessionsModule } from './sessions/admin-sessions.module';
import { AdminSettingsModule } from './settings/admin-settings.module';
import { AdminUsersModule } from './users/admin-users.module';

/** Every section of the admin area; each lives in its own folder under admin/ */
@Module({
  imports: [
    AdminOverviewModule,
    AdminUsersModule,
    AdminApplicationsModule,
    AdminSessionsModule,
    AdminModerationModule,
    AdminFinanceModule,
    AdminAnalyticsModule,
    AdminSettingsModule,
    AdminInvitesModule,
  ],
})
export class AdminModule {}
