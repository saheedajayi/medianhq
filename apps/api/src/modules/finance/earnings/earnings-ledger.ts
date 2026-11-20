import type { EarningStatus } from './dto/earnings.dto';

/** A session's earning can be withdrawn this long after it is recorded */
export const CLEARANCE_MS = 48 * 60 * 60 * 1000;

// Africa/Lagos is UTC+1 all year
const LAGOS_OFFSET_MS = 60 * 60 * 1000;

export type LedgerEarning = {
  id: string;
  /** The mentor's net earning */
  amount: number;
  grossAmount: number | null;
  createdAt: Date;
  /** The session's payment, when the earning came from a booking */
  payment: {
    amount: number;
    refundAmount: number | null;
    refundStatus: string | null;
    refundedAt: Date | null;
  } | null;
};

export type LedgerPayout = {
  amount: number;
  status: string;
  createdAt: Date;
  paidAt: Date | null;
};

export type LedgerEntry = {
  status: EarningStatus;
  clearsAt: Date;
  hasCleared: boolean;
  /** When the payout that covered this earning was paid */
  paidOutAt: Date | null;
  /** When a payout that covers this earning was requested, while it is still on its way */
  payoutRequestedAt: Date | null;
};

const sum = (values: number[]) =>
  values.reduce((total, value) => total + value, 0);

const isPaid = (payout: LedgerPayout) => payout.status === 'PROCESSED';

/** Requested and not yet paid; failed and rejected payouts are back in the balance */
const isOnItsWay = (payout: LedgerPayout) =>
  payout.status === 'PENDING' || payout.status === 'PROCESSING';

/**
 * Whether a refund reaches into the money this earning was based on. A late
 * cancellation refunds part of the payment and the mentor earns on the rest,
 * so that refund leaves the earning alone.
 */
function refundStateOf(earning: LedgerEarning): EarningStatus | null {
  const payment = earning.payment;
  if (!payment?.refundAmount || !payment.refundStatus) return null;

  const gross = earning.grossAmount ?? earning.amount;
  if (payment.refundAmount <= payment.amount - gross) return null;

  if (payment.refundStatus === 'PROCESSED') return 'REFUNDED';
  // Waiting on Paystack or on an admin, so the money is held until it is settled
  if (payment.refundStatus === 'PENDING' || payment.refundStatus === 'FAILED') {
    return 'DISPUTED';
  }
  return null;
}

/**
 * Works out where each earning stands. Payouts are lump sums, so they are
 * matched to earnings oldest first: an earning is paid out once the payouts
 * so far add up to it and everything before it.
 */
export function buildLedger(
  earnings: LedgerEarning[],
  payouts: LedgerPayout[],
  now: Date,
) {
  const paid = payouts
    .filter(isPaid)
    .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  const onItsWay = payouts
    .filter(isOnItsWay)
    .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

  let covered = 0;
  const settlements = [...paid, ...onItsWay].map((payout) => {
    covered += payout.amount;
    return { payout, coversUpTo: covered };
  });

  const entries = new Map<string, LedgerEntry>();
  let running = 0;
  const oldestFirst = [...earnings].sort(
    (a, b) => a.createdAt.getTime() - b.createdAt.getTime(),
  );

  for (const earning of oldestFirst) {
    const clearsAt = new Date(earning.createdAt.getTime() + CLEARANCE_MS);
    const entry: LedgerEntry = {
      status: 'PENDING',
      clearsAt,
      hasCleared: clearsAt.getTime() <= now.getTime(),
      paidOutAt: null,
      payoutRequestedAt: null,
    };
    entries.set(earning.id, entry);

    const refundState = refundStateOf(earning);
    if (refundState) {
      entry.status = refundState;
      continue;
    }

    running += earning.amount;
    const settlement = settlements.find((item) => item.coversUpTo >= running);
    if (!settlement) continue;

    if (isPaid(settlement.payout)) {
      entry.status = 'PAID_OUT';
      entry.paidOutAt = settlement.payout.paidAt ?? settlement.payout.createdAt;
    } else {
      entry.payoutRequestedAt = settlement.payout.createdAt;
    }
  }

  return entries;
}

/** The mentor's balance figures, from their earnings and what has been paid or requested */
export function getBalances(
  earnings: LedgerEarning[],
  payouts: LedgerPayout[],
  now: Date,
) {
  const ledger = buildLedger(earnings, payouts, now);
  const withStatus = (...statuses: EarningStatus[]) =>
    earnings.filter((earning) =>
      statuses.includes(ledger.get(earning.id)!.status),
    );

  // Refunded and held earnings aren't the mentor's to count
  const earned = withStatus('PENDING', 'PAID_OUT');
  const clearing = earned.filter(
    (earning) => !ledger.get(earning.id)!.hasCleared,
  );

  const totalEarned = sum(earned.map((earning) => earning.amount));
  const pendingClearance = sum(clearing.map((earning) => earning.amount));
  const totalPaidOut = sum(payouts.filter(isPaid).map((p) => p.amount));
  const pendingPayout = sum(payouts.filter(isOnItsWay).map((p) => p.amount));

  return {
    ledger,
    totalEarned,
    totalPaidOut,
    pendingPayout,
    pendingClearance,
    heldOnDispute: sum(withStatus('DISPUTED').map((earning) => earning.amount)),
    // A refund after a payout can leave less earned than was paid, hence the floor
    availableBalance: Math.max(
      0,
      totalEarned - pendingClearance - totalPaidOut - pendingPayout,
    ),
    nextClearanceAt: clearing.length
      ? new Date(
          Math.min(
            ...clearing.map((e) => ledger.get(e.id)!.clearsAt.getTime()),
          ),
        )
      : null,
    firstEarningAt: earned.length
      ? new Date(Math.min(...earned.map((e) => e.createdAt.getTime())))
      : null,
  };
}

/** The Lagos calendar month a moment falls in: [from, to) and a label like "October 2026" */
export function lagosMonthOf(date: Date) {
  const local = new Date(date.getTime() + LAGOS_OFFSET_MS);
  const year = local.getUTCFullYear();
  const month = local.getUTCMonth();
  return {
    from: new Date(Date.UTC(year, month, 1) - LAGOS_OFFSET_MS),
    to: new Date(Date.UTC(year, month + 1, 1) - LAGOS_OFFSET_MS),
    label: local.toLocaleDateString('en-GB', {
      timeZone: 'UTC',
      month: 'long',
      year: 'numeric',
    }),
  };
}

export const isWithin = (date: Date, range: { from: Date; to: Date }) =>
  date.getTime() >= range.from.getTime() && date.getTime() < range.to.getTime();
