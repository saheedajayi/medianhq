import { Injectable } from '@nestjs/common';
import type { CreateMenteeProfileDto } from './dto/create-mentee-profile.dto';

@Injectable()
export class MenteesService {
  createProfile(dto: CreateMenteeProfileDto) {
    return {
      status: 'PENDING_IMPLEMENTATION',
      profile: dto,
    };
  }
}
