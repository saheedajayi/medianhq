import { Controller, Get, UseGuards } from '@nestjs/common';
import { AchievementsService } from './achievements.service';
import { AuthGuard } from '../../identity/auth/guards/auth.guard';
import { CurrentUser } from '../../identity/auth/decorators/current-user.decorator';
import type { AuthUser } from '../../identity/auth/dto/auth.dto';

@Controller('achievements')
export class AchievementsController {
  constructor(private readonly achievementsService: AchievementsService) {}

  @Get('catalog')
  getCatalog() {
    return this.achievementsService.getCatalog();
  }

  @UseGuards(AuthGuard)
  @Get('me')
  getMyAchievements(@CurrentUser() user: AuthUser) {
    return this.achievementsService.getMyAchievements(user);
  }
}
