import { BookingStatus, Prisma } from '@prisma/client';
import { PAYMENT_HOLD_MS } from './booking-policy';

/** Bookings that hold a slot on the mentor's calendar */
export const ACTIVE_STATUSES = [
  BookingStatus.PENDING_CONFIRMATION,
  BookingStatus.CONFIRMED,
];

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Makes every other change to this mentor's calendar wait until the
 * transaction ends. Without it two people can both find a time free and both
 * take it.
 */
export async function lockMentorCalendar(
  tx: Prisma.TransactionClient,
  mentorId: string,
) {
  await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${mentorId}))`;
}

/** Whether another booking already holds any part of this time; call after lockMentorCalendar */
export async function isTimeTaken(
  tx: Prisma.TransactionClient,
  params: {
    mentorId: string;
    startsAt: Date;
    durationMinutes: number;
    excludeBookingId: string | undefined;
    /** Unpaid checkouts count while their hold lasts; pass null to ignore them */
    checkoutsHeldAt: Date | null;
  },
) {
  const { mentorId, startsAt, durationMinutes, excludeBookingId } = params;
  const endsAt = new Date(startsAt.getTime() + durationMinutes * 60 * 1000);
  const others = await tx.booking.findMany({
    where: {
      mentorId,
      ...(excludeBookingId ? { id: { not: excludeBookingId } } : {}),
      // No session runs anywhere near a day, so earlier ones can't reach this time
      startsAt: { lt: endsAt, gt: new Date(startsAt.getTime() - DAY_MS) },
      OR: [
        { status: { in: ACTIVE_STATUSES } },
        ...(params.checkoutsHeldAt
          ? [
              {
                status: BookingStatus.PENDING_PAYMENT,
                createdAt: {
                  gt: new Date(
                    params.checkoutsHeldAt.getTime() - PAYMENT_HOLD_MS,
                  ),
                },
              },
            ]
          : []),
      ],
    },
    select: { startsAt: true, durationMinutes: true },
  });
  return others.some(
    (other) =>
      other.startsAt.getTime() + other.durationMinutes * 60 * 1000 >
      startsAt.getTime(),
  );
}
