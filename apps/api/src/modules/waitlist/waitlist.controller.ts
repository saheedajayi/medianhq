import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { AdminGuard } from '../auth/guards/admin.guard';
import type { CreateWaitlistEntryDto } from './dto/create-waitlist-entry.dto';
import { WaitlistService } from './waitlist.service';

@Controller('waitlist')
export class WaitlistController {
  constructor(private readonly waitlistService: WaitlistService) {}

  @Get('stats')
  getStats() {
    return this.waitlistService.getStats();
  }

  // Entries hold names and emails, so only the backoffice can list them
  @Get('entries')
  @UseGuards(AdminGuard)
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
