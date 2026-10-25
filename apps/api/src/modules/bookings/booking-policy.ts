import { UserRole } from '@prisma/client';

/** How long a mentor has to accept a booking request */
export const RESPONSE_WINDOW_MS = 24 * 60 * 60 * 1000;

/** The video room opens this long before the session starts */
export const JOIN_WINDOW_MS = 15 * 60 * 1000;

/** Unpaid checkouts hold their slot this long before others can book it */
export const PAYMENT_HOLD_MS = 30 * 60 * 1000;

/** Earliest a new booking can start, so the mentor has time to respond */
export const MIN_LEAD_TIME_MS = 60 * 60 * 1000;

/** Mentees cancelling with less notice than this get a partial refund */
export const LATE_CANCELLATION_MS = 24 * 60 * 60 * 1000;
export const LATE_CANCELLATION_REFUND_RATE = 0.5;

/** Median's share of paid sessions, taken from the mentor's side */
export const PLATFORM_FEE_RATE = 0.04;
export const PLATFORM_FEE_FLAT = 100;

/**
 * The mentor's response deadline: 24 hours, but never after the session starts,
 * so a last-minute request can't be accepted once it's too late.
 */
export function getRespondBy(now: Date, startsAt: Date) {
  return new Date(
    Math.min(now.getTime() + RESPONSE_WINDOW_MS, startsAt.getTime()),
  );
}

export function getEndsAt(startsAt: Date, durationMinutes: number) {
  return new Date(startsAt.getTime() + durationMinutes * 60 * 1000);
}

export function isLateCancellation(now: Date, startsAt: Date) {
  return startsAt.getTime() - now.getTime() < LATE_CANCELLATION_MS;
}

/**
 * Refund owed when a booking is cancelled. Mentors cancelling, and anything
 * cancelled before the mentor accepted, are refunded in full; mentees
 * cancelling late get half back.
 */
export function getCancellationRefund(params: {
  amount: number;
  cancelledBy: UserRole;
  wasConfirmed: boolean;
  now: Date;
  startsAt: Date;
}) {
  const { amount, cancelledBy, wasConfirmed, now, startsAt } = params;
  if (
    cancelledBy === UserRole.MENTOR ||
    !wasConfirmed ||
    !isLateCancellation(now, startsAt)
  ) {
    return amount;
  }
  return Math.round(amount * LATE_CANCELLATION_REFUND_RATE);
}

/** Splits a paid session's price into Median's fee and the mentor's earning */
export function getEarningsBreakdown(grossAmount: number) {
  if (grossAmount <= 0) {
    return { grossAmount: 0, platformFee: 0, netAmount: 0 };
  }
  const platformFee = Math.min(
    grossAmount,
    Math.round(grossAmount * PLATFORM_FEE_RATE) + PLATFORM_FEE_FLAT,
  );
  return { grossAmount, platformFee, netAmount: grossAmount - platformFee };
}
