import { Injectable } from '@nestjs/common';
import { BookingStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../../database/prisma.service';

@Injectable()
export class MenteesRepository {
  constructor(private readonly prisma: PrismaService) {}

  findUserForOnboarding(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        emailVerifiedAt: true,
        role: true,
        menteeProfile: { select: { id: true } },
      },
    });
  }

  createProfile(data: Prisma.MenteeProfileCreateInput) {
    return this.prisma.menteeProfile.create({
      data,
    });
  }

  updateProfileByUserId(userId: string, data: Prisma.MenteeProfileUpdateInput) {
    return this.prisma.menteeProfile.update({
      where: { userId },
      data,
    });
  }

  /** True once a mentee's booking with this mentor has got past the unpaid hold */
  async hasSharedBooking(mentorUserId: string, menteeUserId: string) {
    const booking = await this.prisma.booking.findFirst({
      where: {
        mentorId: mentorUserId,
        menteeId: menteeUserId,
        status: { not: BookingStatus.PENDING_PAYMENT },
      },
      select: { id: true },
    });
    return booking !== null;
  }

  /** What a mentor sees of a mentee: their profile, history, links and the feedback mentors left */
  findMenteeForProfile(userId: string) {
    return this.prisma.user.findFirst({
      where: { id: userId, menteeProfile: { isNot: null } },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        menteeProfile: {
          select: {
            avatarUrl: true,
            location: true,
            bio: true,
            currentRole: true,
          },
        },
        workExperiences: {
          select: {
            id: true,
            role: true,
            company: true,
            contribution: true,
            skills: true,
            startMonth: true,
            startYear: true,
            endMonth: true,
            endYear: true,
            isCurrent: true,
          },
          orderBy: [
            { isCurrent: 'desc' },
            { startYear: 'desc' },
            { startMonth: 'desc' },
          ],
        },
        socialLinks: {
          select: { id: true, kind: true, title: true, url: true },
          orderBy: { createdAt: 'asc' },
        },
        menteeBookings: {
          where: { feedback: { isNot: null } },
          orderBy: { startsAt: 'desc' },
          select: {
            feedback: {
              select: {
                id: true,
                rating: true,
                comment: true,
                createdAt: true,
                author: {
                  select: {
                    firstName: true,
                    lastName: true,
                    mentorProfile: { select: { avatarUrl: true } },
                  },
                },
              },
            },
          },
        },
      },
    });
  }

  countCompletedSessions(menteeUserId: string) {
    return this.prisma.booking.count({
      where: { menteeId: menteeUserId, status: BookingStatus.COMPLETED },
    });
  }
}
