import { Injectable } from '@nestjs/common';
import { AnalyticsEventType, BookingStatus } from '@prisma/client';
import { fullName, oneOf } from '../common/admin-actor';
import {
  buildTimeBuckets,
  growthPct,
  type BucketPeriod,
} from '../common/time-buckets';
import { AdminAnalyticsRepository } from './admin-analytics.repository';
import {
  countBetween,
  median,
  percent,
  topCounts,
  weekStat,
} from './analytics-math';
import {
  VISITOR_PERIODS,
  type VisitorPeriod,
  type VisitorsQueryDto,
} from './dto/admin-analytics.dto';

const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;
const VERTICALS_SHOWN = 4;
const TOPICS_SHOWN = 5;
const RECENT_ROWS = 5;
// Mentors are expected to answer an async question within a day
const SLA_HOURS = 24;

const SUCCESSFUL_BOOKINGS: BookingStatus[] = [
  BookingStatus.CONFIRMED,
  BookingStatus.COMPLETED,
  BookingStatus.NO_SHOW,
];

// Upper bounds in minutes for the response time breakdown
const RESPONSE_BUCKETS = [
  { label: 'less than 1 hours', under: 60 },
  { label: '1 - 3 hours', under: 180 },
  { label: '3 - 6 hours', under: 360 },
  { label: '6 - 12 hours', under: 720 },
  { label: '12+ hours', under: Infinity },
];

const QUERIES_SHOWN = 5;
const FILTER_NAMES = ['Category', 'Price', 'Rating', 'Location'];

const VISITOR_BUCKETS: Record<VisitorPeriod, BucketPeriod> = {
  daily: 'daily',
  weekly: 'weekly',
  monthly: 'monthly',
  yearly: 'annually',
};
// The rolling window each visitor stat counts over
const VISITOR_WINDOW_DAYS: Record<VisitorPeriod, number> = {
  daily: 1,
  weekly: 7,
  monthly: 30,
  yearly: 365,
};

/** "career guidance" becomes "Career Guidance" */
const titleCase = (text: string) =>
  text.replace(/\b\p{L}/gu, (letter) => letter.toUpperCase());

const daysAgo = (now: Date, days: number) =>
  new Date(now.getTime() - days * DAY_MS);

/** The seven Lagos days ending today */
const lastSevenDays = (now: Date) => buildTimeBuckets('daily', now).slice(1);

@Injectable()
export class AdminAnalyticsService {
  constructor(private readonly analyticsRepository: AdminAnalyticsRepository) {}

  /** How mentees move from signing up to their first session */
  async getFunnel(now = new Date()) {
    const since = daysAgo(now, 14);
    const [
      signUps,
      goalSetups,
      firstSearches,
      firstBookings,
      firstSessions,
      weekly,
      monthly,
    ] = await Promise.all([
      this.analyticsRepository.findMenteeSignUps(since),
      this.analyticsRepository.findGoalSetups(since),
      this.analyticsRepository.findFirstSearches(),
      this.analyticsRepository.findFirstBookings(),
      this.analyticsRepository.findFirstSessions(),
      this.analyticsRepository.findActiveUserIds(daysAgo(now, 7)),
      this.analyticsRepository.findActiveUserIds(daysAgo(now, 30)),
    ]);

    const steps = {
      signUps: signUps.map((user) => user.createdAt),
      goalSetups: goalSetups.map((profile) => profile.createdAt),
      firstSearches: firstSearches
        .map((group) => group._min.createdAt)
        .filter((date): date is Date => !!date),
      firstBookings: firstBookings
        .map((group) => group._min.createdAt)
        .filter((date): date is Date => !!date),
      firstSessions: firstSessions
        .map((group) => group._min.startsAt)
        .filter((date): date is Date => !!date),
    };
    const stats = {
      signUps: weekStat(steps.signUps, now),
      goalSetups: weekStat(steps.goalSetups, now),
      firstSearches: weekStat(steps.firstSearches, now),
      firstBookings: weekStat(steps.firstBookings, now),
      firstSessions: weekStat(steps.firstSessions, now),
    };

    const conversion = (to: number, from: number) =>
      Math.min(Math.round(percent(to, from)), 100);

    return {
      stats,
      series: lastSevenDays(now).map((day) => ({
        label: day.label,
        signUps: countBetween(steps.signUps, day.from, day.to),
        goalSetups: countBetween(steps.goalSetups, day.from, day.to),
        firstSearches: countBetween(steps.firstSearches, day.from, day.to),
        firstBookings: countBetween(steps.firstBookings, day.from, day.to),
        firstSessions: countBetween(steps.firstSessions, day.from, day.to),
      })),
      conversionRates: [
        {
          label: 'Sign up - Setup Goal',
          pct: conversion(stats.goalSetups.value, stats.signUps.value),
        },
        {
          label: 'Setup Goal - First Search',
          pct: conversion(stats.firstSearches.value, stats.goalSetups.value),
        },
        {
          label: 'First Search - First Booking',
          pct: conversion(stats.firstBookings.value, stats.firstSearches.value),
        },
        {
          label: 'First Booking - First Session',
          pct: conversion(stats.firstSessions.value, stats.firstBookings.value),
        },
      ],
      keyMetrics: {
        activeUsers: weekly.length,
        monthlyUsers: monthly.length,
        // Sign-ups this week that did not reach a first session
        dropOffRatePct:
          100 - conversion(stats.firstSessions.value, stats.signUps.value),
      },
    };
  }

