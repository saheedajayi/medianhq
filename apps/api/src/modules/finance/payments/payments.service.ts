import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { BookingStatus, PaymentStatus } from '@prisma/client';
import { PaymentsRepository } from './payments.repository';
import type { AuthUser } from '../../identity/auth/dto/auth.dto';
import { getRespondBy } from '../../scheduling/bookings/booking-policy';
import { BookingNotificationsService } from '../../scheduling/booking-notifications/booking-notifications.service';

const PAYSTACK_API = 'https://api.paystack.co';

type PaystackRefundResponse = {
  status?: boolean;
  message?: string;
  data?: { id?: number | string; status?: string };
};

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    private readonly paymentsRepository: PaymentsRepository,
    private readonly bookingNotifications: BookingNotificationsService,
  ) {}

  async initialize(user: AuthUser, bookingId: string) {
    const booking = await this.paymentsRepository.findBookingById(bookingId);

    if (!booking) {
      throw new NotFoundException(`Booking with ID '${bookingId}' not found.`);
    }

    if (booking.menteeId !== user.id) {
      throw new ForbiddenException(
        'Only the mentee who booked this session can make payment.',
      );
    }

    if (booking.status !== BookingStatus.PENDING_PAYMENT) {
      return {
        message: 'This booking has already been paid for.',
        status: booking.status,
        booking,
      };
    }

    // The amount was fixed by the server when the booking was created
    const amount = booking.payment?.amount ?? 0;
    if (amount <= 0) {
      const moved = await this.paymentsRepository.requestMentorForFreeBooking(
        bookingId,
        getRespondBy(new Date(), booking.startsAt),
      );
      if (moved.count > 0) {
        await this.bookingNotifications.notify(bookingId, 'REQUESTED');
      }
      return {
        message: 'Free session requested. The mentor has 24 hours to accept.',
        status: BookingStatus.PENDING_CONFIRMATION,
        isFree: true,
      };
    }

    const reference = `MEDIAN_${bookingId}_${Date.now()}`;
    const webOrigin = process.env.WEB_ORIGIN;
    const paystackSecret = process.env.PAYSTACK_SECRET_KEY;
    if (!webOrigin || !paystackSecret) {
      // A setup problem on our side: log which setting is missing, but don't show it to the user
      this.logger.error(
        `Payments are not configured: ${!webOrigin ? 'WEB_ORIGIN' : 'PAYSTACK_SECRET_KEY'} is missing.`,
      );
      throw new ServiceUnavailableException(
        "Payments aren't available right now. Please try again later.",
      );
    }
    const callbackUrl = `${webOrigin}/mentee/booking-session?payment=success&bookingId=${bookingId}&reference=${reference}`;

    let authorizationUrl: string;
    try {
      const response = await fetch(
        'https://api.paystack.co/transaction/initialize',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${paystackSecret}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: user.email,
            amount: amount * 100, // Paystack operates in kobo
            currency: 'NGN',
            reference,
            callback_url: callbackUrl,
            metadata: {
              bookingId,
              mentorId: booking.mentorId,
              menteeId: booking.menteeId,
            },
          }),
        },
      );

      const data: any = await response.json();
      if (!response.ok || !data.status || !data.data?.authorization_url) {
        this.logger.error(
          `Paystack initialize returned error: ${JSON.stringify(data)}`,
        );
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
      currency: 'NGN',
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
    const payment =
      await this.paymentsRepository.findPaymentByReference(reference);

    if (!payment) {
      throw new NotFoundException(
        `Payment with reference '${reference}' not found.`,
      );
    }

    if (payment.status === PaymentStatus.SUCCESSFUL) {
      return {
        success: true,
        verified: true,
        payment,
        booking: payment.booking,
      };
    }

    // Only confirm once Paystack reports the charge as successful for the full amount
    const isPaid = await this.isPaidOnPaystack(
      payment.providerReference,
      payment.amount,
    );
    if (!isPaid) {
      return {
        success: false,
        verified: false,
        payment,
        booking: payment.booking,
      };
    }

    const {
      payment: updatedPayment,
      booking: updatedBooking,
      movedToMentor,
    } = await this.paymentsRepository.confirmPaymentAndRequestMentor(
      payment.id,
      payment.bookingId,
      getRespondBy(new Date(), payment.booking.startsAt),
    );

    if (movedToMentor) {
      await this.bookingNotifications.notify(payment.bookingId, 'REQUESTED');
    } else if (
      updatedBooking &&
      updatedBooking.status !== BookingStatus.PENDING_CONFIRMATION
    ) {
      // Paid after the booking was cancelled or expired: give the money back
      await this.refund(payment.bookingId, updatedPayment.amount);
    }

    return {
      success: true,
      verified: true,
      payment: updatedPayment,
      booking: updatedBooking,
    };
  }

  private async isPaidOnPaystack(
    providerReference: string | null | undefined,
    expectedAmount: number,
  ): Promise<boolean> {
    const paystackSecret = process.env.PAYSTACK_SECRET_KEY;
    if (!providerReference || !paystackSecret) {
      return false;
    }

    try {
      const response = await fetch(
        `https://api.paystack.co/transaction/verify/${encodeURIComponent(providerReference)}`,
        { headers: { Authorization: `Bearer ${paystackSecret}` } },
      );
      const data: any = await response.json();
      return (
        response.ok &&
        data.status === true &&
        data.data?.status === 'success' &&
        Number(data.data?.amount) >= Math.round(expectedAmount * 100) // Paystack operates in kobo
      );
    } catch (err) {
      this.logger.error(
        `Failed to verify Paystack transaction: ${providerReference}`,
        err,
      );
      return false;
    }
  }

  /**
   * Refunds part or all of a booking's payment through Paystack. Safe to call
   * more than once: a refund already pending or processed is left alone.
   * Returns the amount being refunded, or 0 when nothing was paid.
   */
  async refund(bookingId: string, amount: number): Promise<number> {
    const payment =
      await this.paymentsRepository.findPaymentByBookingId(bookingId);
    if (
      !payment ||
      payment.status !== PaymentStatus.SUCCESSFUL ||
      amount <= 0
    ) {
      return 0;
    }
    if (
      payment.refundStatus === 'PENDING' ||
      payment.refundStatus === 'PROCESSED'
    ) {
      return payment.refundAmount ?? 0;
    }

    const refundAmount = Math.min(amount, payment.amount);

    // Seeded demo payments were never charged, so there is nothing to send back
    if (payment.providerReference?.startsWith('DEMO_')) {
      await this.paymentsRepository.updatePayment(payment.id, {
        refundAmount,
        refundStatus: 'PROCESSED',
        refundedAt: new Date(),
        status: PaymentStatus.REFUNDED,
      });
      return refundAmount;
    }

    const paystackSecret = process.env.PAYSTACK_SECRET_KEY;

    try {
      if (!paystackSecret || !payment.providerReference) {
        throw new Error('Missing PAYSTACK_SECRET_KEY or payment reference.');
      }
      const response = await fetch(`${PAYSTACK_API}/refund`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${paystackSecret}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transaction: payment.providerReference,
          amount: refundAmount * 100, // Paystack operates in kobo
        }),
      });
      const data = (await response.json()) as PaystackRefundResponse;
      if (!response.ok || !data.status) {
        throw new Error(
          data.message || `Paystack refund failed with ${response.status}`,
        );
      }

      const isProcessed = data.data?.status === 'processed';
      await this.paymentsRepository.updatePayment(payment.id, {
        refundAmount,
        refundStatus: isProcessed ? 'PROCESSED' : 'PENDING',
        refundReference: data.data?.id ? String(data.data.id) : null,
        ...(isProcessed
          ? { status: PaymentStatus.REFUNDED, refundedAt: new Date() }
          : {}),
      });
    } catch (err) {
      // Recorded as FAILED so the team can retry from the Paystack dashboard
      this.logger.error(`Refund failed for booking ${bookingId}`, err);
      await this.paymentsRepository.updatePayment(payment.id, {
        refundAmount,
        refundStatus: 'FAILED',
      });
    }

    return refundAmount;
  }

  /**
   * Refund webhooks aren't signature-checked, so the refund is re-read from
   * Paystack instead of trusting the payload.
   */
  private async syncRefund(refundId: string) {
    const payment =
      await this.paymentsRepository.findPaymentByRefundReference(refundId);
    const paystackSecret = process.env.PAYSTACK_SECRET_KEY;
    if (!payment || !paystackSecret) return;

    const response = await fetch(
      `${PAYSTACK_API}/refund/${encodeURIComponent(refundId)}`,
      {
        headers: { Authorization: `Bearer ${paystackSecret}` },
      },
    );
    const data = (await response.json()) as PaystackRefundResponse;
    const status = data.data?.status;
    if (!response.ok || !status) return;

    if (status === 'processed') {
      await this.paymentsRepository.updatePayment(payment.id, {
        refundStatus: 'PROCESSED',
        refundedAt: new Date(),
        status: PaymentStatus.REFUNDED,
      });
    } else if (status === 'failed') {
      await this.paymentsRepository.updatePayment(payment.id, {
        refundStatus: 'FAILED',
      });
    }
  }

  async handlePaystackWebhook(payload: any) {
    this.logger.log(`Paystack webhook received: event=${payload?.event}`);

    const event = (payload as { event?: unknown } | null)?.event;
    if (typeof event === 'string' && event.startsWith('refund.')) {
      const data = (
        payload as { data?: { id?: unknown; refund_reference?: unknown } }
      ).data;
      const refundId = data?.id ?? data?.refund_reference;
      if (typeof refundId === 'string' || typeof refundId === 'number') {
        try {
          await this.syncRefund(String(refundId));
        } catch (err) {
          this.logger.error(`Error syncing refund ${String(refundId)}`, err);
        }
      }
    }

    if (payload?.event === 'charge.success') {
      const reference = payload?.data?.reference;
      if (reference) {
        try {
          await this.verify(reference);
          this.logger.log(
            `Successfully verified charge for reference: ${reference}`,
          );
        } catch (err) {
          this.logger.error(
            `Error processing webhook charge verification: ${reference}`,
            err,
          );
        }
      }
    }

    return { received: true };
  }
}
