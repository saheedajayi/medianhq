import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../../identity/auth/decorators/current-user.decorator';
import type { AuthUser } from '../../identity/auth/dto/auth.dto';
import { AdminSectionAccess } from '../../identity/auth/decorators/admin-section.decorator';
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
@AdminSectionAccess('sessions')
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

  @Get('recordings/:recordingId/playback')
  getRecordingPlayback(
    @Param('recordingId') recordingId: string,
    @CurrentUser() admin: AuthUser,
  ) {
    return this.sessionsService.getRecordingPlayback(recordingId, admin);
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
