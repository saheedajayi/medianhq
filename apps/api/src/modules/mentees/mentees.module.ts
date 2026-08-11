import { Module } from '@nestjs/common';
import { MenteesController } from './mentees.controller';
import { MenteesService } from './mentees.service';
import { MenteesRepository } from './mentees.repository';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [MenteesController],
  providers: [MenteesService, MenteesRepository],
  exports: [MenteesService, MenteesRepository],
})
export class MenteesModule {}
