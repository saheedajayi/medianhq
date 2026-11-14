import { Module } from '@nestjs/common';
import { RecordingStorage } from './recording-storage';
import { RecordingsController } from './recordings.controller';
import { RecordingsRepository } from './recordings.repository';
import { RecordingsService } from './recordings.service';
import { RecordingsSweeperService } from './recordings-sweeper.service';

@Module({
  controllers: [RecordingsController],
  providers: [
    RecordingsService,
    RecordingsRepository,
    RecordingsSweeperService,
    { provide: RecordingStorage, useFactory: () => new RecordingStorage() },
  ],
  exports: [RecordingsService],
})
export class RecordingsModule {}
