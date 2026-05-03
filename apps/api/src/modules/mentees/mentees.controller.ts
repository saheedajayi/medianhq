import { Body, Controller, Post } from '@nestjs/common';
import type { CreateMenteeProfileDto } from './dto/create-mentee-profile.dto';
import { MenteesService } from './mentees.service';

@Controller('mentees')
export class MenteesController {
  constructor(private readonly menteesService: MenteesService) {}

  @Post('profile')
  createProfile(@Body() dto: CreateMenteeProfileDto) {
    return this.menteesService.createProfile(dto);
  }
}
