import {
  buildLedger,
  getBalances,
  lagosMonthOf,
  type LedgerEarning,
  type LedgerPayout,
} from '../../../../../src/modules/finance/earnings/earnings-ledger';

describe('earnings ledger', () => {
  const now = new Date('2026-10-26T12:00:00.000Z');

  const earning = (
    id: string,
    amount: number,
    createdAt: string,
    payment: LedgerEarning['payment'] = null,
  ): LedgerEarning => ({
    id,
    amount,
    grossAmount: amount + 1000,
    createdAt: new Date(createdAt),
    payment,
  });

  const payout = (
    amount: number,
    status: string,
    createdAt: string,
  ): LedgerPayout => ({
    amount,
    status,
    createdAt: new Date(createdAt),
    paidAt: status === 'PROCESSED' ? new Date(createdAt) : null,
  });

  it('holds an earning back until 48 hours after it was recorded', () => {
    const balances = getBalances(
      [
        earning('cleared', 18600, '2026-10-20T10:00:00.000Z'),
        earning('clearing', 4250, '2026-10-25T13:00:00.000Z'),
      ],
      [],
      now,
    );

    expect(balances.availableBalance).toBe(18600);
    expect(balances.pendingClearance).toBe(4250);
    expect(balances.nextClearanceAt).toEqual(
      new Date('2026-10-27T13:00:00.000Z'),
    );
    expect(balances.totalEarned).toBe(22850);
  });

  it('matches payouts to the oldest earnings first', () => {
    const ledger = buildLedger(
      [
        earning('first', 10000, '2026-09-01T10:00:00.000Z'),
        earning('second', 10000, '2026-09-05T10:00:00.000Z'),
        earning('third', 10000, '2026-09-10T10:00:00.000Z'),
      ],
      [
        payout(10000, 'PROCESSED', '2026-09-08T10:00:00.000Z'),
        payout(10000, 'PENDING', '2026-09-12T10:00:00.000Z'),
      ],
      now,
    );

    expect(ledger.get('first')).toMatchObject({
      status: 'PAID_OUT',
      paidOutAt: new Date('2026-09-08T10:00:00.000Z'),
    });
    // Requested but not paid yet, so it still reads as pending
    expect(ledger.get('second')).toMatchObject({
      status: 'PENDING',
      payoutRequestedAt: new Date('2026-09-12T10:00:00.000Z'),
    });
    expect(ledger.get('third')).toMatchObject({
      status: 'PENDING',
      payoutRequestedAt: null,
    });
  });

  it('takes requested payouts out of the balance and puts failed ones back', () => {
    const earnings = [earning('only', 30000, '2026-09-01T10:00:00.000Z')];

    expect(
      getBalances(
        earnings,
        [payout(30000, 'PROCESSING', '2026-09-08T10:00:00.000Z')],
        now,
      ).availableBalance,
    ).toBe(0);
    expect(
      getBalances(
        earnings,
        [
          payout(30000, 'FAILED', '2026-09-08T10:00:00.000Z'),
          payout(30000, 'REJECTED', '2026-09-09T10:00:00.000Z'),
        ],
        now,
      ).availableBalance,
    ).toBe(30000);
  });

  it('reverses an earning whose session was refunded and holds one still in question', () => {
    const paid = { amount: 19600, refundedAt: null };
    const balances = getBalances(
      [
        earning('kept', 18600, '2026-09-01T10:00:00.000Z'),
        earning('refunded', 18600, '2026-09-02T10:00:00.000Z', {
          ...paid,
          refundAmount: 19600,
          refundStatus: 'PROCESSED',
        }),
        earning('held', 18600, '2026-09-03T10:00:00.000Z', {
          ...paid,
          refundAmount: 19600,
          refundStatus: 'PENDING',
        }),
      ],
      [],
      now,
    );

    expect(balances.ledger.get('refunded')?.status).toBe('REFUNDED');
    expect(balances.ledger.get('held')?.status).toBe('DISPUTED');
    expect(balances.heldOnDispute).toBe(18600);
    expect(balances.totalEarned).toBe(18600);
    expect(balances.availableBalance).toBe(18600);
  });

  it('leaves the earning from a late cancellation alone, as the refund was only the other half', () => {
    // Paid 20,000, half refunded, and the mentor earns on the half that was kept
    const lateCancellation: LedgerEarning = {
      id: 'late',
      amount: 9500,
      grossAmount: 10000,
      createdAt: new Date('2026-09-01T10:00:00.000Z'),
      payment: {
        amount: 20000,
        refundAmount: 10000,
        refundStatus: 'PROCESSED',
        refundedAt: new Date('2026-09-01T10:00:00.000Z'),
      },
    };

    const ledger = buildLedger([lateCancellation], [], now);

    expect(ledger.get('late')?.status).toBe('PENDING');
  });

  it('uses the Lagos calendar for a month', () => {
    // 23:30 UTC on 30 September is already 1 October in Lagos
    const month = lagosMonthOf(new Date('2026-09-30T23:30:00.000Z'));

    expect(month.label).toBe('October 2026');
    expect(month.from).toEqual(new Date('2026-09-30T23:00:00.000Z'));
    expect(month.to).toEqual(new Date('2026-10-31T23:00:00.000Z'));
  });
});
