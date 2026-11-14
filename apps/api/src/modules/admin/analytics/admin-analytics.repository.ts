import { Injectable } from '@nestjs/common';
import {
  AnalyticsEventType,
  BookingStatus,
  MentorStatus,
  Prisma,
  UserRole,
} from '@prisma/client';
import { PrismaService } from '../../../database/prisma.service';

const PERSON_SELECT = { firstName: true, lastName: true } as const;

@Injectable()
export class AdminAnalyticsRepository {
  constructor(private readonly prisma: PrismaService) {}

  findMenteeSignUps(since: Date) {
    return this.prisma.user.findMany({
      where: { role: UserRole.MENTEE, createdAt: { gte: since } },
      select: { createdAt: true },
    });
  }

  /** A mentee profile is created when the mentee finishes setting their goals */
  findGoalSetups(since: Date) {
    return this.prisma.menteeProfile.findMany({
      where: { createdAt: { gte: since } },
      select: { createdAt: true },
    });
  }

  /** When each mentee first booked, counting only bookings that got past checkout */
  findFirstBookings() {
    return this.prisma.booking.groupBy({
      by: ['menteeId'],
      where: { status: { not: BookingStatus.PENDING_PAYMENT } },
      _min: { createdAt: true },
    });
  }

  findFirstSessions() {
    return this.prisma.booking.groupBy({
      by: ['menteeId'],
      where: { status: BookingStatus.COMPLETED },
      _min: { startsAt: true },
    });
  }

  /** One row per user seen on any device since the given moment */
  findActiveUserIds(since: Date) {
    return this.prisma.deviceSession.groupBy({
      by: ['userId'],
      where: { lastActiveAt: { gte: since } },
    });
  }

  countMentees() {
    return this.prisma.user.count({ where: { role: UserRole.MENTEE } });
  }

  countMentorsByIndustry() {
    return this.prisma.mentorProfile.groupBy({
      by: ['industry'],
      where: { status: MentorStatus.APPROVED },
      _count: { _all: true },
    });
  }

  countMenteesByIndustry() {
    return this.prisma.menteeProfile.groupBy({
      by: ['industry'],
      where: { industry: { not: null } },
      _count: { _all: true },
    });
  }

  /** New mentor and mentee profiles with their industry, for each vertical's trend */
  async findProfileCreations(since: Date) {
    const select = { industry: true, createdAt: true } as const;
    const [mentors, mentees] = await Promise.all([
      this.prisma.mentorProfile.findMany({
        where: { createdAt: { gte: since } },
        select,
      }),
      this.prisma.menteeProfile.findMany({
        where: { createdAt: { gte: since }, industry: { not: null } },
        select,
      }),
    ]);
    return [...mentors, ...mentees];
  }

  /** Booking requests: everything that got past checkout */
  findBookingRequests(since: Date) {
    return this.prisma.booking.findMany({
      where: {
        status: { not: BookingStatus.PENDING_PAYMENT },
        createdAt: { gte: since },
      },
      select: {
        status: true,
        createdAt: true,
        confirmedAt: true,
        mentor: { select: { mentorProfile: { select: { industry: true } } } },
      },
    });
  }

  countReviewsByRating() {
    return this.prisma.review.groupBy({
      by: ['rating'],
      _count: { _all: true },
    });
  }

  findReviewRatings(since: Date) {
    return this.prisma.review.findMany({
      where: { createdAt: { gte: since } },
      select: { rating: true, createdAt: true },
    });
  }

  /** Async Q&A threads with their first answer, newest first */
  findQuestions(since: Date) {
    return this.prisma.question.findMany({
      where: { createdAt: { gte: since } },
      select: {
        id: true,
        title: true,
        createdAt: true,
        author: { select: PERSON_SELECT },
        mentor: { select: PERSON_SELECT },
        answers: {
          select: { createdAt: true },
          orderBy: { createdAt: 'asc' },
          take: 1,
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  findCommunityPosts(since: Date) {
    return this.prisma.communityPost.findMany({
      where: { createdAt: { gte: since } },
      select: { createdAt: true, category: true, authorId: true },
    });
  }

  findCommunityComments(since: Date) {
    return this.prisma.communityComment.findMany({
      where: { createdAt: { gte: since } },
      select: {
        createdAt: true,
        authorId: true,
        post: { select: { category: true } },
      },
    });
  }

  findLatestPosts(take: number) {
    return this.prisma.communityPost.findMany({
      select: {
        id: true,
        title: true,
        createdAt: true,
        author: { select: PERSON_SELECT },
        _count: { select: { comments: true } },
      },
      orderBy: { createdAt: 'desc' },
      take,
    });
  }

  /** When each signed-in person first searched for a mentor */
  findFirstSearches() {
    return this.prisma.analyticsEvent.groupBy({
      by: ['userId'],
      where: { type: AnalyticsEventType.SEARCH, userId: { not: null } },
      _min: { createdAt: true },
    });
  }

  findSearches(since: Date) {
    return this.prisma.analyticsEvent.findMany({
      where: { type: AnalyticsEventType.SEARCH, createdAt: { gte: since } },
      select: {
        createdAt: true,
        query: true,
        filters: true,
        userId: true,
        visitorId: true,
      },
    });
  }

  countEvents(type: AnalyticsEventType, since: Date, until: Date) {
    return this.prisma.analyticsEvent.count({
      where: { type, createdAt: { gte: since, lt: until } },
    });
  }

  countCompletedSessions(since: Date, until: Date) {
    return this.prisma.booking.count({
      where: {
        status: BookingStatus.COMPLETED,
        startsAt: { gte: since, lt: until },
      },
    });
  }

  /** Distinct visitors in each range; a signed-in person counts once across devices */
  async countVisitors(ranges: { from: Date; to: Date }[]) {
    if (!ranges.length) return [];
    const earliest = new Date(
      Math.min(...ranges.map((range) => range.from.getTime())),
    );
    const counts = Prisma.join(
      ranges.map(
        (range) =>
          Prisma.sql`(COUNT(DISTINCT COALESCE("userId", "visitorId")) FILTER (WHERE "createdAt" >= ${range.from} AND "createdAt" < ${range.to}))::int`,
      ),
    );
    const [row] = await this.prisma.$queryRaw<{ counts: number[] }[]>`
      SELECT ARRAY[${counts}] AS counts
      FROM "AnalyticsEvent"
      WHERE "type" = 'PAGE_VIEW' AND "createdAt" >= ${earliest}
    `;
    return row?.counts ?? ranges.map(() => 0);
  }
}
