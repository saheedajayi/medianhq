import { Injectable } from '@nestjs/common';
import { BookingStatus } from '@prisma/client';
import { fullName, oneOf } from '../common/admin-actor';
import { countryOf } from '../common/location';
import { placeholderRecordings } from './admin-sessions.placeholders';
import {
  AdminSessionsRepository,
  type SessionRecord,
} from './admin-sessions.repository';
import type {
  AdminSessionItem,
  CompletedSessionsFilters,
  CompletedSessionsQueryDto,
  LiveSessionsQueryDto,
  NoShowTrackerQueryDto,
  RecordingsQueryDto,
  SessionsCalendarQueryDto,
} from './dto/admin-sessions.dto';
import {
  buildNoShowHistories,
  noShowRisk,
  noShowStatus,
} from './no-show-history';

const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;
// Africa/Lagos is UTC+1 all year
const LAGOS_OFFSET_MS = HOUR_MS;
const LIVE_PAGE_SIZE = 9;
const COMPLETED_PAGE_SIZE = 8;
const TRACKER_PAGE_SIZE = 6;
const EXPORT_LIMIT = 5000;
// How far back sessions are read to work out a mentor's run of no-shows
const HISTORY_DAYS = 180;
const TRACKER_RANGE_DAYS = { '7d': 7, '30d': 30, '90d': 90 } as const;
const DEFAULT_SESSION_TYPE = 'Session';

const readPage = (page?: number | string) => Math.max(Number(page) || 1, 1);

const paginate = <T>(items: T[], page: number, pageSize: number) =>
  items.slice((page - 1) * pageSize, page * pageSize);

const percent = (part: number, total: number) =>
  total ? Math.round((part / total) * 1000) / 10 : 0;

@Injectable()
export class AdminSessionsService {
  constructor(private readonly sessionsRepository: AdminSessionsRepository) {}

  async getLive(query: LiveSessionsQueryDto, now = new Date()) {
    const started = await this.sessionsRepository.findStartedSessions(now);
    const live = started.filter(
      (session) =>
        session.startsAt.getTime() + session.durationMinutes * 60_000 >
        now.getTime(),
    );
    const page = readPage(query.page);

    return {
      items: paginate(live, page, LIVE_PAGE_SIZE).map((session) =>
        this.toItem(session),
      ),
      total: live.length,
      page,
      pageSize: LIVE_PAGE_SIZE,
    };
  }

  async getCompleted(query: CompletedSessionsQueryDto, now = new Date()) {
    const page = readPage(query.page);
    const where = this.sessionsRepository.buildCompletedWhereClause(
      this.readCompletedFilters(query),
      now,
    );

    const [sessions, total, options] = await Promise.all([
      this.sessionsRepository.findSessions(
        where,
        (page - 1) * COMPLETED_PAGE_SIZE,
        COMPLETED_PAGE_SIZE,
      ),
      this.sessionsRepository.countSessions(where),
      this.sessionsRepository.findCompletedFilterOptions(),
    ]);

    const toOption = (person: {
      id: string;
      firstName: string;
      lastName: string;
    }) => ({ id: person.id, name: fullName(person) });

    return {
      items: sessions.map((session) => this.toItem(session)),
      total,
      page,
      pageSize: COMPLETED_PAGE_SIZE,
      mentors: options.mentors.map(toOption),
      mentees: options.mentees.map(toOption),
      types: options.types,
    };
  }

  /** Every completed session matching the filters, for the CSV export */
  async exportCompleted(query: CompletedSessionsQueryDto, now = new Date()) {
    const sessions = await this.sessionsRepository.findSessions(
      this.sessionsRepository.buildCompletedWhereClause(
        this.readCompletedFilters(query),
        now,
      ),
      0,
      EXPORT_LIMIT,
    );
    return sessions.map((session) => this.toItem(session));
  }

  /** Placeholder until sessions are recorded: see admin-sessions.placeholders.ts */
  getRecordings(query: RecordingsQueryDto) {
    const recordings = placeholderRecordings();
    return {
      ...recordings,
      page: readPage(query.page),
      pageSize: recordings.items.length,
    };
  }

