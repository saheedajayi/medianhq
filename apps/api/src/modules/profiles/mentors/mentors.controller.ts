import {
  Body,
  Controller,
  Get,
  Logger,
  Param,
  Patch,
  Post,
  Query,
  Res,
  UseGuards,
  Req,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import type {
  CreateMentorProfileDto,
  UpdateMentorProfileDto,
} from './dto/create-mentor-profile.dto';
import type { ExploreMentorsQueryDto } from './dto/explore-mentors-query.dto';
import { MentorsService } from './mentors.service';
import { AnalyticsTrackerService } from '../../platform/analytics/analytics-tracker.service';
import { searchEventFor } from '../../platform/analytics/search-event';
import { AuthService } from '../../identity/auth/auth.service';
import { AuthGuard } from '../../identity/auth/guards/auth.guard';
import { CurrentUser } from '../../identity/auth/decorators/current-user.decorator';
import type { AuthUser } from '../../identity/auth/dto/auth.dto';

@Controller('mentors')
export class MentorsController {
  private readonly logger = new Logger(MentorsController.name);

  constructor(
    private readonly mentorsService: MentorsService,
    private readonly authService: AuthService,
    private readonly analytics: AnalyticsTrackerService,
  ) {}

  @Get()
  async explore(
    @Req() request: Request,
    @Query() query: ExploreMentorsQueryDto,
  ) {
    const result = await this.mentorsService.explore(query);
    const search = searchEventFor(query, result.pagination.total);
    if (search) this.analytics.track(request, search);
    return result;
  }

  @Get('featured')
  getFeatured(@Query('limit') limit?: string) {
    return this.mentorsService.getFeatured(limit ? Number(limit) : 6);
  }

  @UseGuards(AuthGuard)
  @Get('matches')
  getMatches(@CurrentUser() user: AuthUser) {
    return this.mentorsService.getMatches(user.id);
  }

  @UseGuards(AuthGuard)
  @Patch('me/profile')
  async updateProfile(
    @CurrentUser() user: AuthUser,
    @Body() dto: UpdateMentorProfileDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.mentorsService.updateProfile(user.id, dto);
    // Refresh cookies so the current user reflects the new profile details
    const tokens = await this.authService.issueTokensForUser(user.id);
    this.authService.setAuthCookies(response, tokens);

    return {
      ...result,
      user: tokens.user,
    };
  }

  @Get(':id')
  async getMentorProfile(@Req() request: Request, @Param('id') id: string) {
    const profile = await this.mentorsService.getMentorProfile(id);
    this.analytics.track(request, { type: 'PROFILE_VIEW', mentorId: id });
    return profile;
  }

  @UseGuards(AuthGuard)
  @Post('apply')
  async apply(
    @CurrentUser() user: AuthUser,
    @Body() dto: CreateMentorProfileDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    this.logger.log(`POST /mentors/apply userId=${user.id}`);
    this.logger.log(`DTO received: ${JSON.stringify(dto)}`);
    try {
      const result = await this.mentorsService.apply(user.id, dto);
      this.logger.log(`Apply succeeded for userId=${user.id}`);
      const tokens = await this.authService.issueTokensForUser(user.id);
      this.authService.setAuthCookies(response, tokens);

      return {
        ...result,
        user: tokens.user,
      };
    } catch (error: any) {
      this.logger.error(`Apply FAILED for userId=${user.id}`);
      this.logger.error(`Error name: ${error?.name}`);
      this.logger.error(`Error code: ${error?.code}`);
      this.logger.error(`Error message: ${error?.message}`);
      this.logger.error(`Error meta: ${JSON.stringify(error?.meta)}`);
      this.logger.error(`Full error:`, error);
      throw error;
    }
  }
}
