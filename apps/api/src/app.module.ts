import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { existsSync } from 'node:fs';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AdminModule } from './modules/admin/admin.module';
import { BackofficeWaitlistModule } from './modules/backoffice/waitlist/backoffice-waitlist.module';
import { ContentScannerModule } from './modules/platform/moderation/content-scanner.module';
import { AnalyticsModule } from './modules/platform/analytics/analytics.module';
import { OnboardingEmailsModule } from './modules/platform/onboarding-emails/onboarding-emails.module';
import { HealthChecksModule } from './modules/platform/health-checks/health-checks.module';
import { ContactModule } from './modules/platform/contact/contact.module';
import { AuthModule } from './modules/identity/auth/auth.module';
import { BookingsModule } from './modules/scheduling/bookings/bookings.module';
import { RecordingsModule } from './modules/scheduling/recordings/recordings.module';
import { DatabaseModule } from './database/database.module';
import { MentorsModule } from './modules/profiles/mentors/mentors.module';
import { MenteesModule } from './modules/profiles/mentees/mentees.module';
import { PaymentsModule } from './modules/finance/payments/payments.module';
import { ReviewsModule } from './modules/engagement/reviews/reviews.module';
import { SessionsModule } from './modules/scheduling/sessions/sessions.module';
import { UsersModule } from './modules/identity/users/users.module';
import { WaitlistModule } from './modules/waitlist/waitlist.module';
import { TaxonomyModule } from './modules/profiles/taxonomy/taxonomy.module';
import { UploadsModule } from './modules/platform/uploads/uploads.module';
import { MessagesModule } from './modules/engagement/messages/messages.module';
import { CommunityModule } from './modules/engagement/community/community.module';
import { AchievementsModule } from './modules/engagement/achievements/achievements.module';
import { AsyncQaModule } from './modules/engagement/async-qa/async-qa.module';
import { EarningsModule } from './modules/finance/earnings/earnings.module';
import { ExchangeRatesModule } from './modules/finance/exchange-rates/exchange-rates.module';
import { SettingsModule } from './modules/identity/settings/settings.module';

const envFilePath = ['apps/api/.env.local', '.env.local'].filter((path) =>
  existsSync(path),
);

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath,
    }),
    DatabaseModule,
    ContentScannerModule,
    AnalyticsModule,
    HealthChecksModule,
    ContactModule,
    OnboardingEmailsModule,
    AuthModule,
    UsersModule,
    MentorsModule,
    MenteesModule,
    BookingsModule,
    RecordingsModule,
    PaymentsModule,
    SessionsModule,
    ReviewsModule,
    BackofficeWaitlistModule,
    AdminModule,
    WaitlistModule,
    TaxonomyModule,
    UploadsModule,
    MessagesModule,
    CommunityModule,
    AchievementsModule,
    AsyncQaModule,
    EarningsModule,
    ExchangeRatesModule,
    SettingsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
