import { Module } from '@nestjs/common';
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

@Module({
  imports: [
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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
