import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AdminGuard } from '../../identity/auth/guards/admin.guard';
import { BackofficeWaitlistService } from './backoffice-waitlist.service';
import type { BackofficeWaitlistQueryDto } from './dto/backoffice-waitlist.dto';

// Entries hold names and emails: only the backoffice key or a signed-in admin can read them
@Controller('backoffice/waitlist')
@UseGuards(AdminGuard)
export class BackofficeWaitlistController {
  constructor(private readonly waitlistService: BackofficeWaitlistService) {}

  @Get()
  getDashboard(@Query() query: BackofficeWaitlistQueryDto) {
    return this.waitlistService.getDashboard(query);
  }
}
