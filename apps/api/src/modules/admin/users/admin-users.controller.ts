import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../../identity/auth/decorators/current-user.decorator';
import { AdminSectionAccess } from '../../identity/auth/decorators/admin-section.decorator';
import { AdminGuard } from '../../identity/auth/guards/admin.guard';
import type { AdminActor } from '../common/admin-actor';
import { AdminUsersService } from './admin-users.service';
import type {
  AdminUsersQueryDto,
  EmailUserDto,
  FlagUserDto,
  SuspendUserDto,
} from './dto/admin-users.dto';

@Controller('admin/users')
@UseGuards(AdminGuard)
@AdminSectionAccess('users')
export class AdminUsersController {
  constructor(private readonly usersService: AdminUsersService) {}

  @Get()
  list(@Query() query: AdminUsersQueryDto) {
    return this.usersService.list(query);
  }

  @Get('export')
  export(@Query() query: AdminUsersQueryDto) {
    return this.usersService.export(query);
  }

  @Get(':userId')
  getDetail(@Param('userId') userId: string) {
    return this.usersService.getDetail(userId);
  }

  @Post(':userId/email')
  email(
    @Param('userId') userId: string,
    @Body() dto: EmailUserDto,
    @CurrentUser() admin?: AdminActor,
  ) {
    return this.usersService.email(userId, dto, admin);
  }

  @Patch(':userId/suspend')
  suspend(
    @Param('userId') userId: string,
    @Body() dto: SuspendUserDto,
    @CurrentUser() admin?: AdminActor,
  ) {
    return this.usersService.suspend(userId, dto.reason, admin);
  }

  @Patch(':userId/reinstate')
  reinstate(
    @Param('userId') userId: string,
    @CurrentUser() admin?: AdminActor,
  ) {
    return this.usersService.reinstate(userId, admin);
  }

  @Patch(':userId/flag')
  setFlag(
    @Param('userId') userId: string,
    @Body() dto: FlagUserDto,
    @CurrentUser() admin?: AdminActor,
  ) {
    return this.usersService.setFlag(userId, dto.flagged !== false, admin);
  }
}
