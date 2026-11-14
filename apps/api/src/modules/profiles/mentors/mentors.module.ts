import { Module } from '@nestjs/common';
import { MentorsController } from './mentors.controller';
import { MentorsService } from './mentors.service';
import { MentorsRepository } from './mentors.repository';
import { AuthModule } from '../../identity/auth/auth.module';
import { EmailModule } from '../../platform/email/email.module';

@Module({
  imports: [AuthModule, EmailModule],
  controllers: [MentorsController],
  providers: [MentorsService, MentorsRepository],
  exports: [MentorsService, MentorsRepository],
})
export class MentorsModule {}
