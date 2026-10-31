import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UploadsController } from './uploads.controller';
import { UploadsService } from './uploads.service';
import { UploadsRepository } from './uploads.repository';

@Module({
  imports: [ConfigModule],
  controllers: [UploadsController],
  providers: [UploadsService, UploadsRepository],
  exports: [UploadsService, UploadsRepository],
})
export class UploadsModule {}
