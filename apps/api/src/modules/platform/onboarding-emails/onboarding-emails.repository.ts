import { Injectable } from '@nestjs/common';
import { MentorStatus, UserRole } from '@prisma/client';
import { PrismaService } from '../../../database/prisma.service';

const RECIPIENT_SELECT = {
  id: true,
  email: true,
  firstName: true,
  settings: { select: { notificationPreferences: true } },
} as const;

@Injectable()
export class OnboardingEmailsRepository {
  constructor(private readonly prisma: PrismaService) {}

  /** Mentors approved within the window, still active */
  findMentorsApprovedBetween(from: Date, to: Date) {
    return this.prisma.user.findMany({
      where: {
        role: UserRole.MENTOR,
        suspendedAt: null,
        mentorProfile: {
          status: MentorStatus.APPROVED,
          decidedAt: { gt: from, lte: to },
        },
      },
      select: RECIPIENT_SELECT,
    });
  }

  /** Mentees who signed up within the window, still active */
  findMenteesJoinedBetween(from: Date, to: Date) {
    return this.prisma.user.findMany({
      where: {
        role: UserRole.MENTEE,
        suspendedAt: null,
        createdAt: { gt: from, lte: to },
      },
      select: RECIPIENT_SELECT,
    });
  }

  findSettings(userId: string) {
    return this.prisma.userSettings.findUnique({
      where: { userId },
      select: { notificationPreferences: true },
    });
  }

  saveNotificationPreferences(userId: string, preferences: object) {
    return this.prisma.userSettings.upsert({
      where: { userId },
      update: { notificationPreferences: preferences },
      create: { userId, notificationPreferences: preferences },
    });
  }

  userExists(userId: string) {
    return this.prisma.user.count({ where: { id: userId } });
  }
}
