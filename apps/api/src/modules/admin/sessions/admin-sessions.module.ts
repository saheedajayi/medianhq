import { Module } from '@nestjs/common';
import { AuthModule } from '../../identity/auth/auth.module';
import { RecordingsModule } from '../../scheduling/recordings/recordings.module';
import { AdminSessionsController } from './admin-sessions.controller';
import { AdminSessionsRepository } from './admin-sessions.repository';
import { AdminSessionsService } from './admin-sessions.service';

@Module({
  imports: [AuthModule, RecordingsModule],
  controllers: [AdminSessionsController],
  providers: [AdminSessionsService, AdminSessionsRepository],
})
export class AdminSessionsModule {}
