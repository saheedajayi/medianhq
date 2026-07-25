import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import type { CreateMentorProfileDto } from './dto/create-mentor-profile.dto';
import { MentorsService } from './mentors.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthUser } from '../auth/dto/auth.dto';

@Controller('mentors')
export class MentorsController {
  constructor(private readonly mentorsService: MentorsService) {}

  @UseGuards(AuthGuard)
  @Get('matches')
  getMatches(@CurrentUser() user: AuthUser) {
    return this.mentorsService.getMatches(user.id);
  }

  @UseGuards(AuthGuard)
  @Post('apply')
  apply(@CurrentUser() user: AuthUser, @Body() dto: CreateMentorProfileDto) {
    return this.mentorsService.apply(user.id, dto);
  }
}