  /** Mentors against mentees in each industry */
  async getDemandRatio(now = new Date()) {
    const weeks = buildTimeBuckets('weekly', now).slice(1);
    const [mentors, mentees, creations] = await Promise.all([
      this.analyticsRepository.countMentorsByIndustry(),
      this.analyticsRepository.countMenteesByIndustry(),
      this.analyticsRepository.findProfileCreations(weeks[0].from),
    ]);

    const names = new Set([
      ...mentors.map((group) => group.industry),
      ...mentees.map((group) => group.industry as string),
    ]);
    const countOf = (
      groups: { industry: string | null; _count: { _all: number } }[],
      vertical: string,
    ) => groups.find((group) => group.industry === vertical)?._count._all ?? 0;

    const verticals = [...names]
      .map((vertical) => {
        const supply = countOf(mentors, vertical);
        const demand = countOf(mentees, vertical);
        // Mentors per mentee: at 1 or above there is enough supply
        const ratio = demand ? Math.round((supply / demand) * 100) / 100 : null;
        return {
          vertical,
          mentors: supply,
          mentees: demand,
          ratio,
          status:
            ratio === null || ratio >= 1
              ? ('BALANCED' as const)
              : ('NEEDS_SUPPLY' as const),
          // New mentors and mentees joining the vertical, week by week
          trend: weeks.map((week) =>
            countBetween(
              creations
                .filter((profile) => profile.industry === vertical)
                .map((profile) => profile.createdAt),
              week.from,
              week.to,
            ),
          ),
        };
      })
      .sort((a, b) => b.mentors + b.mentees - (a.mentors + a.mentees));

    return { top: verticals.slice(0, VERTICALS_SHOWN), verticals };
  }

  /** How many booking requests turn into scheduled sessions */
  async getFillRate(now = new Date()) {
    const bookings = await this.analyticsRepository.findBookingRequests(
      daysAgo(now, 14),
    );
    const weekAgo = daysAgo(now, 7);
    const isSuccessful = (booking: (typeof bookings)[number]) =>
      SUCCESSFUL_BOOKINGS.includes(booking.status);
    const thisWeek = bookings.filter((booking) => booking.createdAt >= weekAgo);
    const scheduled = thisWeek.filter(isSuccessful);

    const datesOf = (matching: typeof bookings) =>
      matching.map((booking) => booking.createdAt);
    const industryOf = (booking: (typeof bookings)[number]) =>
      booking.mentor.mentorProfile?.industry ?? 'Other';

    return {
      stats: {
        totalRequests: weekStat(datesOf(bookings), now),
        successful: weekStat(datesOf(bookings.filter(isSuccessful)), now),
        failed: weekStat(
          datesOf(bookings.filter((booking) => !isSuccessful(booking))),
          now,
        ),
      },
      flow: {
        requests: thisWeek.length,
        accepted: thisWeek.filter((booking) => booking.confirmedAt).length,
        scheduled: scheduled.length,
        fillRatePct: percent(scheduled.length, thisWeek.length),
      },
      byVertical: topCounts(thisWeek.map(industryOf), VERTICALS_SHOWN).map(
        ([vertical, requests]) => ({
          vertical,
          fillRatePct: percent(
            scheduled.filter((booking) => industryOf(booking) === vertical)
              .length,
            requests,
          ),
        }),
      ),
    };
  }

