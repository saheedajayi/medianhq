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
import { AdminGuard } from '../identity/auth/guards/admin.guard';
import { AdminService } from './admin.service';

@Controller('admin')
@UseGuards(AdminGuard)
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
  approveMentor(@Param('mentorProfileId') mentorProfileId: string) {
    return this.adminService.approveMentor(mentorProfileId);
  }

  @Patch('mentors/:mentorProfileId/reject')
  rejectMentor(
    @Param('mentorProfileId') mentorProfileId: string,
    @Body('reason') reason?: string,
  ) {
    return this.adminService.rejectMentor(mentorProfileId, reason);
  }

  @Get('metrics')
  metrics() {
    return this.adminService.metrics();
  }
}
