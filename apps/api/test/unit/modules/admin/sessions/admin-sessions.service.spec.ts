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
    const service = new AdminSessionsService(repository as never);

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
    const service = new AdminSessionsService(repository as never);

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
    const service = new AdminSessionsService(repository as never);

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
});
