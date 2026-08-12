import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { existsSync } from 'node:fs';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AdminModule } from './modules/admin/admin.module';
import { AuthModule } from './modules/auth/auth.module';
import { BookingsModule } from './modules/bookings/bookings.module';
import { DatabaseModule } from './database/database.module';
import { MentorsModule } from './modules/mentors/mentors.module';
import { MenteesModule } from './modules/mentees/mentees.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { SessionsModule } from './modules/sessions/sessions.module';
import { UsersModule } from './modules/users/users.module';
import { WaitlistModule } from './modules/waitlist/waitlist.module';
import { TaxonomyModule } from './modules/taxonomy/taxonomy.module';
import { UploadsModule } from './modules/uploads/uploads.module';

const envFilePath = [
  'apps/api/.env.local',
  '.env.local',
].filter((path) => existsSync(path));

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath,
    }),
    DatabaseModule,
    AuthModule,
    UsersModule,
    MentorsModule,
    MenteesModule,
    BookingsModule,
    PaymentsModule,
    SessionsModule,
    ReviewsModule,
    AdminModule,
    WaitlistModule,
    TaxonomyModule,
    UploadsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
