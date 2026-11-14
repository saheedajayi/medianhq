import { AdminOverviewService } from '../../../../../src/modules/admin/overview/admin-overview.service';

describe('AdminOverviewService.getOverview', () => {
  // 10:42 in Lagos on Wednesday 7 October
  const now = new Date('2026-10-07T09:42:00.000Z');
  const at = (iso: string) => new Date(iso);

  const setup = () => {
    const repository = {
      findPendingApplications: jest.fn().mockResolvedValue([
        // Submitted Thursday 1 October: 4 business days old
        { submittedAt: at('2026-10-01T09:00:00.000Z'), updatedAt: now },
        { submittedAt: at('2026-10-06T09:00:00.000Z'), updatedAt: now },
      ]),
      findActiveUserIds: jest
        .fn()
        .mockResolvedValue([{ userId: 'a' }, { userId: 'b' }]),
      countCompletedBookings: jest.fn().mockResolvedValue(3),
      // One session running now, one later today
      findConfirmedBookings: jest.fn().mockResolvedValue([
        { startsAt: at('2026-10-07T09:30:00.000Z'), durationMinutes: 30 },
        { startsAt: at('2026-10-07T15:00:00.000Z'), durationMinutes: 30 },
      ]),
      sumSuccessfulPayments: jest
        .fn()
        .mockResolvedValue({ _sum: { amount: 486000 } }),
      countMentorProfiles: jest.fn().mockResolvedValue(12),
      findMentorIdsWithSessions: jest
        .fn()
        .mockResolvedValue([{ mentorId: 'm1' }]),
      findSignUpDates: jest
        .fn()
        .mockResolvedValue([{ createdAt: at('2026-10-01T00:30:00.000Z') }]),
      // 23:30 UTC is already the next day in Lagos
      findCompletedBookingStarts: jest
        .fn()
        .mockResolvedValue([
          { startsAt: at('2026-10-05T23:30:00.000Z') },
          { startsAt: at('2026-10-07T08:00:00.000Z') },
        ]),
      findNpsReviews: jest.fn().mockResolvedValue([
        { npsScore: 10, createdAt: at('2026-10-06T00:00:00.000Z') },
        { npsScore: 9, createdAt: at('2026-10-05T00:00:00.000Z') },
        { npsScore: 8, createdAt: at('2026-10-04T00:00:00.000Z') },
        { npsScore: 3, createdAt: at('2026-10-03T00:00:00.000Z') },
        { npsScore: 6, createdAt: at('2026-09-28T00:00:00.000Z') },
      ]),
      findMentorNoShows: jest.fn().mockResolvedValue([
        {
          id: 'bk1',
          startsAt: at('2026-10-07T09:00:00.000Z'),
          mentor: { firstName: 'Chinedu', lastName: 'Eze' },
        },
      ]),
      findFailedRefunds: jest.fn().mockResolvedValue([]),
    };
    return {
      repository,
      service: new AdminOverviewService(repository as never),
    };
  };

  it('summarises today, counting only sessions that are running as in progress', async () => {
    const { repository, service } = setup();
    const { stats } = await service.getOverview('7d', now);

    expect(stats).toEqual({
      monthlyActiveUsers: 2,
      sessionsToday: { total: 5, completed: 3, inProgress: 1 },
      revenueToday: { amount: 486000, currency: 'NGN' },
      mentors: { approved: 12, withSessionsLast30Days: 1 },
      pendingApplications: { total: 2, nearingReviewTarget: 1 },
    });
    // "Today" is the Lagos day, which starts at 23:00 UTC the day before
    expect(repository.countCompletedBookings).toHaveBeenCalledWith({
      gte: at('2026-10-06T23:00:00.000Z'),
      lt: at('2026-10-07T23:00:00.000Z'),
    });
  });

  it('buckets daily activity by Lagos day', async () => {
    const { service } = setup();
    const { activity } = await service.getOverview('7d', now);

    expect(activity.days.map((day) => day.date)).toEqual([
      '2026-10-01',
      '2026-10-02',
      '2026-10-03',
      '2026-10-04',
      '2026-10-05',
      '2026-10-06',
      '2026-10-07',
    ]);
    expect(activity.days.map((day) => day.sessionsCompleted)).toEqual([
      0, 0, 0, 0, 0, 1, 1,
    ]);
    expect(activity.days[0].newSignUps).toBe(1);
    expect(activity.totals).toMatchObject({
      sessionsCompleted: 2,
      newSignUps: 1,
    });
  });

  it('covers 30 days only when asked', async () => {
    const { service } = setup();

    expect((await service.getOverview('30d', now)).activity.days).toHaveLength(
      30,
    );
    expect(
      (await service.getOverview('bogus', now)).activity.days,
    ).toHaveLength(7);
  });

  it('scores NPS for the week against the week before', async () => {
    const { service } = setup();
    const { nps } = await service.getOverview('7d', now);

    expect(nps).toMatchObject({
      responses: 4,
      score: 25,
      promotersPct: 50,
      passivesPct: 25,
      detractorsPct: 25,
      // The week before had a single detractor: -100
      changeFromPreviousWeek: 125,
    });
  });

  it('lists the newest alerts first', async () => {
    const { service } = setup();
    const { alerts } = await service.getOverview('7d', now);

    expect(alerts.map((alert) => alert.kind)).toEqual([
      'CONTENT_FLAGGED',
      'PAYOUT_FAILED',
      'MENTOR_NO_SHOW',
      'APPLICATIONS_WAITING',
    ]);
    expect(alerts[2].detail).toBe('Chinedu Eze');
    expect(alerts[3].title).toBe(
      'A mentor application is nearing its review target',
    );
  });
});
