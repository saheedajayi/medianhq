import { Body, Controller, Post, Res, UseGuards } from '@nestjs/common';
import type { Response } from 'express';
import type { CreateMenteeProfileDto } from './dto/create-mentee-profile.dto';
import { MenteesService } from './mentees.service';
import { AuthService } from '../auth/auth.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthUser } from '../auth/dto/auth.dto';

@Controller('mentees')
export class MenteesController {
  constructor(
    private readonly menteesService: MenteesService,
    private readonly authService: AuthService,
  ) {}

  @UseGuards(AuthGuard)
  @Post('profile')
  async createProfile(
    @CurrentUser() user: AuthUser,
    @Body() dto: CreateMenteeProfileDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.menteesService.createProfile(user.id, dto);
    const tokens = await this.authService.issueTokensForUser(user.id);
    this.authService.setAuthCookies(response, tokens);

    return {
      ...result,
      user: tokens.user,
    };
  }
}
