import {
  BadRequestException,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { BookingStatus, MentorStatus, Prisma, UserRole } from '@prisma/client';
import {
  SecurityAuditService,
  type SecurityEventAction,
} from '../../identity/auth/security-audit.service';
import { EmailService } from '../../platform/email/email.service';
import { fullName, oneOf, type AdminActor } from '../common/admin-actor';
import { countryOf } from '../common/location';
import {
  ACTIVE_WITHIN_DAYS,
  AdminUsersRepository,
  type ListedUser,
  type UserBooking,
} from './admin-users.repository';
import type {
  AdminUserItem,
  AdminUserRole,
  AdminUsersFilters,
  AdminUsersQueryDto,
  AdminUserStatus,
  EmailUserDto,
} from './dto/admin-users.dto';
import { readEmailBody, renderEmailHtml, renderEmailText } from './email-body';
import {
  computeTrustScore,
  type TrustScore,
  type TrustScoreInput,
} from './trust-score';

const DAY_MS = 24 * 60 * 60 * 1000;
const PAGE_SIZE = 8;
const EXPORT_LIMIT = 5000;
const ACTIVITY_LIMIT = 10;
const MAX_EMAIL_SUBJECT_LENGTH = 150;

const TRUST_RANGES = {
  '85+': [85, 100],
  '70-84': [70, 84],
  '<70': [0, 69],
} as const;

type ReviewNote = NonNullable<
  Awaited<ReturnType<AdminUsersRepository['findReviewSummary']>>['latest']
>;

@Injectable()
export class AdminUsersService {
  constructor(
    private readonly usersRepository: AdminUsersRepository,
    private readonly securityAudit: SecurityAuditService,
    private readonly emailService: EmailService,
  ) {}

  async list(query: AdminUsersQueryDto, now = new Date()) {
    const filters = this.readFilters(query);
    const page = Math.max(Number(query.page) || 1, 1);
    const where = await this.buildWhere(filters, now);

    const [users, total, activeCount, locations] = await Promise.all([
      this.usersRepository.findUsers(where, (page - 1) * PAGE_SIZE, PAGE_SIZE),
      this.usersRepository.countUsers(where),
      this.usersRepository.countActiveUsers(filters.role, now),
      this.usersRepository.findProfileLocations(),
    ]);

    const countries = locations
      .map(countryOf)
      .filter((country): country is string => !!country);

    return {
      items: await this.toItems(users, now),
      total,
      page,
      pageSize: PAGE_SIZE,
      activeCount,
      countries: [...new Set(countries)].sort((a, b) => a.localeCompare(b)),
    };
  }

  /** Every user matching the filters, for the CSV export */
  async export(query: AdminUsersQueryDto, now = new Date()) {
    const where = await this.buildWhere(this.readFilters(query), now);
    const users = await this.usersRepository.findUsers(where, 0, EXPORT_LIMIT);
    return this.toItems(users, now);
  }

  async getDetail(userId: string, now = new Date()) {
    const user = await this.usersRepository.findUserDetail(userId);
    if (!user) throw new NotFoundException('User not found.');

    const isMentor = user.role === UserRole.MENTOR;
    const bookings: Prisma.BookingWhereInput = isMentor
      ? { mentorId: userId }
      : { menteeId: userId };
    const completed = { ...bookings, status: BookingStatus.COMPLETED };
    const upcoming = {
      ...bookings,
      status: BookingStatus.CONFIRMED,
      startsAt: { gt: now },
    };

    const [
      completedCount,
      upcomingCount,
      recentCompleted,
      nextUpcoming,
      menteeReviews,
      mentorFeedback,
      auditLogs,
      trustScores,
    ] = await Promise.all([
      this.usersRepository.countBookings(completed),
      this.usersRepository.countBookings(upcoming),
      this.usersRepository.findRecentBookings(completed, ACTIVITY_LIMIT),
      this.usersRepository.findNextBooking(upcoming),
      // Mentees review mentors; mentors leave feedback on mentees
      this.usersRepository.findReviewSummary(
        isMentor ? { booking: { mentorId: userId } } : { authorId: userId },
      ),
      this.usersRepository.findFeedbackSummary(
        isMentor ? { authorId: userId } : { booking: { menteeId: userId } },
      ),
      this.usersRepository.findAuditLogs(userId, ACTIVITY_LIMIT),
      isMentor ? this.getTrustScores([userId]) : new Map<string, TrustScore>(),
    ]);

    // What others wrote about this user, and what this user wrote
    const received = isMentor ? menteeReviews : mentorFeedback;
    const given = isMentor ? mentorFeedback : menteeReviews;
    const toSession = (booking: UserBooking) =>
      this.toSession(booking, isMentor);
    const profile = user.mentorProfile ?? user.menteeProfile;
    const [item] = await this.toItems([user], now, trustScores);

    const activity = [
      ...auditLogs.map((log) => ({
        id: `audit:${log.id}`,
        at: log.createdAt,
        text: this.describeAuditAction(log.action, log.status, log.metadata),
        reference: null as string | null,
      })),
      ...recentCompleted.map((booking) => ({
        id: `session:${booking.id}`,
        at: new Date(
          booking.startsAt.getTime() + booking.durationMinutes * 60_000,
        ),
        text: `${toSession(booking).title} completed`,
        reference: booking.id,
      })),
    ]
      .sort((a, b) => b.at.getTime() - a.at.getTime())
      .slice(0, ACTIVITY_LIMIT);

    return {
      ...item,
      city: profile?.location?.split(',')[0]?.trim() || null,
      location: profile?.location ?? null,
      headline: user.mentorProfile
        ? [user.mentorProfile.jobTitle, user.mentorProfile.company]
            .filter(Boolean)
            .join(' @ ') || null
        : (user.menteeProfile?.currentRole ?? null),
      bio:
        user.mentorProfile?.headline ??
        user.mentorProfile?.bio ??
        user.menteeProfile?.bio ??
        null,
      suspendedAt: user.suspendedAt,
      suspensionReason: user.suspensionReason,
      rating: { average: received.average, count: received.count },
      trustScoreDetail: trustScores.get(userId) ?? null,
      sessions: {
        completed: completedCount,
        upcoming: upcomingCount,
        items: [recentCompleted[0], nextUpcoming]
          .filter((booking) => !!booking)
          .map(toSession),
      },
      reviews: {
        receivedCount: received.count,
        givenCount: given.count,
        // A mentor receives mentee reviews and gives feedback; a mentee the reverse
        received: this.toNote(received.latest, !isMentor),
        given: this.toNote(given.latest, isMentor),
      },
      activity,
    };
  }

  /** Ends the user's sessions and stops them signing in or being booked */
  async suspend(userId: string, reason?: string, actor?: AdminActor) {
    const trimmed = reason?.trim();
    if (!trimmed) {
      throw new BadRequestException('A reason is required to suspend.');
    }
    const user = await this.findManagedUser(userId);
    if (user.suspendedAt) {
      throw new BadRequestException('This account is already suspended.');
    }

    await this.usersRepository.suspendUser(userId, trimmed);
    await this.recordAction(user, 'ACCOUNT_SUSPENDED', actor, trimmed);
    return { userId, status: 'SUSPENDED' as const };
  }

  /** Sends the user a message from Median and notes it on their activity log */
  async email(userId: string, dto: EmailUserDto, actor?: AdminActor) {
    const subject = dto.subject?.trim().replace(/\s+/g, ' ');
    if (!subject) {
      throw new BadRequestException('A subject is required.');
    }
    if (subject.length > MAX_EMAIL_SUBJECT_LENGTH) {
      throw new BadRequestException(
        `The subject cannot exceed ${MAX_EMAIL_SUBJECT_LENGTH} characters.`,
      );
    }
    const body = readEmailBody(dto.body);
    const message = renderEmailText(body);
    const user = await this.findManagedUser(userId);

    const metadata = { adminId: actor?.id ?? null, reason: subject, message };
    const record = (status: 'SUCCESS' | 'FAILURE') =>
      this.securityAudit.record({
        userId: user.id,
        email: user.email,
        action: 'EMAIL_SENT_BY_ADMIN',
        status,
        metadata,
      });

    let sent = false;
    try {
      sent = await this.emailService.sendAdminMessage({
        email: user.email,
        firstName: user.firstName,
        subject,
        bodyHtml: renderEmailHtml(body),
        bodyText: message,
        idempotencyKey: `admin-message:${user.id}:${Date.now()}`,
      });
    } catch {
      sent = false;
    }
    if (!sent) {
      await record('FAILURE');
      throw new ServiceUnavailableException(
        "The email couldn't be sent. Please try again.",
      );
    }

    await record('SUCCESS');
    return { userId, sent: true };
  }

  async reinstate(userId: string, actor?: AdminActor) {
    const user = await this.findManagedUser(userId);
    if (!user.suspendedAt) {
      throw new BadRequestException('This account is not suspended.');
    }

    await this.usersRepository.reinstateUser(userId);
    await this.recordAction(user, 'ACCOUNT_REINSTATED', actor);
    return { userId };
  }

  async setFlag(userId: string, flagged: boolean, actor?: AdminActor) {
    const user = await this.findManagedUser(userId);
    if (!!user.flaggedAt !== flagged) {
      await this.usersRepository.setUserFlag(userId, flagged);
      await this.recordAction(
        user,
        flagged ? 'ACCOUNT_FLAGGED' : 'ACCOUNT_UNFLAGGED',
        actor,
      );
    }
    return { userId, isFlagged: flagged };
  }

  private async findManagedUser(userId: string) {
    const user = await this.usersRepository.findManagedUser(userId);
    if (!user) throw new NotFoundException('User not found.');
    return user;
  }

  private recordAction(
    user: { id: string; email: string },
    action: SecurityEventAction,
    actor?: AdminActor,
    reason?: string,
  ) {
    return this.securityAudit.record({
      userId: user.id,
      email: user.email,
      action,
      status: 'SUCCESS',
      metadata: { adminId: actor?.id ?? null, ...(reason && { reason }) },
    });
  }

  private readFilters(query: AdminUsersQueryDto): AdminUsersFilters {
    return {
      role: oneOf(query.role, ['MENTOR', 'MENTEE'] as const),
      status: oneOf(query.status, [
        'ACTIVE',
        'UNDER_REVIEW',
        'SUSPENDED',
        'INACTIVE',
      ] as const),
      joined: oneOf(query.joined, ['7d', '30d', '90d', 'year'] as const),
      trust: oneOf(query.trust, ['85+', '70-84', '<70'] as const),
      search: query.search?.trim() || undefined,
      country: query.country?.trim() || undefined,
    };
  }

  private async buildWhere(filters: AdminUsersFilters, now: Date) {
    if (!filters.trust) {
      return this.usersRepository.buildWhereClause(filters, now);
    }
    // Trust Scores are calculated, not stored, so matching mentors are found first
    const [min, max] = TRUST_RANGES[filters.trust];
    const scores = await this.getTrustScores();
    const mentorIds = [...scores]
      .filter(([, trust]) => trust.score >= min && trust.score <= max)
      .map(([id]) => id);
    return this.usersRepository.buildWhereClause(filters, now, mentorIds);
  }

  /** Trust Scores by mentor ID; every mentor when no IDs are given */
  private async getTrustScores(mentorIds?: string[]) {
    const [ratings, bookings] = await Promise.all([
      this.usersRepository.findMentorRatings(mentorIds),
      this.usersRepository.countMentorBookingsByOutcome(mentorIds),
    ]);

    const inputs = new Map<string, TrustScoreInput>();
    const inputFor = (mentorId: string) => {
      let input = inputs.get(mentorId);
      if (!input) {
        input = {
          ratingSum: 0,
          ratingCount: 0,
          attended: 0,
          missed: 0,
          responded: 0,
          expired: 0,
        };
        inputs.set(mentorId, input);
      }
      return input;
    };

    for (const review of ratings) {
      const input = inputFor(review.booking.mentorId);
      input.ratingSum += review.rating;
      input.ratingCount += 1;
    }
    for (const group of bookings) {
      const input = inputFor(group.mentorId);
      const count = group._count._all;
      if (group.status === BookingStatus.EXPIRED) input.expired += count;
      if (
        group.status === BookingStatus.CONFIRMED ||
        group.status === BookingStatus.COMPLETED ||
        group.status === BookingStatus.DECLINED ||
        group.status === BookingStatus.NO_SHOW
      ) {
        input.responded += count;
      }
      if (group.status === BookingStatus.COMPLETED) input.attended += count;
      if (group.status === BookingStatus.NO_SHOW) {
        if (group.noShowParty === 'MENTEE') input.attended += count;
        else input.missed += count;
      }
    }

    const scores = new Map<string, TrustScore>();
    for (const [mentorId, input] of inputs) {
      const score = computeTrustScore(input);
      if (score) scores.set(mentorId, score);
    }
    return scores;
  }

  private async toItems(
    users: ListedUser[],
    now: Date,
    knownScores?: Map<string, TrustScore>,
  ): Promise<AdminUserItem[]> {
    const mentorIds = users
      .filter((user) => user.role === UserRole.MENTOR)
      .map((user) => user.id);
    const scores =
      knownScores ??
      (mentorIds.length
        ? await this.getTrustScores(mentorIds)
        : new Map<string, TrustScore>());

    return users.map((user) => {
      const profile = user.mentorProfile ?? user.menteeProfile;
      const lastActiveAt = user.deviceSessions[0]?.lastActiveAt ?? null;
      return {
        id: user.id,
        name: fullName(user),
        email: user.email,
        avatarUrl: profile?.avatarUrl ?? null,
        role: user.role as AdminUserRole,
        status: this.getStatus(user, lastActiveAt, now),
        isFlagged: !!user.flaggedAt,
        country: countryOf(profile?.location),
        joinedAt: user.createdAt,
        trustScore: scores.get(user.id)?.score ?? null,
        lastActiveAt,
      };
    });
  }

  private getStatus(
    user: ListedUser,
    lastActiveAt: Date | null,
    now: Date,
  ): AdminUserStatus {
    if (user.suspendedAt) return 'SUSPENDED';
    if (
      user.flaggedAt ||
      user.mentorProfile?.status === MentorStatus.PENDING_REVIEW
    ) {
      return 'UNDER_REVIEW';
    }
    const activeSince = now.getTime() - ACTIVE_WITHIN_DAYS * DAY_MS;
    return lastActiveAt && lastActiveAt.getTime() >= activeSince
      ? 'ACTIVE'
      : 'INACTIVE';
  }

  private toSession(booking: UserBooking, isMentor: boolean) {
    return {
      id: booking.id,
      title: booking.title ?? booking.mentorSession?.title ?? 'Session',
      status: booking.status,
      startsAt: booking.startsAt,
      durationMinutes: booking.durationMinutes,
      withName: fullName(isMentor ? booking.mentee : booking.mentor),
      amount: booking.payment?.amount ?? booking.mentorSession?.price ?? 0,
      currency:
        booking.payment?.currency ?? booking.mentorSession?.currency ?? 'NGN',
    };
  }

  private toNote(note: ReviewNote | null, authorIsMentor: boolean) {
    if (!note) return null;
    const { mentor, mentee } = note.booking;
    return {
      rating: note.rating,
      comment: note.comment,
      bookingId: note.bookingId,
      createdAt: note.createdAt,
      fromName: fullName(authorIsMentor ? mentor : mentee),
      toName: fullName(authorIsMentor ? mentee : mentor),
    };
  }

  /** PASSWORD_CHANGE becomes "Password change", with the admin's reason if there is one */
  private describeAuditAction(
    action: string,
    status: string,
    metadata: Prisma.JsonValue,
  ) {
    const words = action.toLowerCase().replace(/_/g, ' ');
    let text = words.charAt(0).toUpperCase() + words.slice(1);
    const reason =
      metadata && typeof metadata === 'object' && !Array.isArray(metadata)
        ? metadata.reason
        : null;
    if (typeof reason === 'string') text += `: ${reason}`;
    return status === 'SUCCESS' ? text : `${text} (failed)`;
  }
}
