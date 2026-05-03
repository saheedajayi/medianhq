import { Controller, Get, Param, Patch } from '@nestjs/common';
import { AdminService } from './admin.service';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Patch('mentors/:mentorProfileId/approve')
  approveMentor(@Param('mentorProfileId') mentorProfileId: string) {
    return this.adminService.approveMentor(mentorProfileId);
  }

  @Get('metrics')
  metrics() {
    return this.adminService.metrics();
  }
}
