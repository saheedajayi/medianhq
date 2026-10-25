import { Injectable } from '@nestjs/common';
import { BookingStatus, PaymentStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { PAYMENT_HOLD_MS } from './booking-policy';

const PARTICIPANTS_INCLUDE = {
  mentor: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      mentorProfile: true,
    },
  },
  mentee: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      menteeProfile: true,
    },
  },
  payment: true,
  review: true,
  feedback: true,
  session: true,
} satisfies Prisma.BookingInclude;

export type BookingWithDetails = Prisma.BookingGetPayload<{
  include: typeof PARTICIPANTS_INCLUDE;
}>;

/** Bookings that hold a slot on the mentor's calendar */
const ACTIVE_STATUSES = [
  BookingStatus.PENDING_CONFIRMATION,
  BookingStatus.CONFIRMED,
];

@Injectable()
export class BookingsRepository {
  constructor(private readonly prisma: PrismaService) {}

  findUserWithMentorProfile(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      include: { mentorProfile: true },
    });
  }

  findMentorProfileWithUser(id: string) {
    return this.prisma.mentorProfile.findUnique({
      where: { id },
      include: { user: true },
    });
  }

  findMentorSession(id: string, mentorId: string) {
    return this.prisma.mentorSession.findFirst({ where: { id, mentorId } });
  }

  findWeeklyAvailability(mentorId: string) {
    return this.prisma.weeklyAvailability.findMany({ where: { mentorId } });
  }

  /** Time ranges already taken on the mentor's calendar between from and to */
  async findBusyRanges(params: {
    mentorId: string;
    from: Date;
    to: Date;
    now: Date;
    excludeBookingId?: string;
  }) {
    const { mentorId, from, to, now, excludeBookingId } = params;
    const bookings = await this.prisma.booking.findMany({
      where: {
        mentorId,
        startsAt: { lt: to },
        ...(excludeBookingId ? { id: { not: excludeBookingId } } : {}),
        OR: [
          { status: { in: ACTIVE_STATUSES } },
          // A checkout in progress holds its slot for a short while
          {
            status: BookingStatus.PENDING_PAYMENT,
            createdAt: { gt: new Date(now.getTime() - PAYMENT_HOLD_MS) },
          },
        ],
      },
      select: { startsAt: true, durationMinutes: true },
    });

    return bookings
      .map((b) => ({
        startsAt: b.startsAt,
        endsAt: new Date(b.startsAt.getTime() + b.durationMinutes * 60 * 1000),
      }))
      .filter((range) => range.endsAt > from);
  }

  async createBookingWithPayment(
    bookingData: {
      mentorId: string;
      menteeId: string;
      startsAt: Date;
      durationMinutes: number;
      status: BookingStatus;
      title: string;
      mentorSessionId?: string;
      respondBy?: Date;
      notes?: string;
      meetingUrl?: string;
    },
    paymentData?: {
      amount: number;
      currency: string;
      status: PaymentStatus;
      provider: string;
    },
  ) {
    const booking = await this.prisma.booking.create({
      data: bookingData,
    });

    let payment = null;
    if (paymentData) {
      payment = await this.prisma.payment.create({
        data: {
          bookingId: booking.id,
          amount: paymentData.amount,
          currency: paymentData.currency,
          status: paymentData.status,
          provider: paymentData.provider,
        },
      });
    }

    return { booking, payment };
  }

  findUserBookings(userId: string) {
    return this.prisma.booking.findMany({
      where: {
        OR: [{ menteeId: userId }, { mentorId: userId }],
        // Unpaid checkouts are not real bookings yet, so they never appear in booking lists
        status: { not: BookingStatus.PENDING_PAYMENT },
      },
      include: PARTICIPANTS_INCLUDE,
      orderBy: {
        startsAt: 'desc',
      },
    });
  }

  findBookingById(id: string) {
    return this.prisma.booking.findUnique({
      where: { id },
      include: PARTICIPANTS_INCLUDE,
    });
  }

  /**
   * The mentee's booking of this session that hasn't ended yet, if any.
   * mentorSessionId null means the mentor's standard 1:1 at profile price.
   */
  async findActiveBookingOfSession(params: {
    menteeId: string;
    mentorId: string;
    mentorSessionId: string | null;
    now: Date;
  }) {
    const { menteeId, mentorId, mentorSessionId, now } = params;
    const candidates = await this.prisma.booking.findMany({
      where: {
        menteeId,
        mentorId,
        mentorSessionId,
        OR: [
          { status: { in: ACTIVE_STATUSES } },
          {
            status: BookingStatus.PENDING_PAYMENT,
            createdAt: { gt: new Date(now.getTime() - PAYMENT_HOLD_MS) },
          },
        ],
      },
      select: { id: true, startsAt: true, durationMinutes: true },
      orderBy: { startsAt: 'asc' },
    });
    return (
      candidates.find(
        (b) =>
          b.startsAt.getTime() + b.durationMinutes * 60 * 1000 > now.getTime(),
      ) ?? null
    );
  }

  /** Just the booking and its payment: all an accept, cancel or reschedule needs */
  findBookingForAction(id: string) {
    return this.prisma.booking.findUnique({
      where: { id },
      include: { payment: true },
    });
  }

  findEarningForBooking(bookingId: string) {
    return this.prisma.mentorEarning.findUnique({ where: { bookingId } });
  }

  updateBooking(id: string, data: Prisma.BookingUpdateInput) {
    return this.prisma.booking.update({
      where: { id },
      data,
    });
  }

  /**
   * Updates a booking only while it's still in one of the expected statuses,
   * so two requests racing (say, accept and expire) can't both win.
   * Returns whether this call made the change.
   */
  async transition(
    id: string,
    from: BookingStatus[],
    data: Prisma.BookingUncheckedUpdateManyInput,
  ) {
    const result = await this.prisma.booking.updateMany({
      where: { id, status: { in: from } },
      data,
    });
    return result.count > 0;
  }

  findExpiredRequests(now: Date) {
    return this.prisma.booking.findMany({
      where: {
        status: BookingStatus.PENDING_CONFIRMATION,
        OR: [{ respondBy: { lte: now } }, { startsAt: { lte: now } }],
      },
      include: { payment: true },
    });
  }

  /** Confirmed sessions whose end time has passed and still need an outcome */
  async findEndedSessions(now: Date) {
    const candidates = await this.prisma.booking.findMany({
      where: { status: BookingStatus.CONFIRMED, startsAt: { lte: now } },
      include: { payment: true },
    });
    return candidates.filter(
      (b) =>
        b.startsAt.getTime() + b.durationMinutes * 60 * 1000 <= now.getTime(),
    );
  }

  createEarning(data: {
    mentorId: string;
    bookingId: string;
    amount: number;
    grossAmount: number;
    platformFee: number;
    currency: string;
  }) {
    // bookingId is unique, so a second attempt for the same booking is a no-op
    return this.prisma.mentorEarning.upsert({
      where: { bookingId: data.bookingId },
      create: data,
      update: {},
    });
  }

  recordCompletedSession(
    bookingId: string,
    completedAt: Date,
    completedMinutes: number,
  ) {
    return this.prisma.session.upsert({
      where: { bookingId },
      create: { bookingId, completedAt, completedMinutes },
      update: { completedAt, completedMinutes },
    });
  }

  upsertFeedback(data: {
    bookingId: string;
    authorId: string;
    rating: number;
    comment?: string;
    actionItems: Prisma.InputJsonValue;
    followUpNotes?: string;
  }) {
    const { bookingId, ...fields } = data;
    return this.prisma.menteeFeedback.upsert({
      where: { bookingId },
      create: data,
      update: fields,
    });
  }
}
