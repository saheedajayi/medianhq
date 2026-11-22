import { Injectable } from '@nestjs/common';
import { BookingStatus } from '@prisma/client';
import { PrismaService } from '../../../database/prisma.service';

// Bookings the other person is still expecting, or that money is still moving for
const OPEN_BOOKING_STATUSES = [
  BookingStatus.PENDING_PAYMENT,
  BookingStatus.PENDING_CONFIRMATION,
  BookingStatus.CONFIRMED,
];
const PAYOUTS_IN_FLIGHT = ['PENDING', 'PROCESSING'];

@Injectable()
export class AccountRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findUpcomingBookingIds(userId: string, now: Date) {
    const bookings = await this.prisma.booking.findMany({
      where: {
        OR: [{ menteeId: userId }, { mentorId: userId }],
        status: { in: OPEN_BOOKING_STATUSES },
        startsAt: { gt: now },
      },
      select: { id: true },
    });
    return bookings.map((booking) => booking.id);
  }

  countPayoutsInFlight(mentorId: string) {
    return this.prisma.payoutRequest.count({
      where: { mentorId, status: { in: PAYOUTS_IN_FLIGHT } },
    });
  }

  /** Bumping the session version signs the account out on every device */
  deactivate(userId: string) {
    return this.prisma.$transaction([
      this.prisma.deviceSession.deleteMany({ where: { userId } }),
      this.prisma.user.update({
        where: { id: userId },
        data: { deactivatedAt: new Date(), sessionVersion: { increment: 1 } },
      }),
    ]);
  }

  scheduleDeletion(userId: string, scheduledFor: Date) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { deletionScheduledFor: scheduledFor },
    });
  }

  cancelDeletion(userId: string) {
    return this.prisma.user.updateMany({
      where: { id: userId, deletedAt: null },
      data: { deletionScheduledFor: null },
    });
  }

  /** Signs out everywhere, but only an account that is actually on its way out */
  async signOutIfLeaving(userId: string) {
    const [, updated] = await this.prisma.$transaction([
      this.prisma.deviceSession.deleteMany({
        where: { userId, user: { deletionScheduledFor: { not: null } } },
      }),
      this.prisma.user.updateMany({
        where: { id: userId, deletionScheduledFor: { not: null } },
        data: { sessionVersion: { increment: 1 } },
      }),
    ]);
    return updated.count > 0;
  }

  findDueForDeletion(now: Date) {
    return this.prisma.user.findMany({
      where: { deletionScheduledFor: { lte: now }, deletedAt: null },
      select: { id: true, email: true },
      take: 50,
    });
  }

  /**
   * Removes everything personal and leaves an anonymous row behind. Past
   * bookings, payments, earnings and reviews stay attached to that row so the
   * other person's records and the finance figures still add up.
   */
  erase(userId: string, email: string) {
    const owned = { where: { userId } };
    return this.prisma.$transaction([
      this.prisma.menteeProfile.deleteMany(owned),
      this.prisma.mentorProfile.deleteMany(owned),
      this.prisma.mentorSession.deleteMany({ where: { mentorId: userId } }),
      this.prisma.weeklyAvailability.deleteMany({
        where: { mentorId: userId },
      }),
      this.prisma.payoutAccount.deleteMany({ where: { mentorId: userId } }),
      this.prisma.workExperience.deleteMany(owned),
      this.prisma.education.deleteMany(owned),
      this.prisma.socialLink.deleteMany(owned),
      this.prisma.userSettings.deleteMany(owned),
      this.prisma.deviceSession.deleteMany(owned),
      this.prisma.userAchievement.deleteMany(owned),
      this.prisma.securityAuditLog.deleteMany({
        where: { OR: [{ userId }, { email }] },
      }),
      this.prisma.verificationToken.deleteMany({ where: { email } }),
      this.prisma.postLike.deleteMany(owned),
      this.prisma.communityComment.deleteMany({ where: { authorId: userId } }),
      this.prisma.communityPost.deleteMany({ where: { authorId: userId } }),
      this.prisma.answer.deleteMany({ where: { authorId: userId } }),
      this.prisma.question.deleteMany({ where: { authorId: userId } }),
      this.prisma.message.deleteMany({ where: { senderId: userId } }),
      this.prisma.conversationUser.deleteMany(owned),
      this.prisma.user.update({
        where: { id: userId },
        data: {
          // The address is freed, so the same person can sign up again later
          email: `deleted-${userId}@deleted.medianhq.co`,
          firstName: 'Deleted',
          lastName: 'User',
          passwordHash: null,
          googleId: null,
          linkedinId: null,
          emailVerifiedAt: null,
          deactivatedAt: null,
          deletionScheduledFor: null,
          deletedAt: new Date(),
          sessionVersion: { increment: 1 },
        },
      }),
    ]);
  }
}
