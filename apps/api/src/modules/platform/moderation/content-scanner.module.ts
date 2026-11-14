import { Global, Module } from '@nestjs/common';
import { ContentScannerService } from './content-scanner.service';

/** Global so every module that saves user text can have it checked */
@Global()
@Module({
  providers: [ContentScannerService],
  exports: [ContentScannerService],
})
export class ContentScannerModule {}