  async getNoShowTracker(query: NoShowTrackerQueryDto, now = new Date()) {
    const range = oneOf(query.range, ['7d', '30d', '90d'] as const) ?? '7d';
    const rangeStart = new Date(
      now.getTime() - TRACKER_RANGE_DAYS[range] * DAY_MS,
    );
    const weekAgo = new Date(now.getTime() - 7 * DAY_MS);

    const [mentors, { get: historyOf }, scheduled] = await Promise.all([
      this.sessionsRepository.findApprovedMentors(),
      this.getNoShowHistories(rangeStart, now),
      this.sessionsRepository.countScheduledSessions(rangeStart, now),
    ]);

    const rows = mentors.map((mentor) => {
      const history = historyOf(mentor.userId);
      return {
        id: mentor.userId,
        name: fullName(mentor.user),
        avatarUrl: mentor.avatarUrl,
        role: mentor.jobTitle,
        mentorType: mentor.industry,
        noShows: history.recentMisses,
        consecutiveMisses: history.consecutiveMisses,
        status: noShowStatus(history.consecutiveMisses),
        lastMissAt: history.lastMissAt,
      };
    });

    const search = query.search?.trim().toLowerCase();
    const status = oneOf(query.status, ['ALERT', 'WARNING', 'CLEAR'] as const);
    const consecutive = oneOf(query.consecutive, ['1', '2+'] as const);
    const mentorType = query.mentorType?.trim();
    const filtered = rows
      .filter(
        (row) =>
          (!search || row.name.toLowerCase().includes(search)) &&
          (!status || row.status === status) &&
          (!mentorType || row.mentorType === mentorType) &&
          (!consecutive ||
            (consecutive === '1'
              ? row.consecutiveMisses === 1
              : row.consecutiveMisses >= 2)),
      )
      // Mentors needing attention first, then alphabetical as fetched
      .sort((a, b) => b.consecutiveMisses - a.consecutiveMisses);

    const page = readPage(query.page);
    const totalNoShows = rows.reduce((sum, row) => sum + row.noShows, 0);
    const approvedThisWeek = mentors.filter(
      (mentor) => mentor.decidedAt && mentor.decidedAt >= weekAgo,
    ).length;

    return {
      items: paginate(filtered, page, TRACKER_PAGE_SIZE),
      total: filtered.length,
      page,
      pageSize: TRACKER_PAGE_SIZE,
      range,
      mentorTypes: [
        ...new Set(mentors.map((mentor) => mentor.industry)),
      ].sort(),
      stats: {
        totalMentors: mentors.length,
        totalMentorsChangePct: percent(
          approvedThisWeek,
          mentors.length - approvedThisWeek,
        ),
        withOneMiss: rows.filter((row) => row.consecutiveMisses === 1).length,
        withConsecutiveMisses: rows.filter((row) => row.consecutiveMisses >= 2)
          .length,
        totalNoShows,
        noShowPctOfScheduled: percent(totalNoShows, scheduled),
      },
    };
  }

  /** A month of sessions, each carrying its mentor's no-show risk */
  async getCalendar(query: SessionsCalendarQueryDto, now = new Date()) {
    const month = /^\d{4}-(0[1-9]|1[0-2])$/.test(query.month ?? '')
      ? (query.month as string)
      : new Date(now.getTime() + LAGOS_OFFSET_MS).toISOString().slice(0, 7);
    const [year, monthNumber] = month.split('-').map(Number);
    // The month as Lagos sees it, an hour ahead of UTC
    const from = new Date(Date.UTC(year, monthNumber - 1, 1) - LAGOS_OFFSET_MS);
    const to = new Date(Date.UTC(year, monthNumber, 1) - LAGOS_OFFSET_MS);

    const [sessions, { get: historyOf }] = await Promise.all([
      this.sessionsRepository.findSessionsBetween(from, to),
      this.getNoShowHistories(now, now),
    ]);

    return {
      month,
      sessions: sessions.map((session) => ({
        ...this.toItem(session),
        risk: noShowRisk(historyOf(session.mentor.id).consecutiveMisses),
      })),
    };
  }

  private async getNoShowHistories(recentSince: Date, now: Date) {
    const sessions = await this.sessionsRepository.findConcludedSessions(
      new Date(now.getTime() - HISTORY_DAYS * DAY_MS),
    );
    return buildNoShowHistories(
      sessions.map((session) => ({
        mentorId: session.mentorId,
        startsAt: session.startsAt,
        // A mentee-only no-show is not the mentor's miss
        mentorMissed:
          session.status === BookingStatus.NO_SHOW &&
          session.noShowParty !== 'MENTEE',
      })),
      recentSince,
    );
  }

  private readCompletedFilters(
    query: CompletedSessionsQueryDto,
  ): CompletedSessionsFilters {
    return {
      search: query.search?.trim() || undefined,
      range: oneOf(query.range, ['7d', '30d', '90d'] as const),
      rating: oneOf(query.rating, ['5', '4', '3', 'unrated'] as const),
      mentorId: query.mentorId?.trim() || undefined,
      menteeId: query.menteeId?.trim() || undefined,
      type: query.type?.trim() || undefined,
    };
  }

  private toItem(session: SessionRecord): AdminSessionItem {
    const { mentor, mentee } = session;
    return {
      id: session.id,
      type:
        session.title ?? session.mentorSession?.title ?? DEFAULT_SESSION_TYPE,
      startsAt: session.startsAt,
      durationMinutes: session.durationMinutes,
      status: session.status,
      mentor: {
        id: mentor.id,
        name: fullName(mentor),
        avatarUrl: mentor.mentorProfile?.avatarUrl ?? null,
        role: mentor.mentorProfile?.jobTitle ?? null,
        country: countryOf(mentor.mentorProfile?.location),
      },
      mentee: {
        id: mentee.id,
        name: fullName(mentee),
        avatarUrl: mentee.menteeProfile?.avatarUrl ?? null,
        role: mentee.menteeProfile?.currentRole ?? null,
        country: countryOf(mentee.menteeProfile?.location),
      },
      rating: session.review?.rating ?? null,
    };
  }
}
