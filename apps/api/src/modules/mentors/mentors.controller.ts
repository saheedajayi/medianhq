import {
  Body,
  Controller,
  Get,
  Logger,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import type { CreateMentorProfileDto } from './dto/create-mentor-profile.dto';
import type { ExploreMentorsQueryDto } from './dto/explore-mentors-query.dto';
import { MentorsService } from './mentors.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthUser } from '../auth/dto/auth.dto';

@Controller('mentors')
export class MentorsController {
  private readonly logger = new Logger(MentorsController.name);

  constructor(private readonly mentorsService: MentorsService) {}

  @Get()
  explore(@Query() query: ExploreMentorsQueryDto) {
    return this.mentorsService.explore(query);
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

  @Get(':id')
  getMentorProfile(@Param('id') id: string) {
    return this.mentorsService.getMentorProfile(id);
  }

  @UseGuards(AuthGuard)
  @Post('apply')
  async apply(@CurrentUser() user: AuthUser, @Body() dto: CreateMentorProfileDto) {
    this.logger.log(`POST /mentors/apply userId=${user.id}`);
    this.logger.log(`DTO received: ${JSON.stringify(dto)}`);
    try {
      const result = await this.mentorsService.apply(user.id, dto);
      this.logger.log(`Apply succeeded for userId=${user.id}`);
      return result;
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
