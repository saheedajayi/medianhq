import { Injectable } from '@nestjs/common';
import { MentorStatus } from '@prisma/client';
import type { CreateMentorProfileDto } from './dto/create-mentor-profile.dto';

@Injectable()
export class MentorsService {
  listApproved() {
    return {
      status: MentorStatus.APPROVED,
      data: [],
    };
  }

  apply(dto: CreateMentorProfileDto) {
    return {
      status: MentorStatus.PENDING_REVIEW,
      profile: dto,
    };
  }
}
