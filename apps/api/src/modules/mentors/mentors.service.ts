import { Injectable } from '@nestjs/common';
import { MentorStatus } from '@median/shared';
import type { CreateMentorProfileDto } from './dto/create-mentor-profile.dto';

@Injectable()
export class MentorsService {
  listApproved() {
    return {
      status: MentorStatus.Approved,
      data: [],
    };
  }

  apply(dto: CreateMentorProfileDto) {
    return {
      status: MentorStatus.PendingReview,
      profile: dto,
    };
  }
}
