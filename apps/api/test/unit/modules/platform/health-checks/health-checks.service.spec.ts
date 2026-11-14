import {
  HealthChecksService,
  p95,
} from '../../../../../src/modules/platform/health-checks/health-checks.service';

describe('HealthChecksService.getSummary', () => {
  const now = new Date('2026-10-07T09:42:00.000Z');
  const minutesAgo = (minutes: number) =>
    new Date(now.getTime() - minutes * 60 * 1000);

  const setup = (overrides: Record<string, unknown> = {}) => {
    const repository = {
      findLatest: jest.fn().mockResolvedValue({
        checkedAt: minutesAgo(1),
        livekitOk: true,
        livekitMs: 210,
        paystackOk: true,
        paystackMs: 180,
      }),
      // Checks began 1,000 minutes ago and 999 of those minutes had one
      findFirstSince: jest
        .fn()
        .mockResolvedValue({ checkedAt: minutesAgo(1000) }),
      countCheckedMinutes: jest.fn().mockResolvedValue(999),
      findLivekitLatencies: jest.fn().mockResolvedValue(
        Array.from({ length: 20 }, (_, index) => ({
          livekitMs: 200 + index,
        })),
      ),
      ...overrides,
    };
    return new HealthChecksService(repository as never);
  };

  it('reports uptime from checks since the first one', async () => {
    const summary = await setup().getSummary(now);

    expect(summary.status).toBe('OPERATIONAL');
    expect(summary.items[0]).toMatchObject({
      value: '99.90%',
      status: 'OPERATIONAL',
    });
    expect(summary.items[1]).toMatchObject({
      value: '218 ms',
      statusLabel: 'p95 · Operational',
    });
  });

  it('degrades when Paystack could not be reached', async () => {
    const summary = await setup({
      findLatest: jest.fn().mockResolvedValue({
        checkedAt: minutesAgo(1),
        livekitOk: true,
        livekitMs: 210,
        paystackOk: false,
        paystackMs: null,
      }),
    }).getSummary(now);

    expect(summary.status).toBe('DEGRADED');
    expect(summary.items[2]).toMatchObject({
      value: 'Paystack unreachable',
      statusLabel: 'Last check failed',
    });
  });

  it('says so before the first check', async () => {
    const summary = await setup({
      findLatest: jest.fn().mockResolvedValue(null),
      findFirstSince: jest.fn().mockResolvedValue(null),
      countCheckedMinutes: jest.fn().mockResolvedValue(0),
      findLivekitLatencies: jest.fn().mockResolvedValue([]),
    }).getSummary(now);

    expect(summary.items[0].value).toBe('No checks yet');
    expect(summary.status).toBe('DEGRADED');
  });

  it('takes the 95th percentile', () => {
    expect(p95([5, 1, 3, 2, 4])).toBe(5);
    expect(p95([])).toBeNull();
  });
});
