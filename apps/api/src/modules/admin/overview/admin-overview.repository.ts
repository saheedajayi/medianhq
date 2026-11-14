import { Injectable } from '@nestjs/common';
import {
  BookingStatus,
  ContentFlagStatus,
  MentorStatus,
  PaymentStatus,
} from '@prisma/client';
import { PrismaService } from '../../../database/prisma.service';

type DateRange = { gte: Date; lt: Date };

@Injectable()
export class AdminOverviewRepository {
  constructor(private readonly prisma: PrismaService) {}

  /** One row per user seen on any device since the given moment */
  findActiveUserIds(since: Date) {
    return this.prisma.deviceSession.groupBy({
      by: ['userId'],
      where: { lastActiveAt: { gte: since } },
    });
  }

  countCompletedBookings(startsAt: DateRange) {
    return this.prisma.booking.count({
      where: { status: BookingStatus.COMPLETED, startsAt },
    });
  }

  findConfirmedBookings(startsAt: DateRange) {
    return this.prisma.booking.findMany({
      where: { status: BookingStatus.CONFIRMED, startsAt },
      select: { startsAt: true, durationMinutes: true },
    });
  }

  sumSuccessfulPayments(createdAt: DateRange) {
    return this.prisma.payment.aggregate({
      where: { status: PaymentStatus.SUCCESSFUL, createdAt },
      _sum: { amount: true },
    });
  }

  countMentorProfiles(status: MentorStatus) {
    return this.prisma.mentorProfile.count({ where: { status } });
  }

  /** One row per mentor with a confirmed or completed session in the window */
  findMentorIdsWithSessions(from: Date, to: Date) {
    return this.prisma.booking.groupBy({
      by: ['mentorId'],
      where: {
        status: { in: [BookingStatus.CONFIRMED, BookingStatus.COMPLETED] },
        startsAt: { gte: from, lte: to },
      },
    });
  }

  findPendingApplications() {
    return this.prisma.mentorProfile.findMany({
      where: { status: MentorStatus.PENDING_REVIEW },
      select: { submittedAt: true, updatedAt: true },
    });
  }

  findSignUpDates(since: Date) {
    return this.prisma.user.findMany({
      where: { createdAt: { gte: since } },
      select: { createdAt: true },
    });
  }

  findCompletedBookingStarts(from: Date, to: Date) {
    return this.prisma.booking.findMany({
      where: {
        status: BookingStatus.COMPLETED,
        startsAt: { gte: from, lte: to },
      },
      select: { startsAt: true },
    });
  }

  findNpsReviews(since: Date) {
    return this.prisma.review.findMany({
      where: { npsScore: { not: null }, createdAt: { gte: since } },
      select: { npsScore: true, createdAt: true },
    });
  }

  findMentorNoShows(since: Date, take: number) {
    return this.prisma.booking.findMany({
      where: {
        status: BookingStatus.NO_SHOW,
        noShowParty: { in: ['MENTOR', 'BOTH'] },
        startsAt: { gte: since },
      },
      select: {
        id: true,
        startsAt: true,
        mentor: { select: { firstName: true, lastName: true } },
      },
      orderBy: { startsAt: 'desc' },
      take,
    });
  }

  findFailedRefunds(since: Date, take: number) {
    return this.prisma.payment.findMany({
      where: { refundStatus: 'FAILED', updatedAt: { gte: since } },
      select: {
        id: true,
        refundAmount: true,
        amount: true,
        currency: true,
        provider: true,
        updatedAt: true,
      },
      orderBy: { updatedAt: 'desc' },
      take,
    });
  }

  /** People whose last activity on any device fell in the range */
  findLastSeenBetween(from: Date, to: Date) {
    return this.prisma.deviceSession.groupBy({
      by: ['userId'],
      _max: { lastActiveAt: true },
      having: { lastActiveAt: { _max: { gte: from, lt: to } } },
    });
  }

  findPendingFlags(since: Date, take: number) {
    return this.prisma.contentFlag.findMany({
      where: { status: ContentFlagStatus.PENDING, flaggedAt: { gte: since } },
      select: {
        id: true,
        contentType: true,
        matchedTerms: true,
        flaggedAt: true,
        author: { select: { firstName: true, lastName: true } },
      },
      orderBy: { flaggedAt: 'desc' },
      take,
    });
  }

  findFailedPayouts(since: Date, take: number) {
    return this.prisma.payoutRequest.findMany({
      where: { status: 'FAILED', updatedAt: { gte: since } },
      select: {
        id: true,
        amount: true,
        currency: true,
        failureReason: true,
        updatedAt: true,
        mentor: { select: { firstName: true, lastName: true } },
      },
      orderBy: { updatedAt: 'desc' },
      take,
    });
  }
}
