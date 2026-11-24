import { Injectable } from '@nestjs/common';
import { BookingStatus, PaymentStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../../database/prisma.service';
import {
  isTimeTaken,
  lockMentorCalendar,
} from '../../scheduling/bookings/mentor-calendar';

/** Saved on a booking that was paid for after someone else took its time */
export const SLOT_TAKEN_REASON =
  'Another booking took this time before payment was completed.';

@Injectable()
export class PaymentsRepository {
  constructor(private readonly prisma: PrismaService) {}

  findBookingById(bookingId: string) {
    return this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        mentor: {
          include: { mentorProfile: true },
        },
        mentee: true,
        payment: true,
      },
    });
  }

  /** Free bookings skip checkout and go straight to the mentor */
  requestMentorForFreeBooking(bookingId: string, respondBy: Date) {
    return this.prisma.$transaction((tx) =>
      this.sendToMentorIfFree(tx, bookingId, respondBy),
    );
  }

  /**
   * Moves an unpaid checkout on to the mentor. A checkout only holds its time
   * for a while, so if someone else booked it since, this one is cancelled
   * instead of putting two people in the same slot.
   */
  private async sendToMentorIfFree(
    tx: Prisma.TransactionClient,
    bookingId: string,
    respondBy: Date,
  ) {
    const booking = await tx.booking.findUnique({ where: { id: bookingId } });
    if (!booking || booking.status !== BookingStatus.PENDING_PAYMENT) {
      return { count: 0, slotTaken: false };
    }

    await lockMentorCalendar(tx, booking.mentorId);
    const slotTaken = await isTimeTaken(tx, {
      mentorId: booking.mentorId,
      startsAt: booking.startsAt,
      durationMinutes: booking.durationMinutes,
      excludeBookingId: booking.id,
      // Other unpaid checkouts don't count: the one that is paid for first wins
      checkoutsHeldAt: null,
    });
    const moved = await tx.booking.updateMany({
      where: { id: bookingId, status: BookingStatus.PENDING_PAYMENT },
      data: slotTaken
        ? {
            status: BookingStatus.CANCELLED,
            cancelledAt: new Date(),
            cancellationReason: SLOT_TAKEN_REASON,
          }
        : { status: BookingStatus.PENDING_CONFIRMATION, respondBy },
    });
    return {
      count: slotTaken ? 0 : moved.count,
      slotTaken: slotTaken && moved.count > 0,
    };
  }

  upsertPayment(
    bookingId: string,
    data: {
      amount: number;
      currency: string;
      status: PaymentStatus;
      provider: string;
      providerReference: string;
      authorizationUrl: string;
      chargeAmount: number | null;
      chargeCurrency: string | null;
    },
  ) {
    return this.prisma.payment.upsert({
      where: { bookingId },
      create: {
        bookingId,
        ...data,
      },
      update: {
        amount: data.amount,
        providerReference: data.providerReference,
        authorizationUrl: data.authorizationUrl,
        status: data.status,
        // A mentee can start in one currency and come back in another
        provider: data.provider,
        chargeAmount: data.chargeAmount,
        chargeCurrency: data.chargeCurrency,
      },
    });
  }

  findPaymentByReference(reference: string) {
    return this.prisma.payment.findFirst({
      where: {
        OR: [{ providerReference: reference }, { bookingId: reference }],
      },
      include: {
        booking: true,
      },
    });
  }

  /**
   * Marks the payment successful and hands the booking to the mentor to accept.
   * Only moves bookings still awaiting payment, so a late or repeated
   * confirmation can't revive a booking that was cancelled in the meantime.
   */
  async confirmPaymentAndRequestMentor(
    paymentId: string,
    bookingId: string,
    respondBy: Date,
  ) {
    const { payment, moved } = await this.prisma.$transaction(async (tx) => ({
      payment: await tx.payment.update({
        where: { id: paymentId },
        data: { status: PaymentStatus.SUCCESSFUL },
      }),
      moved: await this.sendToMentorIfFree(tx, bookingId, respondBy),
    }));
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
    });
    return {
      payment,
      booking,
      movedToMentor: moved.count > 0,
      slotTaken: moved.slotTaken,
    };
  }

  findPaymentByBookingId(bookingId: string) {
    return this.prisma.payment.findUnique({ where: { bookingId } });
  }

  findPaymentByRefundReference(refundReference: string) {
    return this.prisma.payment.findFirst({ where: { refundReference } });
  }

  updatePayment(
    paymentId: string,
    data: {
      status?: PaymentStatus;
      refundAmount?: number;
      refundStatus?: string;
      refundReference?: string | null;
      refundedAt?: Date | null;
    },
  ) {
    return this.prisma.payment.update({ where: { id: paymentId }, data });
  }
}
