import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../../identity/auth/decorators/current-user.decorator';
import { AdminGuard } from '../../identity/auth/guards/admin.guard';
import type { AdminActor } from '../common/admin-actor';
import { AdminApplicationsService } from './admin-applications.service';
import type {
  AdminApplicationsQueryDto,
  AssignReviewerDto,
  RejectApplicationDto,
  SaveApplicationReviewDto,
} from './dto/admin-applications.dto';

@Controller('admin/applications')
@UseGuards(AdminGuard)
export class AdminApplicationsController {
  constructor(private readonly applicationsService: AdminApplicationsService) {}

  @Get()
  list(@Query() query: AdminApplicationsQueryDto) {
    return this.applicationsService.list(query);
  }

  @Get('export')
  export(@Query() query: AdminApplicationsQueryDto) {
    return this.applicationsService.export(query);
  }

  @Patch('reviewer')
  assignReviewer(
    @Body() dto: AssignReviewerDto,
    @CurrentUser() admin?: AdminActor,
  ) {
    return this.applicationsService.assignReviewer(dto, admin);
  }

  @Get(':applicationId')
  getDetail(@Param('applicationId') applicationId: string) {
    return this.applicationsService.getDetail(applicationId);
  }

  @Patch(':applicationId/review')
  saveReview(
    @Param('applicationId') applicationId: string,
    @Body() dto: SaveApplicationReviewDto,
    @CurrentUser() admin?: AdminActor,
  ) {
    return this.applicationsService.saveReview(applicationId, dto, admin);
  }

  @Patch(':applicationId/approve')
  approve(
    @Param('applicationId') applicationId: string,
    @CurrentUser() admin?: AdminActor,
  ) {
    return this.applicationsService.approve(applicationId, admin);
  }

  @Patch(':applicationId/reject')
  reject(
    @Param('applicationId') applicationId: string,
    @Body() dto: RejectApplicationDto,
    @CurrentUser() admin?: AdminActor,
  ) {
    return this.applicationsService.reject(applicationId, dto.reason, admin);
  }
}
