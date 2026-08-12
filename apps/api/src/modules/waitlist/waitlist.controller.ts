import { Body, Controller, Get, Header, Post, Query } from '@nestjs/common';
import type { CreateWaitlistEntryDto } from './dto/create-waitlist-entry.dto';
import { WaitlistService } from './waitlist.service';

@Controller('waitlist')
export class WaitlistController {
  constructor(private readonly waitlistService: WaitlistService) {}

  @Get('stats')
  getStats() {
    return this.waitlistService.getStats();
  }

  @Get('export')
  @Header('Content-Type', 'text/csv; charset=utf-8')
  @Header('Content-Disposition', 'attachment; filename="waitlist-entries.csv"')
  exportCsv() {
    return this.waitlistService.exportCsv();
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
