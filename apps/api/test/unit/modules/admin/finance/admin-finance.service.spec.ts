import { AdminFinanceService } from '../../../../../src/modules/admin/finance/admin-finance.service';

const payouts = {
  bankNames: jest.fn().mockResolvedValue(new Map([['058', 'GTBank']])),
};

/** The service with stubs for everything but the repository under test */
const financeService = (repository: unknown) =>
  new AdminFinanceService(
    repository as never,
    {} as never,
    payouts as never,
    {} as never,
    {} as never,
  );

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
    const service = financeService(repository);

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
    const service = financeService(repository);

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
    const service = financeService(repository);

    const refunds = await service.getRefunds({}, now);

    expect(refunds.items.map((item) => [item.reason, item.status])).toEqual([
      ['Mentor did not respond', 'COMPLETED'],
      ['Changed plans', 'COMPLETED'],
    ]);
    expect(refunds.stats.completed.count).toBe(2);
    expect(refunds.stats.failed.count).toBe(0);
  });
});

describe('AdminFinanceService refund actions', () => {
  const refund = (
    refundStatus: string,
    refundReference: string | null = null,
  ) => ({
    id: 'pay-1',
    amount: 25000,
    refundAmount: 25000,
    refundStatus,
    refundReference,
    refundedAt: null,
    refundNote: null,
    refundNoteAt: null,
    refundNoteBy: null,
    refundInfoRequestedAt: null,
    updatedAt: new Date('2026-11-14T08:00:00.000Z'),
    booking: {
      id: 'bk-1',
      status: 'CANCELLED',
      cancellationReason: null,
      mentee: {
        id: 'e1',
        firstName: 'Aisha',
        lastName: 'Bello',
        email: 'aisha@example.com',
        menteeProfile: null,
      },
    },
  });

  const setup = (status: string, reference: string | null = null) => {
    const repository = {
      findRefundById: jest.fn().mockResolvedValue(refund(status, reference)),
      updateRefund: jest
        .fn()
        .mockImplementation((_id: string, data: { refundStatus?: string }) =>
          Promise.resolve(refund(data.refundStatus ?? status, reference)),
        ),
    };
    const payments = {
      refund: jest.fn().mockResolvedValue(25000),
      syncRefund: jest.fn().mockResolvedValue(undefined),
    };
    const email = { sendBookingUpdate: jest.fn().mockResolvedValue(undefined) };
    const audit = { record: jest.fn().mockResolvedValue(undefined) };
    const service = new AdminFinanceService(
      repository as never,
      payments as never,
      {} as never,
      email as never,
      audit as never,
    );
    return { repository, payments, email, service };
  };

  it('retries a failed refund through Paystack', async () => {
    const { payments, service } = setup('FAILED');

    await service.approveRefund('pay-1');

    expect(payments.refund).toHaveBeenCalledWith('bk-1', 25000);
  });

  it('re-checks a pending refund instead of sending another', async () => {
    const { payments, service } = setup('PENDING', 'ref-9');

    await service.approveRefund('pay-1');

    expect(payments.refund).not.toHaveBeenCalled();
    expect(payments.syncRefund).toHaveBeenCalledWith('ref-9');
  });

  it('only rejects a failed refund, and tells the mentee', async () => {
    const completed = setup('PROCESSED');
    await expect(completed.service.rejectRefund('pay-1', 'x')).rejects.toThrow(
      'Only a failed refund can be rejected.',
    );

    const failed = setup('FAILED');
    const rejected = await failed.service.rejectRefund('pay-1', 'Card closed');
    expect(rejected.status).toBe('REJECTED');
    expect(failed.email.sendBookingUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ email: 'aisha@example.com' }),
    );
  });
});
