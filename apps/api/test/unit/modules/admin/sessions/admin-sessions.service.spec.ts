import { AdminSessionsService } from '../../../../../src/modules/admin/sessions/admin-sessions.service';

describe('AdminSessionsService', () => {
  const now = new Date('2026-10-07T09:42:00.000Z');
  const person = (id: string) => ({
    id,
    firstName: 'Kwame',
    lastName: 'Mensah',
    mentorProfile: {
      jobTitle: 'Product Designer',
      location: 'Lagos, Nigeria',
      avatarUrl: null,
    },
    menteeProfile: {
      currentRole: 'Student',
      location: 'Accra, Ghana',
      avatarUrl: null,
    },
  });
  const booking = (id: string, startsAt: string, durationMinutes: number) => ({
    id,
    title: null,
    startsAt: new Date(startsAt),
    durationMinutes,
    status: 'CONFIRMED',
    mentor: person('m1'),
    mentee: person('e1'),
    mentorSession: { title: 'Portfolio Review' },
    review: null,
  });

  it('lists only sessions that are still running', async () => {
    const repository = {
      findStartedSessions: jest
        .fn()
        .mockResolvedValue([
          booking('ended', '2026-10-07T08:00:00.000Z', 30),
          booking('running', '2026-10-07T09:30:00.000Z', 30),
        ]),
    };
    const service = new AdminSessionsService(
      repository as never,
      {} as never,
      {} as never,
    );

    const live = await service.getLive({}, now);

    expect(live.total).toBe(1);
    expect(live.items[0]).toMatchObject({
      id: 'running',
      type: 'Portfolio Review',
      mentor: {
        name: 'Kwame Mensah',
        role: 'Product Designer',
        country: 'Nigeria',
      },
      mentee: { role: 'Student', country: 'Ghana' },
    });
  });

  it('reads the calendar month as Lagos sees it', async () => {
    const repository = {
      findSessionsBetween: jest.fn().mockResolvedValue([]),
      findConcludedSessions: jest.fn().mockResolvedValue([]),
    };
    const service = new AdminSessionsService(
      repository as never,
      {} as never,
      {} as never,
    );

    const calendar = await service.getCalendar({ month: '2026-10' }, now);

    expect(calendar.month).toBe('2026-10');
    expect(repository.findSessionsBetween).toHaveBeenCalledWith(
      new Date('2026-09-30T23:00:00.000Z'),
      new Date('2026-10-31T23:00:00.000Z'),
    );
    // A malformed month falls back to the current one
    expect((await service.getCalendar({ month: 'october' }, now)).month).toBe(
      '2026-10',
    );
  });

  it('puts mentors with consecutive misses first in the tracker', async () => {
    const mentor = (userId: string, firstName: string) => ({
      userId,
      jobTitle: 'Product Designer',
      industry: 'Design',
      avatarUrl: null,
      decidedAt: null,
      user: { firstName, lastName: 'Mensah' },
    });
    const miss = (mentorId: string, startsAt: string) => ({
      mentorId,
      startsAt: new Date(startsAt),
      status: 'NO_SHOW',
      noShowParty: 'MENTOR',
    });
    const repository = {
      findApprovedMentors: jest
        .fn()
        .mockResolvedValue([
          mentor('clear', 'Ada'),
          mentor('flagged', 'Kwame'),
        ]),
      findConcludedSessions: jest
        .fn()
        .mockResolvedValue([
          miss('flagged', '2026-10-06T09:00:00.000Z'),
          miss('flagged', '2026-10-05T09:00:00.000Z'),
        ]),
      countScheduledSessions: jest.fn().mockResolvedValue(40),
    };
    const service = new AdminSessionsService(
      repository as never,
      {} as never,
      {} as never,
    );

    const tracker = await service.getNoShowTracker({}, now);

    expect(tracker.items.map((row) => [row.id, row.status])).toEqual([
      ['flagged', 'ALERT'],
      ['clear', 'CLEAR'],
    ]);
    expect(tracker.stats).toMatchObject({
      totalMentors: 2,
      withOneMiss: 0,
      withConsecutiveMisses: 1,
      totalNoShows: 2,
      noShowPctOfScheduled: 5,
    });
  });

  it('shows who still agrees to a recording and audits every view', async () => {
    const recording = {
      id: 'rec-1',
      sizeBytes: BigInt(342 * 1024 * 1024),
      durationSeconds: 1790,
      startedAt: new Date('2026-10-06T08:25:00.000Z'),
      endedAt: new Date('2026-10-06T08:55:00.000Z'),
      deleteAfter: new Date('2026-11-05T08:25:00.000Z'),
      booking: {
        ...booking('booking-7f3kd6', '2026-10-06T08:25:00.000Z', 30),
        mentorRecordingConsent: true,
        menteeRecordingConsent: false,
      },
    };
    const repository = {
      buildRecordingsWhereClause: jest.fn().mockReturnValue({}),
      findRecordings: jest.fn().mockResolvedValue([recording]),
      countRecordings: jest.fn().mockResolvedValue(1),
      countRecordingStats: jest.fn().mockResolvedValue({
        total: 4,
        dualConsent: 3,
        pendingDeletion: 1,
        thisWeek: 3,
        lastWeek: 2,
      }),
      findRecordingFilterOptions: jest
        .fn()
        .mockResolvedValue([recording.booking, recording.booking]),
      findRecordingParticipants: jest.fn().mockResolvedValue({
        id: 'rec-1',
        booking: { id: 'booking-7f3kd6', mentorId: 'm1', menteeId: 'e1' },
      }),
    };
    const recordings = {
      playbackUrl: jest.fn().mockResolvedValue({ url: 'https://signed' }),
    };
    const audit = { record: jest.fn() };
    const service = new AdminSessionsService(
      repository as never,
      recordings as never,
      audit as never,
    );

    const page = await service.getRecordings({ consent: 'MENTOR' }, now);
    expect(repository.buildRecordingsWhereClause).toHaveBeenCalledWith(
      expect.objectContaining({ consent: 'MENTOR' }),
      now,
    );
    expect(page.stats).toEqual({
      total: 4,
      totalChangePct: 50,
      dualConsent: 3,
      pendingDeletion: 1,
    });
    expect(page.items[0]).toMatchObject({
      sessionId: 'S-7F3KD6',
      consent: 'MENTOR',
      durationMinutes: 30,
      recording: { format: 'MP4', sizeMb: 342 },
    });
    expect(page.mentors).toEqual([{ id: 'm1', name: 'Kwame Mensah' }]);

    await expect(
      service.getRecordingPlayback('rec-1', {
        id: 'admin-1',
        firstName: 'Ada',
        lastName: 'Obi',
      }),
    ).resolves.toEqual({ url: 'https://signed' });
    expect(audit.record).toHaveBeenCalledTimes(2);
    expect(audit.record).toHaveBeenCalledWith(
      expect.objectContaining({ userId: 'e1', action: 'RECORDING_VIEWED' }),
    );
  });
});
