import { Injectable } from '@nestjs/common';
import { BookingStatus, PaymentStatus } from '@prisma/client';
import { PrismaService } from '../../../database/prisma.service';

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
    return this.prisma.booking.updateMany({
      where: { id: bookingId, status: BookingStatus.PENDING_PAYMENT },
      data: { status: BookingStatus.PENDING_CONFIRMATION, respondBy },
    });
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
  async confirmPaymentAndRequestMentor(paymentId: string, bookingId: string, respondBy: Date) {
    const [payment, moved] = await this.prisma.$transaction([
      this.prisma.payment.update({
        where: { id: paymentId },
        data: { status: PaymentStatus.SUCCESSFUL },
      }),
      this.prisma.booking.updateMany({
        where: { id: bookingId, status: BookingStatus.PENDING_PAYMENT },
        data: { status: BookingStatus.PENDING_CONFIRMATION, respondBy },
      }),
    ]);
    const booking = await this.prisma.booking.findUnique({ where: { id: bookingId } });
    return { payment, booking, movedToMentor: moved.count > 0 };
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