  /** How mentees search for mentors, and how satisfied they are after */
  async getPerformance(now = new Date()) {
    const weekAgo = daysAgo(now, 7);
    const until = new Date(now.getTime() + 1);
    const [
      byRating,
      recent,
      bookings,
      searchEvents,
      profileViews,
      bookClicks,
      completedSessions,
    ] = await Promise.all([
      this.analyticsRepository.countReviewsByRating(),
      this.analyticsRepository.findReviewRatings(daysAgo(now, 14)),
      this.analyticsRepository.findBookingRequests(daysAgo(now, 14)),
      this.analyticsRepository.findSearches(daysAgo(now, 14)),
      this.analyticsRepository.countEvents(
        AnalyticsEventType.PROFILE_VIEW,
        weekAgo,
        until,
      ),
      this.analyticsRepository.countEvents(
        AnalyticsEventType.BOOK_CLICK,
        weekAgo,
        until,
      ),
      this.analyticsRepository.countCompletedSessions(weekAgo, until),
    ]);
    const days = lastSevenDays(now);
    const searchDates = searchEvents.map((event) => event.createdAt);
    const bookingDates = bookings.map((booking) => booking.createdAt);
    const thisWeek = searchEvents.filter((event) => event.createdAt >= weekAgo);
    const lastWeek = searchEvents.filter((event) => event.createdAt < weekAgo);

    // People who narrowed a search with at least one filter
    const filterUsers = (events: typeof searchEvents) =>
      new Set(
        events
          .filter((event) => event.filters.length > 0)
          .map((event) => event.userId ?? event.visitorId),
      ).size;
    const bookingRate = (from: Date, to: Date) =>
      percent(
        countBetween(bookingDates, from, to),
        countBetween(searchDates, from, to),
      );
    const thisWeekRate = bookingRate(weekAgo, until);

    const queries = thisWeek.flatMap((event) =>
      event.query ? [event.query] : [],
    );
    const filterCounts = FILTER_NAMES.map((filter) => ({
      filter,
      usage: thisWeek.filter((event) => event.filters.includes(filter)).length,
    }));
    const filterTotal = filterCounts.reduce((sum, row) => sum + row.usage, 0);
    const funnelSteps = [
      { step: 'Searches', count: thisWeek.length },
      { step: 'Profile views', count: profileViews },
      { step: 'Booking clicks', count: bookClicks },
      { step: 'Completed booking', count: completedSessions },
    ];

    const reviews = byRating.reduce((sum, group) => sum + group._count._all, 0);
    const stars = byRating.reduce(
      (sum, group) => sum + group.rating * group._count._all,
      0,
    );
    const averageOf = (ratings: { rating: number }[]) =>
      ratings.length
        ? ratings.reduce((sum, review) => sum + review.rating, 0) /
          ratings.length
        : 0;

    return {
      stats: {
        totalSearches: weekStat(searchDates, now),
        filterUsers: {
          value: filterUsers(thisWeek),
          changePct: growthPct(filterUsers(thisWeek), filterUsers(lastWeek)),
        },
        bookingRatePct: {
          value: thisWeekRate,
          changePct: growthPct(
            thisWeekRate,
            bookingRate(daysAgo(now, 14), weekAgo),
          ),
        },
      },
      topQueries: topCounts(queries, QUERIES_SHOWN).map(
        ([query, searches]) => ({
          query: titleCase(query),
          searches,
          pctOfTotal: Math.round(percent(searches, queries.length)),
        }),
      ),
      filterUsage: filterCounts
        .sort((a, b) => b.usage - a.usage)
        .map((row) => ({
          ...row,
          pctOfTotal: percent(row.usage, filterTotal),
        })),
      funnel: funnelSteps.map((row) => ({
        ...row,
        pct: percent(row.count, thisWeek.length),
      })),
      daily: days.map((day) => ({
        label: day.label,
        searches: countBetween(searchDates, day.from, day.to),
        bookingRatePct: bookingRate(day.from, day.to),
        bookings: countBetween(bookingDates, day.from, day.to),
      })),
      satisfaction: {
        average: reviews ? Math.round((stars / reviews) * 10) / 10 : null,
        reviews,
        changePct: growthPct(
          averageOf(recent.filter((review) => review.createdAt >= weekAgo)),
          averageOf(recent.filter((review) => review.createdAt < weekAgo)),
        ),
        distribution: [5, 4, 3, 2, 1].map((rating) => ({
          stars: rating,
          pct: Math.round(
            percent(
              byRating.find((group) => group.rating === rating)?._count._all ??
                0,
              reviews,
            ),
          ),
        })),
      },
    };
  }

