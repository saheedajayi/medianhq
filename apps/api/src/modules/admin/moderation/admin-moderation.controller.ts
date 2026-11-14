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
import { AdminModerationService } from './admin-moderation.service';
import type {
  ModerationFlagsQueryDto,
  ModerationHistoryQueryDto,
  TakeFlagActionDto,
} from './dto/admin-moderation.dto';

@Controller('admin/moderation')
@UseGuards(AdminGuard)
export class AdminModerationController {
  constructor(private readonly moderationService: AdminModerationService) {}

  @Get('flags')
  getFlags(@Query() query: ModerationFlagsQueryDto) {
    return this.moderationService.getFlags(query);
  }

  @Get('flags/export')
  exportFlags(@Query() query: ModerationFlagsQueryDto) {
    return this.moderationService.exportFlags(query);
  }

  @Get('history')
  getHistory(@Query() query: ModerationHistoryQueryDto) {
    return this.moderationService.getHistory(query);
  }

  @Patch('flags/:flagId/action')
  takeAction(
    @Param('flagId') flagId: string,
    @Body() dto: TakeFlagActionDto,
    @CurrentUser() admin?: AdminActor,
  ) {
    return this.moderationService.takeAction(flagId, dto, admin);
  }
}
