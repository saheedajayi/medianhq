import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { TaxonomyService } from './taxonomy.service';

@Controller('taxonomy')
export class TaxonomyController {
  constructor(private readonly taxonomyService: TaxonomyService) {}

  @Get('industries')
  getIndustries() {
    return this.taxonomyService.getIndustries();
  }

  @Post('industries')
  createIndustry(@Body('name') name: string) {
    return this.taxonomyService.createIndustry(name);
  }

  @Post('industries/:name/roles')
  createRole(@Param('name') industryName: string, @Body('name') roleName: string) {
    return this.taxonomyService.createRoleByIndustryName(industryName, roleName);
  }
}
