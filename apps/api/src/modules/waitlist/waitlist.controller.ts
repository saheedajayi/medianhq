import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import type { CreateWaitlistEntryDto } from './dto/create-waitlist-entry.dto';
import { WaitlistService } from './waitlist.service';

@Controller('waitlist')
export class WaitlistController {
  constructor(private readonly waitlistService: WaitlistService) {}

  @Get('stats')
  getStats() {
    return this.waitlistService.getStats();
  }

  @Get('entries')
  getEntries(@Query('page') page = '1', @Query('limit') limit = '20') {
    return this.waitlistService.getDashboard({
      page: Number(page),
      limit: Number(limit),
    });
  }

  @Post()
  create(@Body() dto: CreateWaitlistEntryDto) {
    return this.waitlistService.create(dto);
  }
}
