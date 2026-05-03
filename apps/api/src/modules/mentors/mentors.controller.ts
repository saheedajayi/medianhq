import { Body, Controller, Get, Post } from '@nestjs/common';
import type { CreateMentorProfileDto } from './dto/create-mentor-profile.dto';
import { MentorsService } from './mentors.service';

@Controller('mentors')
export class MentorsController {
  constructor(private readonly mentorsService: MentorsService) {}

  @Get()
  listApproved() {
    return this.mentorsService.listApproved();
  }

  @Post('apply')
  apply(@Body() dto: CreateMentorProfileDto) {
    return this.mentorsService.apply(dto);
  }
}
