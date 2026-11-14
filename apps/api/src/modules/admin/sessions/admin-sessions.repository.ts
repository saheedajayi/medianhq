import { Injectable } from '@nestjs/common';
import {
  BookingStatus,
  MentorStatus,
  Prisma,
  RecordingStatus,
} from '@prisma/client';
import { PrismaService } from '../../../database/prisma.service';
import type {
  CompletedSessionsFilters,
  RecordingsFilters,
} from './dto/admin-sessions.dto';

const DAY_MS = 24 * 60 * 60 * 1000;
const RANGE_DAYS = { '7d': 7, '30d': 30, '90d': 90 } as const;
// No session runs longer than this, so anything that started earlier has ended
const LONGEST_SESSION_MS = 8 * 60 * 60 * 1000;
const FILTER_OPTION_LIMIT = 200;

const SESSION_SELECT = {
  id: true,
  title: true,
  startsAt: true,
  durationMinutes: true,
  status: true,
  mentor: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      mentorProfile: {
        select: { jobTitle: true, location: true, avatarUrl: true },
      },
    },
  },
  mentee: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      menteeProfile: {
        select: { currentRole: true, location: true, avatarUrl: true },
      },
    },
  },
  mentorSession: { select: { title: true } },
  review: { select: { rating: true } },
} satisfies Prisma.BookingSelect;

export type SessionRecord = Prisma.BookingGetPayload<{
  select: typeof SESSION_SELECT;
}>;

const RECORDING_SELECT = {
  id: true,
  sizeBytes: true,
  durationSeconds: true,
  startedAt: true,
  endedAt: true,
  deleteAfter: true,
  booking: {
    select: {
      ...SESSION_SELECT,
      mentorRecordingConsent: true,
      menteeRecordingConsent: true,
    },
  },
} satisfies Prisma.SessionRecordingSelect;

export type RecordingRecord = Prisma.SessionRecordingGetPayload<{
  select: typeof RECORDING_SELECT;
}>;

/** Sessions that took place or are due to: booked and not cancelled, declined or expired */
const SCHEDULED_STATUSES = [
  BookingStatus.CONFIRMED,
  BookingStatus.COMPLETED,
  BookingStatus.NO_SHOW,
];

@Injectable()
export class AdminSessionsRepository {
  constructor(private readonly prisma: PrismaService) {}

  /** Confirmed sessions that have started and could still be running */
  findStartedSessions(now: Date) {
    return this.prisma.booking.findMany({
      where: {
        status: BookingStatus.CONFIRMED,
        startsAt: {
          lte: now,
          gt: new Date(now.getTime() - LONGEST_SESSION_MS),
        },
      },
      select: SESSION_SELECT,
      orderBy: { startsAt: 'asc' },
    });
  }

  buildCompletedWhereClause(
    filters: CompletedSessionsFilters,
    now: Date,
  ): Prisma.BookingWhereInput {
    const and: Prisma.BookingWhereInput[] = [
      { status: BookingStatus.COMPLETED },
    ];

    // Every word has to match the mentor, the mentee or the session's title
    for (const term of filters.search?.split(/\s+/).filter(Boolean) ?? []) {
      const contains = { contains: term, mode: 'insensitive' } as const;
      and.push({
        OR: [
          { mentor: { firstName: contains } },
          { mentor: { lastName: contains } },
          { mentee: { firstName: contains } },
          { mentee: { lastName: contains } },
          { title: contains },
          { mentorSession: { title: contains } },
        ],
      });
    }
    if (filters.range) {
      const since = now.getTime() - RANGE_DAYS[filters.range] * DAY_MS;
      and.push({ startsAt: { gte: new Date(since) } });
    }
    if (filters.mentorId) and.push({ mentorId: filters.mentorId });
    if (filters.menteeId) and.push({ menteeId: filters.menteeId });
    if (filters.rating === 'unrated') and.push({ review: null });
    else if (filters.rating) {
      and.push({ review: { rating: { gte: Number(filters.rating) } } });
    }
    if (filters.type) {
      // A booking's own title wins over the title of the session it was booked from
      and.push({
        OR: [
          { title: filters.type },
          { title: null, mentorSession: { title: filters.type } },
        ],
      });
    }
    return { AND: and };
  }

  findSessions(where: Prisma.BookingWhereInput, skip?: number, take?: number) {
    return this.prisma.booking.findMany({
      where,
      select: SESSION_SELECT,
      orderBy: { startsAt: 'desc' },
      skip,
      take,
    });
  }

  countSessions(where: Prisma.BookingWhereInput) {
    return this.prisma.booking.count({ where });
  }

  /** The people and titles that appear in completed sessions, for the filters */
  async findCompletedFilterOptions() {
    const where = { status: BookingStatus.COMPLETED };
    const name = { id: true, firstName: true, lastName: true } as const;
    const [mentors, mentees, titles] = await Promise.all([
      this.prisma.booking.findMany({
        where,
        distinct: ['mentorId'],
        select: { mentor: { select: name } },
        take: FILTER_OPTION_LIMIT,
      }),
      this.prisma.booking.findMany({
        where,
        distinct: ['menteeId'],
        select: { mentee: { select: name } },
        take: FILTER_OPTION_LIMIT,
      }),
      this.prisma.mentorSession.findMany({
        distinct: ['title'],
        select: { title: true },
        orderBy: { title: 'asc' },
        take: FILTER_OPTION_LIMIT,
      }),
    ]);
    return {
      mentors: mentors.map((booking) => booking.mentor),
      mentees: mentees.map((booking) => booking.mentee),
      types: titles.map((session) => session.title),
    };
  }

