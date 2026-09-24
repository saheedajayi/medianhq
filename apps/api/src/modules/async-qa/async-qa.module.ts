import { Module } from '@nestjs/common';
import { AsyncQaController } from './async-qa.controller';
import { AsyncQaService } from './async-qa.service';

@Module({
  controllers: [AsyncQaController],
  providers: [AsyncQaService],
  exports: [AsyncQaService],
})
export class AsyncQaModule {}