  /** How quickly mentors answer async questions */
  async getResponseMetrics(now = new Date()) {
    const questions = await this.analyticsRepository.findQuestions(
      daysAgo(now, 14),
    );
    const weekAgo = daysAgo(now, 7);
    const slaMs = SLA_HOURS * HOUR_MS;

    const threads = questions.map((question) => {
      const answeredAt = question.answers[0]?.createdAt ?? null;
      const waitedMs =
        (answeredAt ?? now).getTime() - question.createdAt.getTime();
      return {
        id: question.id,
        askedAt: question.createdAt,
        asker: fullName(question.author),
        question: question.title,
        mentor: fullName(question.mentor),
        responseMinutes: answeredAt ? Math.round(waitedMs / 60_000) : null,
        // An unanswered thread only counts against the mentor once the day is up
        status: answeredAt
          ? waitedMs <= slaMs
            ? ('ON_TIME' as const)
            : ('LATE' as const)
          : waitedMs > slaMs
            ? ('LATE' as const)
            : ('WAITING' as const),
      };
    });

    const summarise = (matching: typeof threads) => {
      const judged = matching.filter((thread) => thread.status !== 'WAITING');
      const met = judged.filter((thread) => thread.status === 'ON_TIME').length;
      return {
        threads: matching.length,
        medianResponseMinutes: median(
          matching
            .map((thread) => thread.responseMinutes)
            .filter((minutes): minutes is number => minutes !== null),
        ),
        met,
        missed: judged.length - met,
        slaPct: percent(met, judged.length),
      };
    };
    const current = summarise(
      threads.filter((thread) => thread.askedAt >= weekAgo),
    );
    const previous = summarise(
      threads.filter((thread) => thread.askedAt < weekAgo),
    );
    const answered = threads
      .filter((thread) => thread.askedAt >= weekAgo)
      .map((thread) => thread.responseMinutes)
      .filter((minutes): minutes is number => minutes !== null);

    return {
      slaHours: SLA_HOURS,
      stats: {
        medianResponseMinutes: {
          value: current.medianResponseMinutes,
          changePct:
            current.medianResponseMinutes !== null &&
            previous.medianResponseMinutes !== null
              ? growthPct(
                  current.medianResponseMinutes,
                  previous.medianResponseMinutes,
                )
              : null,
        },
        threadVolume: {
          value: current.threads,
          changePct: growthPct(current.threads, previous.threads),
        },
        slaCompliancePct: {
          value: current.slaPct,
          changePct: growthPct(current.slaPct, previous.slaPct),
        },
      },
      sla: { met: current.met, missed: current.missed },
      daily: lastSevenDays(now).map((day) => ({
        label: day.label,
        ...summarise(
          threads.filter(
            (thread) => thread.askedAt >= day.from && thread.askedAt < day.to,
          ),
        ),
      })),
      breakdown: RESPONSE_BUCKETS.map((bucket, index) => ({
        label: bucket.label,
        pct: percent(
          answered.filter(
            (minutes) =>
              minutes < bucket.under &&
              minutes >= (RESPONSE_BUCKETS[index - 1]?.under ?? 0),
          ).length,
          answered.length,
        ),
      })),
      recent: threads.slice(0, RECENT_ROWS),
    };
  }

