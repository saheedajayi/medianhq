import { Body, Controller, Delete, Get, Param, Patch, Post, Put, UseGuards } from '@nestjs/common';
import {
  SettingsService,
  type EducationDto,
  type SocialLinksDto,
  type UpdateProfileDto,
  type UpdateSettingsDto,
  type WorkExperienceDto,
} from './settings.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthUser } from '../auth/dto/auth.dto';

@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @UseGuards(AuthGuard)
  @Get('me')
  getMySettings(@CurrentUser() user: AuthUser) {
    return this.settingsService.getMySettings(user);
  }

  @UseGuards(AuthGuard)
  @Patch('me')
  updateMySettings(@CurrentUser() user: AuthUser, @Body() dto: UpdateSettingsDto) {
    return this.settingsService.updateMySettings(user, dto);
  }

  @UseGuards(AuthGuard)
  @Patch('profile')
  updateProfile(@CurrentUser() user: AuthUser, @Body() dto: UpdateProfileDto) {
    return this.settingsService.updateProfile(user, dto);
  }

  @UseGuards(AuthGuard)
  @Get('career')
  getCareer(@CurrentUser() user: AuthUser) {
    return this.settingsService.getCareer(user);
  }

  @UseGuards(AuthGuard)
  @Post('experiences')
  createExperience(@CurrentUser() user: AuthUser, @Body() dto: WorkExperienceDto) {
    return this.settingsService.createExperience(user, dto);
  }

  @UseGuards(AuthGuard)
  @Patch('experiences/:id')
  updateExperience(@CurrentUser() user: AuthUser, @Param('id') id: string, @Body() dto: WorkExperienceDto) {
    return this.settingsService.updateExperience(user, id, dto);
  }

  @UseGuards(AuthGuard)
  @Delete('experiences/:id')
  deleteExperience(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.settingsService.deleteExperience(user, id);
  }

  @UseGuards(AuthGuard)
  @Post('educations')
  createEducation(@CurrentUser() user: AuthUser, @Body() dto: EducationDto) {
    return this.settingsService.createEducation(user, dto);
  }

  @UseGuards(AuthGuard)
  @Patch('educations/:id')
  updateEducation(@CurrentUser() user: AuthUser, @Param('id') id: string, @Body() dto: EducationDto) {
    return this.settingsService.updateEducation(user, id, dto);
  }

  @UseGuards(AuthGuard)
  @Delete('educations/:id')
  deleteEducation(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.settingsService.deleteEducation(user, id);
  }

  @UseGuards(AuthGuard)
  @Get('socials')
  getSocialLinks(@CurrentUser() user: AuthUser) {
    return this.settingsService.getSocialLinks(user);
  }

  @UseGuards(AuthGuard)
  @Put('socials')
  saveSocialLinks(@CurrentUser() user: AuthUser, @Body() dto: SocialLinksDto) {
    return this.settingsService.saveSocialLinks(user, dto);
  }
}
