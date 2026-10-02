import { Body, Controller, Get, Patch, Res, UseGuards } from '@nestjs/common';
import type { Response } from 'express';
import { UserRole } from '@prisma/client';
import { UsersService } from './users.service';
import { AuthService } from '../auth/auth.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthUser } from '../auth/dto/auth.dto';

class UpdateRoleDto {
  role: UserRole;
}

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
  ) {}

  @Get('roles')
  roles() {
    return this.usersService.roles();
  }

  @UseGuards(AuthGuard)
  @Patch('me/role')
  async updateRole(
    @CurrentUser() user: AuthUser,
    @Body() dto: UpdateRoleDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.usersService.updateRole(user.id, dto.role);
    const tokens = await this.authService.issueTokensForUser(user.id);
    this.authService.setAuthCookies(response, tokens);

    return {
      ...result,
      user: tokens.user,
    };
  }
}
