import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { UsersService } from './users.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthUser } from '../auth/dto/auth.dto';

class UpdateRoleDto {
  role: UserRole;
}

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('roles')
  roles() {
    return this.usersService.roles();
  }

  @UseGuards(AuthGuard)
  @Patch('me/role')
  updateRole(@CurrentUser() user: AuthUser, @Body() dto: UpdateRoleDto) {
    return this.usersService.updateRole(user.id, dto.role);
  }
}
