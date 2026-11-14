import { Injectable } from '@nestjs/common';
import { MentorStatus, Prisma, UserRole } from '@prisma/client';
import { PrismaService } from '../../../database/prisma.service';
import type {
  AdminUserRole,
  AdminUserStatus,
  AdminUsersFilters,
} from './dto/admin-users.dto';

const DAY_MS = 24 * 60 * 60 * 1000;
// Signed in within this long counts as active
export const ACTIVE_WITHIN_DAYS = 30;
const JOINED_DAYS = { '7d': 7, '30d': 30, '90d': 90 } as const;

const USER_LIST_SELECT = {
  id: true,
  firstName: true,
  lastName: true,
  email: true,
  role: true,
  createdAt: true,
  suspendedAt: true,
  suspensionReason: true,
  flaggedAt: true,
  mentorProfile: { select: { status: true, location: true, avatarUrl: true } },
  menteeProfile: { select: { location: true, avatarUrl: true } },
  deviceSessions: {
    select: { lastActiveAt: true },
    orderBy: { lastActiveAt: 'desc' },
    take: 1,
  },
} satisfies Prisma.UserSelect;

const USER_DETAIL_SELECT = {
  ...USER_LIST_SELECT,
  mentorProfile: {
    select: {
      status: true,
      location: true,
      avatarUrl: true,
      headline: true,
      bio: true,
      jobTitle: true,
      company: true,
    },
  },
  menteeProfile: {
    select: { location: true, avatarUrl: true, bio: true, currentRole: true },
  },
} satisfies Prisma.UserSelect;

const PERSON_NAME_SELECT = { firstName: true, lastName: true } as const;

const BOOKING_SELECT = {
  id: true,
  title: true,
  startsAt: true,
  durationMinutes: true,
  status: true,
  mentor: { select: PERSON_NAME_SELECT },
  mentee: { select: PERSON_NAME_SELECT },
  mentorSession: { select: { title: true, price: true, currency: true } },
  payment: { select: { amount: true, currency: true } },
} satisfies Prisma.BookingSelect;

// Shared by mentee reviews and mentor feedback, which have the same shape
const NOTE_SELECT = {
  rating: true,
  comment: true,
  createdAt: true,
  bookingId: true,
  booking: {
    select: {
      mentor: { select: PERSON_NAME_SELECT },
      mentee: { select: PERSON_NAME_SELECT },
    },
  },
} as const;

export type ListedUser = Prisma.UserGetPayload<{
  select: typeof USER_LIST_SELECT;
}>;
export type UserBooking = Prisma.BookingGetPayload<{
  select: typeof BOOKING_SELECT;
}>;

const MANAGED_ROLES = { in: [UserRole.MENTOR, UserRole.MENTEE] };

