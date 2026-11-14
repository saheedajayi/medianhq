import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../../identity/auth/decorators/current-user.decorator';
import { AdminSectionAccess } from '../../identity/auth/decorators/admin-section.decorator';
import { AdminGuard } from '../../identity/auth/guards/admin.guard';
import type { AdminActor } from '../common/admin-actor';
import { AdminModerationService } from './admin-moderation.service';
import type {
  AddBlockedTermDto,
  ModerationFlagsQueryDto,
  ModerationHistoryQueryDto,
  TakeFlagActionDto,
} from './dto/admin-moderation.dto';

@Controller('admin/moderation')
@UseGuards(AdminGuard)
@AdminSectionAccess('moderation')
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

  @Get('blocklist')
  getBlocklist() {
    return this.moderationService.getBlocklist();
  }

  @Post('blocklist')
  addBlockedTerm(
    @Body() dto: AddBlockedTermDto,
    @CurrentUser() admin?: AdminActor,
  ) {
    return this.moderationService.addBlockedTerm(dto, admin);
  }

  @Delete('blocklist/:termId')
  removeBlockedTerm(@Param('termId') termId: string) {
    return this.moderationService.removeBlockedTerm(termId);
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
