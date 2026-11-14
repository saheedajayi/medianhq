import { Injectable } from '@nestjs/common';
import { MentorStatus } from '@prisma/client';
import { fullName } from '../common/admin-actor';
import { businessDaysBetween } from '../common/business-days';
import { HealthChecksService } from '../../platform/health-checks/health-checks.service';
import { AdminOverviewRepository } from './admin-overview.repository';
import type {
  OverviewAlert,
  OverviewRangeDays,
} from './dto/admin-overview.dto';

const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;
// Africa/Lagos is UTC+1 all year, so days are counted on a fixed offset
const LAGOS_OFFSET_MS = HOUR_MS;
// Applications are reviewed within 5 business days; the day before counts as nearing it
const NEARING_TARGET_BUSINESS_DAYS = 4;
const ALERT_WINDOW_DAYS = 7;
const MAX_ALERTS = 10;
// Someone not seen on any device for this long has churned
const CHURN_AFTER_DAYS = 30;

const FLAGGED_CONTENT: Record<string, string> = {
  FORUM_POST: 'Community content flagged',
  MESSAGE: 'Message flagged',
  PROFILE_TEXT: 'Profile text flagged',
};

/** The Lagos calendar day a moment falls on, as YYYY-MM-DD */
const lagosDayKey = (date: Date) =>
  new Date(date.getTime() + LAGOS_OFFSET_MS).toISOString().slice(0, 10);

/** The moment a Lagos calendar day begins */
const startOfLagosDay = (date: Date) =>
  new Date(
    Math.floor((date.getTime() + LAGOS_OFFSET_MS) / DAY_MS) * DAY_MS -
      LAGOS_OFFSET_MS,
  );

const percent = (part: number, total: number) =>
  total ? Math.round((part / total) * 100) : 0;

@Injectable()
export class AdminOverviewService {
  constructor(
    private readonly overviewRepository: AdminOverviewRepository,
    private readonly healthChecks: HealthChecksService,
  ) {}

  async getOverview(range?: string, now = new Date()) {
    const rangeDays: OverviewRangeDays = range === '30d' ? 30 : 7;
    const pendingApplications =
      await this.overviewRepository.findPendingApplications();
    const nearingTarget = pendingApplications
      .map((application) => application.submittedAt ?? application.updatedAt)
      .filter(
        (submittedAt) =>
          businessDaysBetween(submittedAt, now) >= NEARING_TARGET_BUSINESS_DAYS,
      )
      .sort((a, b) => a.getTime() - b.getTime());

    const [stats, activity, nps, alerts, systemHealth] = await Promise.all([
      this.getStats(pendingApplications.length, nearingTarget.length, now),
      this.getActivity(rangeDays, now),
      this.getNps(now),
      this.getAlerts(nearingTarget, now),
      this.healthChecks.getSummary(now),
    ]);

    return {
      generatedAt: now,
      stats,
      activity,
      nps,
      alerts,
      systemHealth,
    };
  }

  private async getStats(
    pendingApplications: number,
    nearingReviewTarget: number,
    now: Date,
  ) {
    const todayStart = startOfLagosDay(now);
    const today = {
      gte: todayStart,
      lt: new Date(todayStart.getTime() + DAY_MS),
    };
    const thirtyDaysAgo = new Date(now.getTime() - 30 * DAY_MS);

    const [
      activeUsers,
      completedToday,
      confirmedToday,
      revenue,
      approvedMentors,
      mentorsWithSessions,
    ] = await Promise.all([
      this.overviewRepository.findActiveUserIds(thirtyDaysAgo),
      this.overviewRepository.countCompletedBookings(today),
      this.overviewRepository.findConfirmedBookings(today),
      this.overviewRepository.sumSuccessfulPayments(today),
      this.overviewRepository.countMentorProfiles(MentorStatus.APPROVED),
      this.overviewRepository.findMentorIdsWithSessions(thirtyDaysAgo, now),
    ]);

    const inProgress = confirmedToday.filter(
      (booking) =>
        booking.startsAt <= now &&
        booking.startsAt.getTime() + booking.durationMinutes * 60_000 >
          now.getTime(),
    ).length;

    return {
      monthlyActiveUsers: activeUsers.length,
      sessionsToday: {
        total: completedToday + confirmedToday.length,
        completed: completedToday,
        inProgress,
      },
      // Checkout is always in NGN
      revenueToday: { amount: revenue._sum.amount ?? 0, currency: 'NGN' },
      mentors: {
        approved: approvedMentors,
        withSessionsLast30Days: mentorsWithSessions.length,
      },
      pendingApplications: {
        total: pendingApplications,
        nearingReviewTarget,
      },
    };
  }

