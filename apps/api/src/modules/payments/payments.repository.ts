import { Injectable } from '@nestjs/common';
import { BookingStatus, PaymentStatus } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';

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

  updateBookingStatus(bookingId: string, status: BookingStatus) {
    return this.prisma.booking.update({
      where: { id: bookingId },
      data: { status },
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

  confirmPaymentAndBooking(paymentId: string, bookingId: string) {
    return this.prisma.$transaction([
      this.prisma.payment.update({
        where: { id: paymentId },
        data: { status: PaymentStatus.SUCCESSFUL },
      }),
      this.prisma.booking.update({
        where: { id: bookingId },
        data: { status: BookingStatus.CONFIRMED },
      }),
    ]);
  }
}
