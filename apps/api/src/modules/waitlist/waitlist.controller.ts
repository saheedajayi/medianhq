import { Body, Controller, Post } from '@nestjs/common';
import type { CreateWaitlistEntryDto } from './dto/create-waitlist-entry.dto';
import { WaitlistService } from './waitlist.service';

@Controller('waitlist')
export class WaitlistController {
  constructor(private readonly waitlistService: WaitlistService) {}

  @Post()
  create(@Body() dto: CreateWaitlistEntryDto) {
    return this.waitlistService.create(dto);
  }
}
