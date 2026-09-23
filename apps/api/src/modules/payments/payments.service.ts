import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { BookingStatus, PaymentStatus } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import type { AuthUser } from '../auth/dto/auth.dto';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async initialize(user: AuthUser, bookingId: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        mentor: {
          include: { mentorProfile: true },
        },
        mentee: true,
        payment: true,
      },
    });

    if (!booking) {
      throw new NotFoundException(`Booking with ID '${bookingId}' not found.`);
    }

    if (booking.menteeId !== user.id) {
      throw new ForbiddenException('Only the mentee who booked this session can make payment.');
    }

    if (booking.status === BookingStatus.CONFIRMED) {
      return {
        message: 'Booking is already confirmed.',
        status: 'CONFIRMED',
        booking,
      };
    }

    // Determine amount
    const amount = booking.payment?.amount || booking.mentor.mentorProfile?.pricePerSession || 0;
    if (amount <= 0) {
      // Free session - confirm immediately
      await this.prisma.booking.update({
        where: { id: bookingId },
        data: { status: BookingStatus.CONFIRMED },
      });
      return {
        message: 'Free session confirmed successfully.',
        status: 'CONFIRMED',
        isFree: true,
      };
    }

    const reference = `MEDIAN_${bookingId}_${Date.now()}`;
    const paystackSecret = process.env.PAYSTACK_SECRET_KEY;
    const webOrigin = process.env.WEB_ORIGIN || 'http://localhost:3000';
    const callbackUrl = `${webOrigin}/mentee/booking-session?payment=success&bookingId=${bookingId}&reference=${reference}`;

    let authorizationUrl = `${webOrigin}/mentee/booking-session?payment=mock_success&bookingId=${bookingId}&reference=${reference}`;

    if (paystackSecret && !paystackSecret.includes('placeholder')) {
      try {
        const response = await fetch('https://api.paystack.co/transaction/initialize', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${paystackSecret}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: user.email,
            amount: amount * 100, // Paystack operates in kobo
            reference,
            callback_url: callbackUrl,
            metadata: {
              bookingId,
              mentorId: booking.mentorId,
              menteeId: booking.menteeId,
            },
          }),
        });

        const data: any = await response.json();
        if (data.status && data.data?.authorization_url) {
          authorizationUrl = data.data.authorization_url;
        } else {
          this.logger.warn(`Paystack initialize returned unexpected response: ${JSON.stringify(data)}`);
        }
      } catch (err) {
        this.logger.error('Failed to communicate with Paystack API', err);
      }
    }

    // Save payment record in DB
    const payment = await this.prisma.payment.upsert({
      where: { bookingId },
      create: {
        bookingId,
        amount,
        currency: booking.mentor.mentorProfile?.currency || 'NGN',
        status: PaymentStatus.PENDING,
        provider: 'PAYSTACK',
        providerReference: reference,
        authorizationUrl,
      },
      update: {
        amount,
        providerReference: reference,
        authorizationUrl,
        status: PaymentStatus.PENDING,
      },
    });

    return {
      success: true,
      authorizationUrl,
      reference,
      amount,
      currency: payment.currency,
      payment,
    };
  }

  async verify(reference: string) {
    const payment = await this.prisma.payment.findFirst({
      where: {
        OR: [{ providerReference: reference }, { bookingId: reference }],
      },
      include: {
        booking: true,
      },
    });

    if (!payment) {
      throw new NotFoundException(`Payment with reference '${reference}' not found.`);
    }

    // Update payment and booking
    const [updatedPayment, updatedBooking] = await this.prisma.$transaction([
      this.prisma.payment.update({
        where: { id: payment.id },
        data: { status: PaymentStatus.SUCCESSFUL },
      }),
      this.prisma.booking.update({
        where: { id: payment.bookingId },
        data: { status: BookingStatus.CONFIRMED },
      }),
    ]);

    return {
      success: true,
      verified: true,
      payment: updatedPayment,
      booking: updatedBooking,
    };
  }

  async handlePaystackWebhook(payload: any) {
    this.logger.log(`Paystack webhook received: event=${payload?.event}`);

    if (payload?.event === 'charge.success') {
      const reference = payload?.data?.reference;
      if (reference) {
        try {
          await this.verify(reference);
          this.logger.log(`Successfully verified charge for reference: ${reference}`);
        } catch (err) {
          this.logger.error(`Error processing webhook charge verification: ${reference}`, err);
        }
      }
    }

    return { received: true };
  }
}