  /** Daily counts for the last N Lagos days, today included */
  private async getActivity(rangeDays: OverviewRangeDays, now: Date) {
    const from = new Date(
      startOfLagosDay(now).getTime() - (rangeDays - 1) * DAY_MS,
    );

    const churnMs = CHURN_AFTER_DAYS * DAY_MS;
    const [signUps, completed, lapsed] = await Promise.all([
      this.overviewRepository.findSignUpDates(from),
      this.overviewRepository.findCompletedBookingStarts(from, now),
      // Last seen 30 days before a day in range, so they churned on it
      this.overviewRepository.findLastSeenBetween(
        new Date(from.getTime() - churnMs),
        new Date(now.getTime() - churnMs),
      ),
    ]);

    const days = Array.from({ length: rangeDays }, (_, index) => {
      const date = lagosDayKey(new Date(from.getTime() + index * DAY_MS));
      return {
        date,
        sessionsCompleted: 0,
        newSignUps: 0,
        churnedUsers: 0,
      };
    });
    const byDate = new Map(days.map((day) => [day.date, day]));

    for (const user of signUps) {
      const day = byDate.get(lagosDayKey(user.createdAt));
      if (day) day.newSignUps += 1;
    }
    for (const booking of completed) {
      const day = byDate.get(lagosDayKey(booking.startsAt));
      if (day) day.sessionsCompleted += 1;
    }
    for (const user of lapsed) {
      const lastSeen = user._max.lastActiveAt;
      const day =
        lastSeen &&
        byDate.get(lagosDayKey(new Date(lastSeen.getTime() + churnMs)));
      if (day) day.churnedUsers += 1;
    }

    return {
      rangeDays,
      days,
      totals: {
        sessionsCompleted: completed.length,
        newSignUps: signUps.length,
        churnedUsers: days.reduce((sum, day) => sum + day.churnedUsers, 0),
      },
    };
  }

  /** NPS from session reviews over the last 7 days, against the 7 days before */
  private async getNps(now: Date) {
    const weekStart = new Date(now.getTime() - 7 * DAY_MS);
    const reviews = await this.overviewRepository.findNpsReviews(
      new Date(now.getTime() - 14 * DAY_MS),
    );

    const summarise = (scores: number[]) => {
      const promoters = scores.filter((score) => score >= 9).length;
      const detractors = scores.filter((score) => score <= 6).length;
      const promotersPct = percent(promoters, scores.length);
      const detractorsPct = percent(detractors, scores.length);
      return {
        responses: scores.length,
        score: scores.length
          ? Math.round(((promoters - detractors) / scores.length) * 100)
          : null,
        promotersPct,
        // Whatever is left, so the three always add up to 100
        passivesPct: scores.length ? 100 - promotersPct - detractorsPct : 0,
        detractorsPct,
      };
    };
    const scoresIn = (isCurrentWeek: boolean) =>
      reviews
        .filter((review) => review.createdAt >= weekStart === isCurrentWeek)
        .map((review) => review.npsScore as number);

    const current = summarise(scoresIn(true));
    const previous = summarise(scoresIn(false));

    return {
      from: weekStart,
      to: now,
      ...current,
      changeFromPreviousWeek:
        current.score !== null && previous.score !== null
          ? current.score - previous.score
          : null,
    };
  }

  private async getAlerts(
    applicationsNearingTarget: Date[],
    now: Date,
  ): Promise<OverviewAlert[]> {
    const since = new Date(now.getTime() - ALERT_WINDOW_DAYS * DAY_MS);
    const [noShows, failedRefunds, flags, failedPayouts] = await Promise.all([
      this.overviewRepository.findMentorNoShows(since, MAX_ALERTS),
      this.overviewRepository.findFailedRefunds(since, MAX_ALERTS),
      this.overviewRepository.findPendingFlags(since, MAX_ALERTS),
      this.overviewRepository.findFailedPayouts(since, MAX_ALERTS),
    ]);

    const alerts: OverviewAlert[] = [
      ...noShows.map((booking) => ({
        id: `no-show:${booking.id}`,
        kind: 'MENTOR_NO_SHOW' as const,
        severity: 'URGENT' as const,
        title: 'Mentor no-show needs review',
        detail: fullName(booking.mentor),
        occurredAt: booking.startsAt,
      })),
      ...failedRefunds.map((payment) => ({
        id: `refund:${payment.id}`,
        kind: 'REFUND_FAILED' as const,
        severity: 'URGENT' as const,
        title: 'Refund failed',
        detail: `${payment.currency} ${(payment.refundAmount ?? payment.amount).toLocaleString('en-NG')} · ${payment.provider}`,
        occurredAt: payment.updatedAt,
      })),
      ...flags.map((flag) => ({
        id: `flag:${flag.id}`,
        kind: 'CONTENT_FLAGGED' as const,
        severity: 'NEEDS_REVIEW' as const,
        title: FLAGGED_CONTENT[flag.contentType] ?? 'Content flagged',
        detail: [
          fullName(flag.author),
          flag.matchedTerms.length
            ? `matched "${flag.matchedTerms.join('", "')}"`
            : null,
        ]
          .filter(Boolean)
          .join(' · '),
        occurredAt: flag.flaggedAt,
      })),
      ...failedPayouts.map((payout) => ({
        id: `payout:${payout.id}`,
        kind: 'PAYOUT_FAILED' as const,
        severity: 'URGENT' as const,
        title: 'Mentor payout failed',
        detail: [
          `${payout.currency} ${payout.amount.toLocaleString('en-NG')}`,
          fullName(payout.mentor),
          payout.failureReason,
        ]
          .filter(Boolean)
          .join(' · '),
        occurredAt: payout.updatedAt,
      })),
    ];

    const oldestSubmission = applicationsNearingTarget[0];
    if (oldestSubmission) {
      const count = applicationsNearingTarget.length;
      alerts.push({
        id: 'applications-waiting',
        kind: 'APPLICATIONS_WAITING',
        severity: 'NEEDS_REVIEW',
        title:
          count === 1
            ? 'A mentor application is nearing its review target'
            : `${count} mentor applications are nearing their review target`,
        detail: 'Submitted 4 or more business days ago',
        occurredAt: oldestSubmission,
      });
    }

    return alerts
      .sort((a, b) => b.occurredAt.getTime() - a.occurredAt.getTime())
      .slice(0, MAX_ALERTS);
  }
}
