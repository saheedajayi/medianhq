import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { BookingStatus, PaymentStatus } from '@prisma/client';
import { PaymentsRepository } from './payments.repository';
import type { AuthUser } from '../auth/dto/auth.dto';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(private readonly paymentsRepository: PaymentsRepository) {}

  async initialize(user: AuthUser, bookingId: string) {
    const booking = await this.paymentsRepository.findBookingById(bookingId);

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
      await this.paymentsRepository.updateBookingStatus(
        bookingId,
        BookingStatus.CONFIRMED,
      );
      return {
        message: 'Free session confirmed successfully.',
        status: 'CONFIRMED',
        isFree: true,
      };
    }

    const reference = `MEDIAN_${bookingId}_${Date.now()}`;
    const webOrigin = process.env.WEB_ORIGIN;
    if (!webOrigin) {
      throw new Error('WEB_ORIGIN environment variable is required.');
    }
    const callbackUrl = `${webOrigin}/mentee/booking-session?payment=success&bookingId=${bookingId}&reference=${reference}`;

    const paystackSecret = process.env.PAYSTACK_SECRET_KEY;
    if (!paystackSecret) {
      throw new InternalServerErrorException(
        'PAYSTACK_SECRET_KEY environment variable is required to initialize payments.',
      );
    }

    let authorizationUrl: string;
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
      if (!response.ok || !data.status || !data.data?.authorization_url) {
        this.logger.error(`Paystack initialize returned error: ${JSON.stringify(data)}`);
        throw new BadRequestException(
          data.message || 'Payment initialization with Paystack failed.',
        );
      }

      authorizationUrl = data.data.authorization_url;
    } catch (err) {
      if (err instanceof BadRequestException) {
        throw err;
      }
      this.logger.error('Failed to communicate with Paystack API', err);
      throw new InternalServerErrorException(
        'Unable to connect to Paystack payment gateway. Please try again.',
      );
    }

    // Save payment record in DB
    const payment = await this.paymentsRepository.upsertPayment(bookingId, {
      amount,
      currency: booking.mentor.mentorProfile?.currency || 'NGN',
      status: PaymentStatus.PENDING,
      provider: 'PAYSTACK',
      providerReference: reference,
      authorizationUrl,
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
    const payment = await this.paymentsRepository.findPaymentByReference(reference);

    if (!payment) {
      throw new NotFoundException(`Payment with reference '${reference}' not found.`);
    }

    // Update payment and booking
    const [updatedPayment, updatedBooking] =
      await this.paymentsRepository.confirmPaymentAndBooking(
        payment.id,
        payment.bookingId,
      );

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
