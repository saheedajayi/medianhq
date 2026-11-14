import { AdminFinanceService } from '../../../../../src/modules/admin/finance/admin-finance.service';

describe('AdminFinanceService', () => {
  const now = new Date('2026-10-07T09:42:00.000Z');
  const payment = (amount: number, createdAt: string, type = 'ONE_ON_ONE') => ({
    amount,
    createdAt: new Date(createdAt),
    booking: { mentorSession: { type } },
  });

  it('buckets session revenue by day and reports subscriptions as zero', async () => {
    const repository = {
      findSuccessfulPayments: jest.fn().mockResolvedValue([
        payment(20000, '2026-10-07T08:00:00.000Z'),
        payment(10000, '2026-10-06T08:00:00.000Z', 'GROUP'),
        // Last week, so it only counts towards the comparison
        payment(15000, '2026-09-29T08:00:00.000Z'),
      ]),
    };
    const service = new AdminFinanceService(repository as never);

    const revenue = await service.getRevenue({ period: 'daily' }, now);

    expect(revenue.series).toHaveLength(7);
    expect(revenue.series.at(-1)).toMatchObject({
      label: 'Oct 7',
      sessionRevenue: 20000,
      subscriptionRevenue: 0,
      growthPct: 100,
    });
    expect(revenue.stats.totalRevenue).toEqual({
      amount: 30000,
      changePct: 100,
    });
    expect(revenue.stats.subscriptionRevenue).toEqual({
      amount: 0,
      changePct: null,
    });
    expect(revenue.byProduct).toEqual({ oneOnOne: 20000, group: 10000 });
    expect(revenue.insights.topEarning).toEqual({
      label: 'Oct 7',
      amount: 20000,
    });
  });

  it('treats an unrecognised payout status as pending', async () => {
    const payout = (id: string, status: string) => ({
      id,
      amount: 120000,
      currency: 'NGN',
      status,
      bankCode: '058',
      createdAt: now,
      mentor: {
        id: 'm1',
        firstName: 'Kwame',
        lastName: 'Mensah',
        mentorProfile: null,
      },
    });
    const repository = {
      findPayouts: jest
        .fn()
        .mockResolvedValue([
          payout('a', 'paid'),
          payout('b', 'QUEUED'),
          payout('c', 'FAILED'),
        ]),
      sumPayoutsByStatus: jest.fn().mockResolvedValue([
        { status: 'paid', _sum: { amount: 120000 } },
        { status: 'QUEUED', _sum: { amount: 120000 } },
      ]),
      findPayoutAmounts: jest.fn().mockResolvedValue([]),
    };
    const service = new AdminFinanceService(repository as never);

    const payouts = await service.getPayouts({ status: 'PENDING' }, now);

    expect(payouts.items.map((item) => item.id)).toEqual(['b']);
    expect(payouts.stats.totalPaidOut.amount).toBe(120000);
    expect(payouts.stats.pendingBalance.amount).toBe(120000);
    expect(payouts.stats.failedDisbursements.amount).toBe(0);
  });

  it('describes why a booking was refunded', async () => {
    const refund = (
      id: string,
      status: string,
      cancellationReason: string | null,
    ) => ({
      id,
      amount: 25000,
      refundAmount: 25000,
      refundStatus: 'PROCESSED',
      refundedAt: now,
      updatedAt: now,
      booking: {
        id: `bk-${id}`,
        status,
        cancellationReason,
        mentee: {
          id: 'e1',
          firstName: 'Aisha',
          lastName: 'Bello',
          menteeProfile: null,
        },
      },
    });
    const repository = {
      buildRefundsWhereClause: jest.fn().mockReturnValue({}),
      findRefunds: jest
        .fn()
        .mockResolvedValue([
          refund('a', 'EXPIRED', null),
          refund('b', 'CANCELLED', 'Changed plans'),
        ]),
      countRefunds: jest.fn().mockResolvedValue(2),
      countRefundsByStatus: jest
        .fn()
        .mockResolvedValue([
          { refundStatus: 'PROCESSED', _count: { _all: 2 } },
        ]),
      findRefundStatuses: jest.fn().mockResolvedValue([]),
    };
    const service = new AdminFinanceService(repository as never);

    const refunds = await service.getRefunds({}, now);

    expect(refunds.items.map((item) => [item.reason, item.status])).toEqual([
      ['Mentor did not respond', 'COMPLETED'],
      ['Changed plans', 'COMPLETED'],
    ]);
    expect(refunds.stats.completed.count).toBe(2);
    expect(refunds.stats.failed.count).toBe(0);
  });
});