  /** Community posts, who is taking part and what they talk about */
  async getActivity(now = new Date()) {
    const since = daysAgo(now, 14);
    const weekAgo = daysAgo(now, 7);
    const [posts, comments, latest, activeToday] = await Promise.all([
      this.analyticsRepository.findCommunityPosts(since),
      this.analyticsRepository.findCommunityComments(since),
      this.analyticsRepository.findLatestPosts(RECENT_ROWS),
      this.analyticsRepository.findActiveUserIds(daysAgo(now, 1)),
    ]);

    // Everything a member did, a post or a comment, with the topic it was under
    const actions = [
      ...posts.map((post) => ({
        at: post.createdAt,
        memberId: post.authorId,
        topic: post.category,
      })),
      ...comments.map((comment) => ({
        at: comment.createdAt,
        memberId: comment.authorId,
        topic: comment.post.category,
      })),
    ];
    const membersBetween = (from: Date, to: Date) =>
      new Set(
        actions
          .filter((action) => action.at >= from && action.at < to)
          .map((action) => action.memberId),
      ).size;
    const postDates = posts.map((post) => post.createdAt);
    const weekPosts = posts.filter((post) => post.createdAt >= weekAgo);
    const topics = topCounts(
      weekPosts.map((post) => post.category),
      TOPICS_SHOWN,
    );
    const postVolume = weekStat(postDates, now);

    return {
      stats: {
        postVolume,
        dailyActiveUsers: activeToday.length,
        topicCount: new Set(weekPosts.map((post) => post.category)).size,
        // Nothing flags content yet, so no post has been flagged
        flaggedRatePct: 0,
      },
      daily: lastSevenDays(now).map((day) => ({
        label: day.label,
        posts: countBetween(postDates, day.from, day.to),
        activeMembers: membersBetween(day.from, day.to),
      })),
      topTopics: topics.map(([topic, count]) => ({
        topic,
        posts: count,
        pct: Math.round(percent(count, weekPosts.length)),
      })),
      flagged: { flaggedPosts: 0, totalPosts: weekPosts.length },
      latest: latest.map((post) => ({
        id: post.id,
        author: fullName(post.author),
        topic: post.title,
        replies: post._count.comments,
        createdAt: post.createdAt,
      })),
      engagement: topics.slice(0, VERTICALS_SHOWN).map(([topic, count]) => ({
        topic,
        posts: count,
        activeMembers: new Set(
          actions
            .filter((action) => action.topic === topic && action.at >= weekAgo)
            .map((action) => action.memberId),
        ).size,
      })),
      insights: {
        postVolumeChangePct: postVolume.changePct,
        activeMembersChangePct: growthPct(
          membersBetween(weekAgo, new Date(now.getTime() + 1)),
          membersBetween(since, weekAgo),
        ),
        topTopic: topics[0]
          ? {
              topic: topics[0][0],
              pct: Math.round(percent(topics[0][1], weekPosts.length)),
            }
          : null,
      },
    };
  }

  /** Distinct visitors to the site, from the web app's page views */
  async getVisitors(query: VisitorsQueryDto, now = new Date()) {
    const period = oneOf(query.period, VISITOR_PERIODS) ?? 'daily';
    const buckets = buildTimeBuckets(VISITOR_BUCKETS[period], now).slice(1);
    const until = new Date(now.getTime() + 1);
    // Each stat's window, then the window before it to compare with
    const windows = VISITOR_PERIODS.flatMap((stat) => {
      const span = VISITOR_WINDOW_DAYS[stat] * DAY_MS;
      return [
        { from: new Date(until.getTime() - span), to: until },
        {
          from: new Date(until.getTime() - 2 * span),
          to: new Date(until.getTime() - span),
        },
      ];
    });

    const counts = await this.analyticsRepository.countVisitors([
      ...windows,
      ...buckets,
    ]);
    const stat = (index: number) => ({
      value: counts[index * 2] ?? 0,
      changePct: growthPct(counts[index * 2] ?? 0, counts[index * 2 + 1] ?? 0),
    });

    return {
      period,
      stats: {
        daily: stat(0),
        weekly: stat(1),
        monthly: stat(2),
        yearly: stat(3),
      },
      series: buckets.map((bucket, index) => ({
        label: bucket.label,
        visitors: counts[windows.length + index] ?? 0,
      })),
    };
  }
}
