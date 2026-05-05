import { Injectable } from '@nestjs/common';
import { MentorStatus } from '@prisma/client';

@Injectable()
export class AdminService {
  approveMentor(mentorProfileId: string) {
    return {
      mentorProfileId,
      status: MentorStatus.APPROVED,
    };
  }

  metrics() {
    return {
      approvedMentors: 0,
      totalMentees: 0,
      totalUsers: 0,
      completedSessions: 0,
      completedMinutes: 0,
      repeatBookingRate: 0,
      averageRevenuePerMentor: 0,
      sessionCompletionRate: 0,
      nps: 0,
    };
  }
}
