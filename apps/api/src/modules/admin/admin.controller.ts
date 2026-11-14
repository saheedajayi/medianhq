import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { MentorStatus } from '@prisma/client';
import { CurrentUser } from '../identity/auth/decorators/current-user.decorator';
import { AdminSectionAccess } from '../identity/auth/decorators/admin-section.decorator';
import { AdminGuard } from '../identity/auth/guards/admin.guard';
import type { AdminActor } from './common/admin-actor';
import { AdminService } from './admin.service';

@Controller('admin')
@UseGuards(AdminGuard)
@AdminSectionAccess('applications')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('mentors')
  listMentorApplications(@Query('status') status?: string) {
    const valid = Object.values(MentorStatus).includes(status as MentorStatus);
    return this.adminService.listMentorApplications(
      valid ? (status as MentorStatus) : MentorStatus.PENDING_REVIEW,
    );
  }

  @Patch('mentors/:mentorProfileId/approve')
  approveMentor(
    @Param('mentorProfileId') mentorProfileId: string,
    @CurrentUser() admin?: AdminActor,
  ) {
    return this.adminService.approveMentor(mentorProfileId, admin);
  }

  @Patch('mentors/:mentorProfileId/reject')
  rejectMentor(
    @Param('mentorProfileId') mentorProfileId: string,
    @Body('reason') reason?: string,
    @CurrentUser() admin?: AdminActor,
  ) {
    return this.adminService.rejectMentor(mentorProfileId, reason, admin);
  }

  @Get('metrics')
  metrics() {
    return this.adminService.metrics();
  }
}
