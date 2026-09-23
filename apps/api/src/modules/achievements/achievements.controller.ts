import { Controller, Get, UseGuards } from '@nestjs/common';
import { AchievementsService } from './achievements.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthUser } from '../auth/dto/auth.dto';

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
