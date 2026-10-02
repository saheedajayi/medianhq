import { Injectable } from '@nestjs/common';
import { BookingStatus, PaymentStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';

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

  async createBookingWithPayment(
    bookingData: {
      mentorId: string;
      menteeId: string;
      startsAt: Date;
      durationMinutes: number;
      status: BookingStatus;
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
      data: {
        mentorId: bookingData.mentorId,
        menteeId: bookingData.menteeId,
        startsAt: bookingData.startsAt,
        durationMinutes: bookingData.durationMinutes,
        status: bookingData.status,
        notes: bookingData.notes,
        meetingUrl: bookingData.meetingUrl,
      },
      include: {
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
      },
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
      },
      include: {
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
        session: true,
      },
      orderBy: {
        startsAt: 'desc',
      },
    });
  }

  findBookingById(id: string) {
    return this.prisma.booking.findUnique({
      where: { id },
      include: {
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
        session: true,
      },
    });
  }

  updateBooking(id: string, data: Prisma.BookingUpdateInput) {
    return this.prisma.booking.update({
      where: { id },
      data,
    });
  }
}
