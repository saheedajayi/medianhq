import { Controller, Param, Patch } from '@nestjs/common';
import { SessionsService } from './sessions.service';

@Controller('sessions')
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  @Patch(':bookingId/complete')
  complete(@Param('bookingId') bookingId: string) {
    return this.sessionsService.complete(bookingId);
  }
}
