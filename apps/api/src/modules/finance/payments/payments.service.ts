import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { BookingStatus, PaymentStatus, type Payment } from '@prisma/client';
import { PaymentsRepository } from './payments.repository';
import { ExchangeRatesService } from '../exchange-rates/exchange-rates.service';
import {
  FlutterwaveClient,
  isFlutterwaveCurrency,
  isPaidTransaction,
  refundStatusFor,
  type FlutterwaveCurrency,
} from './flutterwave';
import type { AuthUser } from '../../identity/auth/dto/auth.dto';
import { getRespondBy } from '../../scheduling/bookings/booking-policy';
import { BookingNotificationsService } from '../../scheduling/booking-notifications/booking-notifications.service';
import { PayoutsService } from '../payouts/payouts.service';

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
    private readonly payoutsService: PayoutsService,
    private readonly exchangeRates: ExchangeRatesService,
  ) {}

  /**
   * What the mentee will pay in their chosen currency, before they pay. Naira
   * goes through Paystack; the other supported currencies through Flutterwave.
   */
  async quote(user: AuthUser, bookingId: string, currency = 'NGN') {
    const booking = await this.findPayableBooking(user, bookingId);
    const payment = booking.payment;
    if (!payment || payment.amount <= 0) {
      throw new BadRequestException('This session is free.');
    }
    if (currency === 'NGN') {
      return { amount: payment.amount, currency, provider: 'PAYSTACK' };
    }
    if (!isFlutterwaveCurrency(currency)) {
      throw new BadRequestException(`We can't take payments in ${currency}.`);
    }
    this.flutterwave();
    return {
      amount: await this.chargeIn(payment, currency),
      currency,
      provider: 'FLUTTERWAVE',
    };
  }

  async initialize(user: AuthUser, bookingId: string, currency = 'NGN') {
    if (currency !== 'NGN' && !isFlutterwaveCurrency(currency)) {
      throw new BadRequestException(`We can't take payments in ${currency}.`);
    }
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
    if (isFlutterwaveCurrency(currency) && booking.payment) {
      return this.initializeFlutterwave(user, booking.payment, {
        reference,
        currency,
        mentorId: booking.mentorId,
      });
    }

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
      chargeAmount: null,
      chargeCurrency: null,
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

  private async initializeFlutterwave(
    user: AuthUser,
    payment: Payment,
    input: {
      reference: string;
      currency: FlutterwaveCurrency;
      mentorId: string;
    },
  ) {
    const flutterwave = this.flutterwave();
    const webOrigin = this.webOrigin();
    const chargeAmount = await this.chargeIn(payment, input.currency);
    const redirectUrl = `${webOrigin}/mentee/booking-session?payment=success&bookingId=${payment.bookingId}&reference=${input.reference}`;

    let authorizationUrl: string;
    try {
      authorizationUrl = await flutterwave.createCheckout({
        reference: input.reference,
        amount: chargeAmount,
        currency: input.currency,
        redirectUrl,
        customer: {
          email: user.email,
          name: `${user.firstName} ${user.lastName}`.trim(),
        },
        meta: {
          bookingId: payment.bookingId,
          mentorId: input.mentorId,
          menteeId: user.id,
        },
      });
    } catch (err) {
      this.logger.error('Flutterwave checkout could not be started', err);
      throw new InternalServerErrorException(
        'Unable to start the payment. Please try again.',
      );
    }

    const saved = await this.paymentsRepository.upsertPayment(
      payment.bookingId,
      {
        amount: payment.amount,
        currency: 'NGN',
        status: PaymentStatus.PENDING,
        provider: 'FLUTTERWAVE',
        providerReference: input.reference,
        authorizationUrl,
        chargeAmount,
        chargeCurrency: input.currency,
      },
    );

    return {
      success: true,
      authorizationUrl,
      reference: input.reference,
      amount: chargeAmount,
      currency: input.currency,
      payment: saved,
    };
  }

  /** The booking a mentee is about to pay for, checked to be theirs and still unpaid */
  private async findPayableBooking(user: AuthUser, bookingId: string) {
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
      throw new BadRequestException('This booking has already been paid for.');
    }
    return booking;
  }

  /**
   * The price in another currency. A session listed in that currency charges
   * its listed price; anything else converts from what was listed.
   */
  private chargeIn(payment: Payment, currency: FlutterwaveCurrency) {
    const listedCurrency = payment.listedCurrency ?? payment.currency;
    const listedAmount = payment.listedAmount ?? payment.amount;
    return this.exchangeRates.convert(listedAmount, listedCurrency, currency);
  }

  private flutterwave() {
    const secret = process.env.FLUTTERWAVE_SECRET_KEY;
    if (!secret) {
      this.logger.error(
        'Payments are not configured: FLUTTERWAVE_SECRET_KEY is missing.',
      );
      throw new ServiceUnavailableException(
        "Payments in this currency aren't available right now. Please try again later.",
      );
    }
    return new FlutterwaveClient(secret);
  }

  private webOrigin() {
    const webOrigin = process.env.WEB_ORIGIN;
    if (!webOrigin) {
      this.logger.error('Payments are not configured: WEB_ORIGIN is missing.');
      throw new ServiceUnavailableException(
        "Payments aren't available right now. Please try again later.",
      );
    }
    return webOrigin;
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
    const isPaid =
      payment.provider === 'FLUTTERWAVE'
        ? await this.isPaidOnFlutterwave(payment)
        : await this.isPaidOnPaystack(
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

  private async isPaidOnFlutterwave(payment: Payment) {
    const secret = process.env.FLUTTERWAVE_SECRET_KEY;
    if (
      !secret ||
      !payment.providerReference ||
      !payment.chargeAmount ||
      !payment.chargeCurrency
    ) {
      return false;
    }
    try {
      const transaction = await new FlutterwaveClient(secret).findTransaction(
        payment.providerReference,
      );
      return isPaidTransaction(transaction, {
        reference: payment.providerReference,
        amount: payment.chargeAmount,
        currency: payment.chargeCurrency,
      });
    } catch (err) {
      this.logger.error(
        `Failed to verify Flutterwave transaction: ${payment.providerReference}`,
        err,
      );
      return false;
    }
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

    if (payment.provider === 'FLUTTERWAVE') {
      await this.refundOnFlutterwave(payment, refundAmount);
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
   * Refunds through Flutterwave in the currency the mentee paid. The refund is
   * the same share of what they paid as refundAmount is of the naira price.
   */
  private async refundOnFlutterwave(payment: Payment, refundAmount: number) {
    try {
      const secret = process.env.FLUTTERWAVE_SECRET_KEY;
      if (!secret || !payment.providerReference || !payment.chargeAmount) {
        throw new Error('Missing FLUTTERWAVE_SECRET_KEY or payment details.');
      }
      const flutterwave = new FlutterwaveClient(secret);
      const chargeRefund = Math.max(
        1,
        Math.round((payment.chargeAmount * refundAmount) / payment.amount),
      );
      const transaction = await flutterwave.findTransaction(
        payment.providerReference,
      );
      const refund = await flutterwave.refund(transaction.id, chargeRefund);
      const status = refundStatusFor(refund.status);
      if (status === 'FAILED') {
        throw new Error(`Flutterwave reported the refund as ${refund.status}`);
      }

      await this.paymentsRepository.updatePayment(payment.id, {
        refundAmount,
        refundStatus: status,
        refundReference: String(refund.id),
        ...(status === 'PROCESSED'
          ? { status: PaymentStatus.REFUNDED, refundedAt: new Date() }
          : {}),
      });
    } catch (err) {
      // Recorded as FAILED so the team can retry it from admin Finance
      this.logger.error(
        `Flutterwave refund failed for booking ${payment.bookingId}`,
        err,
      );
      await this.paymentsRepository.updatePayment(payment.id, {
        refundAmount,
        refundStatus: 'FAILED',
      });
    }
  }

  /**
   * Re-reads a refund's status from Paystack rather than trusting a webhook
   * payload. Also used by admins to check a refund that is still pending.
   */
  async syncRefund(refundId: string) {
    const payment =
      await this.paymentsRepository.findPaymentByRefundReference(refundId);
    if (payment?.provider === 'FLUTTERWAVE') {
      return this.syncFlutterwaveRefund(payment.id, refundId);
    }
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

  private async syncFlutterwaveRefund(paymentId: string, refundId: string) {
    const secret = process.env.FLUTTERWAVE_SECRET_KEY;
    if (!secret) return;
    const refund = await new FlutterwaveClient(secret).findRefund(refundId);
    const status = refundStatusFor(refund.status);
    if (status === 'PROCESSED') {
      await this.paymentsRepository.updatePayment(paymentId, {
        refundStatus: 'PROCESSED',
        refundedAt: new Date(),
        status: PaymentStatus.REFUNDED,
      });
    } else if (status === 'FAILED') {
      await this.paymentsRepository.updatePayment(paymentId, {
        refundStatus: 'FAILED',
      });
    }
  }

  /**
   * Flutterwave's v3 webhooks. Payments arrive as charge.completed; refund
   * updates come without an event name, as the refund itself. Either way the
   * details are re-read from Flutterwave rather than trusted from the body.
   */
  async handleFlutterwaveWebhook(payload: unknown) {
    const body = (payload ?? {}) as {
      event?: unknown;
      data?: { tx_ref?: unknown };
      id?: unknown;
      TransactionId?: unknown;
    };

    if (body.event === 'charge.completed') {
      const reference = body.data?.tx_ref;
      if (typeof reference === 'string') {
        try {
          await this.verify(reference);
        } catch (err) {
          this.logger.error(
            `Error processing Flutterwave charge: ${reference}`,
            err,
          );
        }
      }
    } else if (
      body.event === undefined &&
      body.TransactionId !== undefined &&
      (typeof body.id === 'number' || typeof body.id === 'string')
    ) {
      try {
        await this.syncRefund(String(body.id));
      } catch (err) {
        this.logger.error(
          `Error syncing Flutterwave refund ${String(body.id)}`,
          err,
        );
      }
    }

    return { received: true };
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

    // Mentor payouts: the transfer is re-checked with Paystack before the payout changes
    if (typeof event === 'string' && event.startsWith('transfer.')) {
      const reference = (payload as { data?: { reference?: unknown } }).data
        ?.reference;
      if (typeof reference === 'string') {
        try {
          await this.payoutsService.syncByReference(reference);
        } catch (err) {
          this.logger.error(`Error syncing transfer ${reference}`, err);
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