@Injectable()
export class AdminUsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Suspended wins over under review, which wins over active or inactive.
   * Under review is a mentor application awaiting review or an admin's flag.
   */
  buildStatusWhere(
    status: AdminUserStatus,
    now: Date,
  ): Prisma.UserWhereInput[] {
    const notSuspended: Prisma.UserWhereInput = { suspendedAt: null };
    const underReview: Prisma.UserWhereInput = {
      OR: [
        { mentorProfile: { is: { status: MentorStatus.PENDING_REVIEW } } },
        { flaggedAt: { not: null } },
      ],
    };
    const recentlyActive: Prisma.UserWhereInput = {
      deviceSessions: {
        some: {
          lastActiveAt: {
            gte: new Date(now.getTime() - ACTIVE_WITHIN_DAYS * DAY_MS),
          },
        },
      },
    };

    if (status === 'SUSPENDED') return [{ suspendedAt: { not: null } }];
    if (status === 'UNDER_REVIEW') return [notSuspended, underReview];
    return [
      notSuspended,
      { NOT: underReview },
      status === 'ACTIVE' ? recentlyActive : { NOT: recentlyActive },
    ];
  }

  buildWhereClause(
    filters: AdminUsersFilters,
    now: Date,
    /** Limits the result to these users, for the Trust Score filter */
    userIds?: string[],
  ): Prisma.UserWhereInput {
    const and: Prisma.UserWhereInput[] = [
      { role: filters.role ?? MANAGED_ROLES },
    ];

    // Every word has to match the name, email or ID, so "hannah ola" works
    for (const term of filters.search?.split(/\s+/).filter(Boolean) ?? []) {
      and.push({
        OR: [
          { firstName: { contains: term, mode: 'insensitive' } },
          { lastName: { contains: term, mode: 'insensitive' } },
          { email: { contains: term, mode: 'insensitive' } },
          { id: term },
        ],
      });
    }

    if (filters.status) {
      and.push(...this.buildStatusWhere(filters.status, now));
    }

    if (filters.joined) {
      const since =
        filters.joined === 'year'
          ? new Date(Date.UTC(now.getUTCFullYear(), 0, 1))
          : new Date(now.getTime() - JOINED_DAYS[filters.joined] * DAY_MS);
      and.push({ createdAt: { gte: since } });
    }

    if (filters.country) {
      // "Lagos, Nigeria" is stored as one string that ends with the country
      const location = {
        endsWith: filters.country,
        mode: 'insensitive',
      } as const;
      and.push({
        OR: [
          { mentorProfile: { is: { location } } },
          { menteeProfile: { is: { location } } },
        ],
      });
    }

    if (userIds) and.push({ id: { in: userIds } });

    return { AND: and };
  }

  findUsers(where: Prisma.UserWhereInput, skip?: number, take?: number) {
    return this.prisma.user.findMany({
      where,
      select: USER_LIST_SELECT,
      orderBy: { createdAt: 'desc' },
      skip,
      take,
    });
  }

  countUsers(where: Prisma.UserWhereInput) {
    return this.prisma.user.count({ where });
  }

  countActiveUsers(role: AdminUserRole | undefined, now: Date) {
    return this.prisma.user.count({
      where: {
        AND: [
          { role: role ?? MANAGED_ROLES },
          ...this.buildStatusWhere('ACTIVE', now),
        ],
      },
    });
  }

  async findProfileLocations() {
    const where = { location: { not: null } };
    const [mentors, mentees] = await Promise.all([
      this.prisma.mentorProfile.findMany({
        where,
        select: { location: true },
        distinct: ['location'],
      }),
      this.prisma.menteeProfile.findMany({
        where,
        select: { location: true },
        distinct: ['location'],
      }),
    ]);
    return [...mentors, ...mentees].map((profile) => profile.location);
  }

  /** A mentor or mentee; admin accounts are not managed from the directory */
  findUserDetail(userId: string) {
    return this.prisma.user.findFirst({
      where: { id: userId, role: MANAGED_ROLES },
      select: USER_DETAIL_SELECT,
    });
  }

  findManagedUser(userId: string) {
    return this.prisma.user.findFirst({
      where: { id: userId, role: MANAGED_ROLES },
      select: { id: true, email: true, suspendedAt: true, flaggedAt: true },
    });
  }

  countBookings(where: Prisma.BookingWhereInput) {
    return this.prisma.booking.count({ where });
  }

  findRecentBookings(where: Prisma.BookingWhereInput, take: number) {
    return this.prisma.booking.findMany({
      where,
      select: BOOKING_SELECT,
      orderBy: { startsAt: 'desc' },
      take,
    });
  }

  findNextBooking(where: Prisma.BookingWhereInput) {
    return this.prisma.booking.findFirst({
      where,
      select: BOOKING_SELECT,
      orderBy: { startsAt: 'asc' },
    });
  }

  /** Reviews mentees wrote about mentors: how many, their average and the latest */
  async findReviewSummary(where: Prisma.ReviewWhereInput) {
    const [stats, latest] = await Promise.all([
      this.prisma.review.aggregate({
        where,
        _count: true,
        _avg: { rating: true },
      }),
      this.prisma.review.findFirst({
        where,
        select: NOTE_SELECT,
        orderBy: { createdAt: 'desc' },
      }),
    ]);
    return { count: stats._count, average: stats._avg.rating, latest };
  }

  /** Feedback mentors wrote about mentees, in the same shape as reviews */
  async findFeedbackSummary(where: Prisma.MenteeFeedbackWhereInput) {
    const [stats, latest] = await Promise.all([
      this.prisma.menteeFeedback.aggregate({
        where,
        _count: true,
        _avg: { rating: true },
      }),
      this.prisma.menteeFeedback.findFirst({
        where,
        select: NOTE_SELECT,
        orderBy: { createdAt: 'desc' },
      }),
    ]);
    return { count: stats._count, average: stats._avg.rating, latest };
  }

  findAuditLogs(userId: string, take: number) {
    return this.prisma.securityAuditLog.findMany({
      where: { userId },
      select: {
        id: true,
        action: true,
        status: true,
        metadata: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
      take,
    });
  }

  /** Ratings for the given mentors, or for every mentor when none are given */
  findMentorRatings(mentorIds?: string[]) {
    return this.prisma.review.findMany({
      where: { booking: { mentorId: mentorIds && { in: mentorIds } } },
      select: { rating: true, booking: { select: { mentorId: true } } },
    });
  }

  countMentorBookingsByOutcome(mentorIds?: string[]) {
    return this.prisma.booking.groupBy({
      by: ['mentorId', 'status', 'noShowParty'],
      where: { mentorId: mentorIds && { in: mentorIds } },
      _count: { _all: true },
    });
  }

  /** Bumping the session version signs the user out everywhere */
  suspendUser(userId: string, reason: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        suspendedAt: new Date(),
        suspensionReason: reason,
        sessionVersion: { increment: 1 },
      },
    });
  }

  reinstateUser(userId: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { suspendedAt: null, suspensionReason: null },
    });
  }

  setUserFlag(userId: string, flagged: boolean) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { flaggedAt: flagged ? new Date() : null },
    });
  }
}
