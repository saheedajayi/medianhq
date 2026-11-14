import { AdminAnalyticsService } from '../../../../../src/modules/admin/analytics/admin-analytics.service';

describe('AdminAnalyticsService', () => {
  // 10:42 in Lagos on Wednesday 7 October 2026
  const now = new Date('2026-10-07T09:42:00.000Z');
  const at = (iso: string) => new Date(iso);

  it('scores each industry by mentors per mentee', async () => {
    const group = (industry: string, count: number) => ({
      industry,
      _count: { _all: count },
    });
    const repository = {
      countMentorsByIndustry: jest
        .fn()
        .mockResolvedValue([group('Tech', 12), group('Finance', 4)]),
      countMenteesByIndustry: jest
        .fn()
        .mockResolvedValue([group('Tech', 10), group('Finance', 8)]),
      findProfileCreations: jest
        .fn()
        .mockResolvedValue([
          { industry: 'Tech', createdAt: at('2026-10-06T09:00:00.000Z') },
        ]),
    };
    const service = new AdminAnalyticsService(repository as never);

    const { verticals } = await service.getDemandRatio(now);

    expect(
      verticals.map((row) => [row.vertical, row.ratio, row.status]),
    ).toEqual([
      ['Tech', 1.2, 'BALANCED'],
      ['Finance', 0.5, 'NEEDS_SUPPLY'],
    ]);
    // The new Tech profile lands in the latest of the seven weeks
    expect(verticals[0].trend).toEqual([0, 0, 0, 0, 0, 0, 1]);
  });

  it('follows booking requests through to scheduled sessions', async () => {
    const booking = (status: string, confirmedAt: Date | null) => ({
      status,
      createdAt: at('2026-10-06T09:00:00.000Z'),
      confirmedAt,
      mentor: { mentorProfile: { industry: 'Tech' } },
    });
    const repository = {
      findBookingRequests: jest
        .fn()
        .mockResolvedValue([
          booking('CONFIRMED', now),
          booking('COMPLETED', now),
          booking('DECLINED', null),
          booking('EXPIRED', null),
        ]),
    };
    const service = new AdminAnalyticsService(repository as never);

    const fillRate = await service.getFillRate(now);

    expect(fillRate.flow).toEqual({
      requests: 4,
      accepted: 2,
      scheduled: 2,
      fillRatePct: 50,
    });
    expect(fillRate.stats.failed.value).toBe(2);
    expect(fillRate.byVertical).toEqual([
      { vertical: 'Tech', fillRatePct: 50 },
    ]);
  });

  it('judges async answers against the 24 hour target', async () => {
    const person = { firstName: 'Adejoke', lastName: 'A' };
    const question = (id: string, askedAt: string, answeredAt?: string) => ({
      id,
      title: 'career guidance tips?',
      createdAt: at(askedAt),
      author: person,
      mentor: person,
      answers: answeredAt ? [{ createdAt: at(answeredAt) }] : [],
    });
    const repository = {
      findQuestions: jest.fn().mockResolvedValue([
        // Asked an hour ago and unanswered: still within the day
        question('waiting', '2026-10-07T08:42:00.000Z'),
        question(
          'on-time',
          '2026-10-06T08:00:00.000Z',
          '2026-10-06T09:25:00.000Z',
        ),
        question(
          'late',
          '2026-10-04T08:00:00.000Z',
          '2026-10-05T10:00:00.000Z',
        ),
        // Unanswered for two days
        question('ignored', '2026-10-05T08:00:00.000Z'),
      ]),
    };
    const service = new AdminAnalyticsService(repository as never);

    const metrics = await service.getResponseMetrics(now);

    expect(metrics.recent.map((thread) => [thread.id, thread.status])).toEqual([
      ['waiting', 'WAITING'],
      ['on-time', 'ON_TIME'],
      ['late', 'LATE'],
      ['ignored', 'LATE'],
    ]);
    expect(metrics.sla).toEqual({ met: 1, missed: 2 });
    expect(metrics.stats.threadVolume.value).toBe(4);
    // 85 minutes and 26 hours: the median of the two answered threads
    expect(metrics.stats.medianResponseMinutes.value).toBe(823);
  });
});
