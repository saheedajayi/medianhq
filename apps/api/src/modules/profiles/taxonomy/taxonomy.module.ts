import { Module } from '@nestjs/common';
import { TaxonomyService } from './taxonomy.service';
import { TaxonomyController } from './taxonomy.controller';
import { TaxonomyRepository } from './taxonomy.repository';

@Module({
  controllers: [TaxonomyController],
  providers: [TaxonomyService, TaxonomyRepository],
})
export class TaxonomyModule {}
