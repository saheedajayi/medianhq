import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import type { CreateMenteeProfileDto } from './dto/create-mentee-profile.dto';
import { MenteesService } from './mentees.service';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import type { AuthUser } from '../auth/dto/auth.dto';

@Controller('mentees')
export class MenteesController {
  constructor(private readonly menteesService: MenteesService) {}

  @UseGuards(AuthGuard)
  @Post('profile')
  createProfile(@CurrentUser() user: AuthUser, @Body() dto: CreateMenteeProfileDto) {
    return this.menteesService.createProfile(user.id, dto);
  }
}
