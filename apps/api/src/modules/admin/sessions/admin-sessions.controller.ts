import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AdminGuard } from '../../identity/auth/guards/admin.guard';
import { AdminSessionsService } from './admin-sessions.service';
import type {
  CompletedSessionsQueryDto,
  LiveSessionsQueryDto,
  NoShowTrackerQueryDto,
  RecordingsQueryDto,
  SessionsCalendarQueryDto,
} from './dto/admin-sessions.dto';

@Controller('admin/sessions')
@UseGuards(AdminGuard)
export class AdminSessionsController {
  constructor(private readonly sessionsService: AdminSessionsService) {}

  @Get('live')
  getLive(@Query() query: LiveSessionsQueryDto) {
    return this.sessionsService.getLive(query);
  }

  @Get('completed')
  getCompleted(@Query() query: CompletedSessionsQueryDto) {
    return this.sessionsService.getCompleted(query);
  }

  @Get('completed/export')
  exportCompleted(@Query() query: CompletedSessionsQueryDto) {
    return this.sessionsService.exportCompleted(query);
  }

  @Get('recordings')
  getRecordings(@Query() query: RecordingsQueryDto) {
    return this.sessionsService.getRecordings(query);
  }

  @Get('no-shows')
  getNoShowTracker(@Query() query: NoShowTrackerQueryDto) {
    return this.sessionsService.getNoShowTracker(query);
  }

  @Get('calendar')
  getCalendar(@Query() query: SessionsCalendarQueryDto) {
    return this.sessionsService.getCalendar(query);
  }
}