  findSessionsBetween(from: Date, to: Date) {
    return this.prisma.booking.findMany({
      where: {
        status: { in: SCHEDULED_STATUSES },
        startsAt: { gte: from, lt: to },
      },
      select: SESSION_SELECT,
      orderBy: { startsAt: 'asc' },
    });
  }

  countScheduledSessions(since: Date, until: Date) {
    return this.prisma.booking.count({
      where: {
        status: { in: SCHEDULED_STATUSES },
        startsAt: { gte: since, lte: until },
      },
    });
  }

  findApprovedMentors() {
    return this.prisma.mentorProfile.findMany({
      where: { status: MentorStatus.APPROVED },
      select: {
        userId: true,
        jobTitle: true,
        industry: true,
        avatarUrl: true,
        decidedAt: true,
        user: { select: { firstName: true, lastName: true } },
      },
      orderBy: { user: { firstName: 'asc' } },
    });
  }

  /** Every session that ended in a completion or a no-show, newest first */
  findConcludedSessions(since: Date) {
    return this.prisma.booking.findMany({
      where: {
        status: { in: [BookingStatus.COMPLETED, BookingStatus.NO_SHOW] },
        startsAt: { gte: since },
      },
      select: {
        mentorId: true,
        startsAt: true,
        status: true,
        noShowParty: true,
      },
      orderBy: { startsAt: 'desc' },
    });
  }

  buildRecordingsWhereClause(
    filters: RecordingsFilters,
    now: Date,
  ): Prisma.SessionRecordingWhereInput {
    const booking: Prisma.BookingWhereInput[] = [];

    for (const term of filters.search?.split(/\s+/).filter(Boolean) ?? []) {
      const contains = { contains: term, mode: 'insensitive' } as const;
      booking.push({
        OR: [
          { mentor: { firstName: contains } },
          { mentor: { lastName: contains } },
          { mentee: { firstName: contains } },
          { mentee: { lastName: contains } },
          { title: contains },
          { mentorSession: { title: contains } },
        ],
      });
    }
    if (filters.mentorId) booking.push({ mentorId: filters.mentorId });
    if (filters.menteeId) booking.push({ menteeId: filters.menteeId });
    if (filters.type) {
      booking.push({
        OR: [
          { title: filters.type },
          { title: null, mentorSession: { title: filters.type } },
        ],
      });
    }
    if (filters.consent === 'BOTH') {
      booking.push({
        mentorRecordingConsent: true,
        menteeRecordingConsent: true,
      });
    } else if (filters.consent === 'MENTOR') {
      booking.push({
        mentorRecordingConsent: true,
        NOT: { menteeRecordingConsent: true },
      });
    } else if (filters.consent === 'MENTEE') {
      booking.push({
        menteeRecordingConsent: true,
        NOT: { mentorRecordingConsent: true },
      });
    }

    return {
      status: RecordingStatus.READY,
      ...(filters.range && {
        startedAt: {
          gte: new Date(now.getTime() - RANGE_DAYS[filters.range] * DAY_MS),
        },
      }),
      ...(booking.length > 0 && { booking: { AND: booking } }),
    };
  }

  findRecordings(
    where: Prisma.SessionRecordingWhereInput,
    skip: number,
    take: number,
  ) {
    return this.prisma.sessionRecording.findMany({
      where,
      select: RECORDING_SELECT,
      orderBy: { startedAt: 'desc' },
      skip,
      take,
    });
  }

  countRecordings(where: Prisma.SessionRecordingWhereInput) {
    return this.prisma.sessionRecording.count({ where });
  }

  /** Totals for the stat tiles, over every recording still kept */
  async countRecordingStats(now: Date, deletingBefore: Date) {
    const ready = { status: RecordingStatus.READY };
    const weekAgo = new Date(now.getTime() - 7 * DAY_MS);
    const twoWeeksAgo = new Date(now.getTime() - 14 * DAY_MS);
    const [total, dualConsent, pendingDeletion, thisWeek, lastWeek] =
      await Promise.all([
        this.prisma.sessionRecording.count({ where: ready }),
        this.prisma.sessionRecording.count({
          where: {
            ...ready,
            booking: {
              mentorRecordingConsent: true,
              menteeRecordingConsent: true,
            },
          },
        }),
        this.prisma.sessionRecording.count({
          where: { ...ready, deleteAfter: { lte: deletingBefore } },
        }),
        this.prisma.sessionRecording.count({
          where: { ...ready, startedAt: { gte: weekAgo } },
        }),
        this.prisma.sessionRecording.count({
          where: { ...ready, startedAt: { gte: twoWeeksAgo, lt: weekAgo } },
        }),
      ]);
    return { total, dualConsent, pendingDeletion, thisWeek, lastWeek };
  }

  /** The people and titles that appear in kept recordings, for the filters */
  async findRecordingFilterOptions() {
    const recordings = await this.prisma.sessionRecording.findMany({
      where: { status: RecordingStatus.READY },
      select: {
        booking: {
          select: {
            title: true,
            mentorSession: { select: { title: true } },
            mentor: { select: { id: true, firstName: true, lastName: true } },
            mentee: { select: { id: true, firstName: true, lastName: true } },
          },
        },
      },
      orderBy: { startedAt: 'desc' },
      take: FILTER_OPTION_LIMIT * 5,
    });
    return recordings.map((recording) => recording.booking);
  }

  findRecordingParticipants(recordingId: string) {
    return this.prisma.sessionRecording.findUnique({
      where: { id: recordingId },
      select: {
        id: true,
        booking: { select: { id: true, mentorId: true, menteeId: true } },
      },
    });
  }
}
