import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  SecurityAuditService,
  type SecurityEventAction,
} from '../../identity/auth/security-audit.service';
import { PaymentsService } from '../../finance/payments/payments.service';
import { PayoutsService } from '../../finance/payouts/payouts.service';
import { EmailService } from '../../platform/email/email.service';
import { fullName, oneOf, type AdminActor } from '../common/admin-actor';
import { buildTimeBuckets, growthPct } from '../common/time-buckets';
import {
  AdminFinanceRepository,
  type RefundRecord,
} from './admin-finance.repository';
import {
  PAYOUT_STATUSES,
  REFUND_STATUSES,
  REVENUE_PERIODS,
  type PayoutsQueryDto,
  type PayoutStatus,
  type RefundsFilters,
  type RefundsQueryDto,
  type RefundStatus,
  type RevenueQueryDto,
  type ServiceReportQueryDto,
} from './dto/admin-finance.dto';

const DAY_MS = 24 * 60 * 60 * 1000;
const PAYOUTS_PAGE_SIZE = 9;
const REFUNDS_PAGE_SIZE = 11;
const SESSION_REPORT_PAGE_SIZE = 7;
const MENTOR_REPORT_PAGE_SIZE = 5;
// The expanded report, opened with "view all"
const EXPANDED_REPORT_PAGE_SIZE = 17;
const EXPORT_LIMIT = 5000;
const BREAKDOWN_ROWS = 5;

// How each stored payout status reads on the Payout tab; PROCESSED is paid
const PAYOUT_STATUS: Record<string, PayoutStatus> = {
  PROCESSED: 'PAID',
  PAID: 'PAID',
  PROCESSING: 'PROCESSING',
  PENDING: 'PENDING',
  FAILED: 'FAILED',
  REJECTED: 'REJECTED',
};
// Paystack reports a finished refund as PROCESSED
const REFUND_STATUS: Record<string, RefundStatus> = {
  PROCESSED: 'COMPLETED',
  PENDING: 'PENDING',
  FAILED: 'FAILED',
  REJECTED: 'REJECTED',
};
const NOTE_MAX_LENGTH = 1000;
// Why a booking was refunded, when the person cancelling gave no reason
const REFUND_REASON: Record<string, string> = {
  DECLINED: 'Mentor declined',
  EXPIRED: 'Mentor did not respond',
  CANCELLED: 'Booking cancelled',
  NO_SHOW: 'No-show',
};

const readPage = (page?: number | string) => Math.max(Number(page) || 1, 1);

const paginate = <T>(items: T[], page: number, pageSize: number) =>
  items.slice((page - 1) * pageSize, page * pageSize);

const sum = (values: number[]) =>
  values.reduce((total, value) => total + value, 0);

/** Stored statuses are free text, so anything unrecognised counts as pending */
const readPayoutStatus = (status: string): PayoutStatus =>
  PAYOUT_STATUS[status.toUpperCase()] ?? 'PENDING';

@Injectable()
export class AdminFinanceService {
  constructor(
    private readonly financeRepository: AdminFinanceRepository,
    private readonly paymentsService: PaymentsService,
    private readonly payoutsService: PayoutsService,
    private readonly emailService: EmailService,
    private readonly securityAudit: SecurityAuditService,
  ) {}

  async getRevenue(query: RevenueQueryDto, now = new Date()) {
    const period = oneOf(query.period, REVENUE_PERIODS) ?? 'daily';
    const buckets = buildTimeBuckets(period, now);
    const twoWeeksAgo = new Date(now.getTime() - 14 * DAY_MS);
    const since = new Date(
      Math.min(buckets[0].from.getTime(), twoWeeksAgo.getTime()),
    );
    const payments = await this.financeRepository.findSuccessfulPayments(since);

    const revenueBetween = (from: Date, to: Date) =>
      sum(
        payments
          .filter(
            (payment) => payment.createdAt >= from && payment.createdAt < to,
          )
          .map((payment) => payment.amount),
      );

    const series = buckets
      .map((bucket, index) => {
        const sessionRevenue = revenueBetween(bucket.from, bucket.to);
        const previous =
          index > 0
            ? revenueBetween(buckets[index - 1].from, buckets[index - 1].to)
            : 0;
        return {
          label: bucket.label,
          sessionRevenue,
          // There are no subscriptions to sell yet, so this is a true zero
          subscriptionRevenue: 0,
          totalRevenue: sessionRevenue,
          growthPct: growthPct(sessionRevenue, previous),
        };
        // The first bucket only exists to measure growth against
      })
      .slice(1);

    const weekAgo = new Date(now.getTime() - 7 * DAY_MS);
    const thisWeek = revenueBetween(weekAgo, new Date(now.getTime() + 1));
    const lastWeek = revenueBetween(twoWeeksAgo, weekAgo);
    const sessionsChangePct = growthPct(thisWeek, lastWeek);

    const shown = payments.filter(
      (payment) => payment.createdAt >= buckets[1].from,
    );
    const groupRevenue = sum(
      shown
        .filter((payment) => payment.booking.mentorSession?.type === 'GROUP')
        .map((payment) => payment.amount),
    );
    const shownRevenue = sum(shown.map((payment) => payment.amount));
    const topBucket = [...series].sort(
      (a, b) => b.totalRevenue - a.totalRevenue,
    )[0];

    return {
      period,
      stats: {
        totalRevenue: { amount: thisWeek, changePct: sessionsChangePct },
        sessionsRevenue: { amount: thisWeek, changePct: sessionsChangePct },
        subscriptionRevenue: { amount: 0, changePct: null },
        averageDailyRevenue: {
          amount: Math.round(thisWeek / 7),
          changePct: sessionsChangePct,
        },
      },
      series,
      byProduct: {
        oneOnOne: shownRevenue - groupRevenue,
        group: groupRevenue,
      },
      insights: {
        sessionsChangePct,
        subscriptionsChangePct: null,
        topEarning:
          topBucket && topBucket.totalRevenue > 0
            ? { label: topBucket.label, amount: topBucket.totalRevenue }
            : null,
      },
      // Newest last, as the chart reads
      breakdown: series.slice(-BREAKDOWN_ROWS),
    };
  }

  async getPayouts(query: PayoutsQueryDto, now = new Date()) {
    const status = oneOf(query.status, PAYOUT_STATUSES);
    const page = readPage(query.page);
    const weekAgo = new Date(now.getTime() - 7 * DAY_MS);

    const [payouts, totals, recent] = await Promise.all([
      this.findPayouts(query.search, status),
      this.financeRepository.sumPayoutsByStatus(),
      this.financeRepository.findPayoutAmounts(
        new Date(now.getTime() - 14 * DAY_MS),
      ),
    ]);

    const stat = (...wanted: PayoutStatus[]) => {
      const matches = (status: string) =>
        wanted.includes(readPayoutStatus(status));
      const amountIn = (isThisWeek: boolean) =>
        sum(
          recent
            .filter(
              (payout) =>
                matches(payout.status) &&
                payout.createdAt >= weekAgo === isThisWeek,
            )
            .map((payout) => payout.amount),
        );
      return {
        amount: sum(
          totals
            .filter((group) => matches(group.status))
            .map((group) => group._sum.amount ?? 0),
        ),
        changePct: growthPct(amountIn(true), amountIn(false)),
      };
    };

    return {
      items: paginate(payouts, page, PAYOUTS_PAGE_SIZE),
      total: payouts.length,
      page,
      pageSize: PAYOUTS_PAGE_SIZE,
      stats: {
        totalPaidOut: stat('PAID'),
        // Waiting for review or already sent to Paystack and not yet confirmed
        pendingBalance: stat('PENDING', 'PROCESSING'),
        failedDisbursements: stat('FAILED'),
      },
    };
  }

  /** Every payout matching the filters, for the CSV export */
  exportPayouts(query: PayoutsQueryDto) {
    return this.findPayouts(query.search, oneOf(query.status, PAYOUT_STATUSES));
  }

  async getSessionReport(query: ServiceReportQueryDto) {
    const search = query.search?.trim() || undefined;
    const page = readPage(query.page);
    const pageSize =
      query.view === 'all'
        ? EXPANDED_REPORT_PAGE_SIZE
        : SESSION_REPORT_PAGE_SIZE;

    const [charges, total] = await Promise.all([
      this.financeRepository.findSessionCharges(
        search,
        (page - 1) * pageSize,
        pageSize,
      ),
      this.financeRepository.countSessionCharges(search),
    ]);

    return { items: charges.map(this.toSessionCharge), total, page, pageSize };
  }

  async exportSessionReport(query: ServiceReportQueryDto) {
    const charges = await this.financeRepository.findSessionCharges(
      query.search?.trim() || undefined,
      0,
      EXPORT_LIMIT,
    );
    return charges.map(this.toSessionCharge);
  }

  async getMentorReport(query: ServiceReportQueryDto) {
    const page = readPage(query.page);
    const pageSize =
      query.view === 'all'
        ? EXPANDED_REPORT_PAGE_SIZE
        : MENTOR_REPORT_PAGE_SIZE;
    const rows = await this.findMentorCharges(query.search);

    return {
      items: paginate(rows, page, pageSize),
      total: rows.length,
      page,
      pageSize,
    };
  }

  exportMentorReport(query: ServiceReportQueryDto) {
    return this.findMentorCharges(query.search);
  }

  async getRefunds(query: RefundsQueryDto, now = new Date()) {
    const page = readPage(query.page);
    const where = this.financeRepository.buildRefundsWhereClause(
      this.readRefundsFilters(query),
      now,
    );
    const weekAgo = new Date(now.getTime() - 7 * DAY_MS);

    const [refunds, total, byStatus, recent] = await Promise.all([
      this.financeRepository.findRefunds(
        where,
        (page - 1) * REFUNDS_PAGE_SIZE,
        REFUNDS_PAGE_SIZE,
      ),
      this.financeRepository.countRefunds(where),
      this.financeRepository.countRefundsByStatus(),
      this.financeRepository.findRefundStatuses(
        new Date(now.getTime() - 14 * DAY_MS),
      ),
    ]);

    const stat = (wanted?: RefundStatus) => {
      const matches = (status: string | null) =>
        !wanted || REFUND_STATUS[status ?? ''] === wanted;
      const countIn = (isThisWeek: boolean) =>
        recent.filter(
          (refund) =>
            matches(refund.refundStatus) &&
            refund.updatedAt >= weekAgo === isThisWeek,
        ).length;
      return {
        count: sum(
          byStatus
            .filter((group) => matches(group.refundStatus))
            .map((group) => group._count._all),
        ),
        changePct: growthPct(countIn(true), countIn(false)),
      };
    };

    return {
      items: refunds.map(this.toRefund),
      total,
      page,
      pageSize: REFUNDS_PAGE_SIZE,
      stats: {
        total: stat(),
        completed: stat('COMPLETED'),
        pending: stat('PENDING'),
        failed: stat('FAILED'),
      },
    };
  }

  async exportRefunds(query: RefundsQueryDto, now = new Date()) {
    const refunds = await this.financeRepository.findRefunds(
      this.financeRepository.buildRefundsWhereClause(
        this.readRefundsFilters(query),
        now,
      ),
      0,
      EXPORT_LIMIT,
    );
    return refunds.map(this.toRefund);
  }

  /** Statuses are free text, so the status filter is applied after reading */
  private async findPayouts(search?: string, status?: PayoutStatus) {
    const [payouts, bankNames] = await Promise.all([
      this.financeRepository.findPayouts(
        search?.trim() || undefined,
        0,
        EXPORT_LIMIT,
      ),
      this.payoutsService.bankNames(),
    ]);
    return payouts
      .map((payout) => ({
        id: payout.id,
        mentor: {
          id: payout.mentor.id,
          name: fullName(payout.mentor),
          avatarUrl: payout.mentor.mentorProfile?.avatarUrl ?? null,
        },
        bankCode: payout.bankCode,
        bankName: bankNames.get(payout.bankCode) ?? null,
        accountNumber: payout.accountNumber,
        amount: payout.amount,
        currency: payout.currency,
        status: readPayoutStatus(payout.status),
        failureReason: payout.failureReason,
        transferReference: payout.transferReference,
        paidAt: payout.paidAt,
        requestedAt: payout.createdAt,
      }))
      .filter((payout) => !status || payout.status === status);
  }

  private async findMentorCharges(search?: string) {
    const groups = await this.financeRepository.sumChargesByMentor();
    const mentors = await this.financeRepository.findMentorNames(
      groups.map((group) => group.mentorId),
    );
    const nameOf = new Map(
      mentors.map((mentor) => [mentor.id, fullName(mentor)]),
    );
    const term = search?.trim().toLowerCase();

    return groups
      .map((group) => ({
        mentorId: group.mentorId,
        mentorName: nameOf.get(group.mentorId) ?? 'Unknown mentor',
        sessions: group._count._all,
        sessionRevenue: group._sum.grossAmount ?? 0,
        serviceCharge: group._sum.platformFee ?? 0,
      }))
      .filter((row) => !term || row.mentorName.toLowerCase().includes(term));
  }

  private readRefundsFilters(query: RefundsQueryDto): RefundsFilters {
    return {
      search: query.search?.trim() || undefined,
      status: oneOf(query.status, REFUND_STATUSES),
      range: oneOf(query.range, ['7d', '30d', '90d'] as const),
    };
  }

  private toSessionCharge = (
    charge: Awaited<
      ReturnType<AdminFinanceRepository['findSessionCharges']>
    >[number],
  ) => ({
    id: charge.id,
    date: charge.createdAt,
    sessionId: charge.bookingId as string,
    mentorName: fullName(charge.mentor),
    sessionFee: charge.grossAmount ?? 0,
    serviceCharge: charge.platformFee ?? 0,
  });

  private toRefund = (refund: RefundRecord) => {
    const { booking } = refund;
    return {
      id: refund.id,
      user: {
        id: booking.mentee.id,
        name: fullName(booking.mentee),
        avatarUrl: booking.mentee.menteeProfile?.avatarUrl ?? null,
        role: 'Mentee' as const,
      },
      // Only sessions are sold, so only sessions are refunded
      type: 'SESSION' as const,
      amount: refund.refundAmount ?? refund.amount,
      reason:
        booking.cancellationReason ??
        REFUND_REASON[booking.status] ??
        'Refund issued',
      status: REFUND_STATUS[refund.refundStatus ?? ''] ?? 'PENDING',
      bookingId: booking.id,
      requestedAt: refund.updatedAt,
      completedAt: refund.refundedAt,
      note: refund.refundNote,
      noteAt: refund.refundNoteAt,
      noteBy: refund.refundNoteBy,
      infoRequestedAt: refund.refundInfoRequestedAt,
    };
  };

  // --- Refund actions -------------------------------------------------------

  /**
   * Refunds are sent automatically when a booking is cancelled. Approving
   * retries one that failed, or re-checks one Paystack hasn't finished.
   */
  async approveRefund(paymentId: string, actor?: AdminActor) {
    const refund = await this.findRefund(paymentId);
    const status = REFUND_STATUS[refund.refundStatus ?? ''];

    if (status === 'FAILED') {
      await this.paymentsService.refund(
        refund.booking.id,
        refund.refundAmount ?? refund.amount,
      );
    } else if (status === 'PENDING' && refund.refundReference) {
      await this.paymentsService.syncRefund(refund.refundReference);
    } else {
      throw new BadRequestException(
        status === 'COMPLETED'
          ? 'This refund has already been completed.'
          : 'Only a failed or pending refund can be approved.',
      );
    }

    await this.recordFinanceAction('REFUND_RETRIED', refund, actor);
    return this.toRefund(await this.findRefund(paymentId));
  }

  /** Closes a failed refund without paying it, and tells the mentee why */
  async rejectRefund(
    paymentId: string,
    reason: string | undefined,
    actor?: AdminActor,
  ) {
    const refund = await this.findRefund(paymentId);
    if (REFUND_STATUS[refund.refundStatus ?? ''] !== 'FAILED') {
      throw new BadRequestException('Only a failed refund can be rejected.');
    }
    const note = this.readText(reason, 'Reason');

    const updated = await this.financeRepository.updateRefund(paymentId, {
      refundStatus: 'REJECTED',
      ...(note && {
        refundNote: note,
        refundNoteAt: new Date(),
        refundNoteBy: actor ? fullName(actor) : null,
      }),
    });
    await this.emailMentee(
      refund,
      'An update on your Median refund',
      [
        `We weren't able to refund ${this.formatAmount(refund)} for your cancelled session.`,
        ...(note ? [`Note from our team: ${note}`] : []),
        'Reply to this email if you have any questions.',
      ],
      `refund-rejected:${refund.id}`,
    );
    await this.recordFinanceAction('REFUND_REJECTED', refund, actor);
    return this.toRefund(updated);
  }

  /** Emails the mentee asking them to reply with what the team needs */
  async requestRefundInfo(paymentId: string, actor?: AdminActor) {
    const refund = await this.findRefund(paymentId);
    await this.emailMentee(
      refund,
      'We need a little more information about your refund',
      [
        `We're looking into your refund of ${this.formatAmount(refund)} and need a few more details to finish it.`,
        'Please reply to this email with your bank or card details used for the payment and anything else you think will help.',
      ],
      `refund-info:${refund.id}:${Date.now()}`,
    );
    const updated = await this.financeRepository.updateRefund(paymentId, {
      refundInfoRequestedAt: new Date(),
    });
    await this.recordFinanceAction('REFUND_INFO_REQUESTED', refund, actor);
    return this.toRefund(updated);
  }

  async saveRefundNote(
    paymentId: string,
    note: string | undefined,
    actor?: AdminActor,
  ) {
    await this.findRefund(paymentId);
    const text = this.readText(note, 'Note');
    const updated = await this.financeRepository.updateRefund(paymentId, {
      refundNote: text,
      refundNoteAt: new Date(),
      refundNoteBy: actor ? fullName(actor) : null,
    });
    return this.toRefund(updated);
  }

  // --- Payout actions -------------------------------------------------------

  /** Sends the money through Paystack Transfers */
  async approvePayout(payoutId: string, actor?: AdminActor) {
    const payout = await this.payoutsService.approve(payoutId, actor);
    await this.recordPayoutAction('PAYOUT_APPROVED', payout, actor);
    return {
      payoutId,
      status: readPayoutStatus(payout.status),
      failureReason: payout.failureReason,
    };
  }

  async rejectPayout(
    payoutId: string,
    reason: string | undefined,
    actor?: AdminActor,
  ) {
    const payout = await this.payoutsService.reject(
      payoutId,
      this.readText(reason, 'Reason') ?? undefined,
      actor,
    );
    await this.recordPayoutAction('PAYOUT_REJECTED', payout, actor);
    return {
      payoutId,
      status: readPayoutStatus(payout.status),
      failureReason: payout.failureReason,
    };
  }

  /** Re-checks a transfer still in flight with Paystack */
  async syncPayout(payoutId: string) {
    const payout = await this.payoutsService.sync(payoutId);
    return {
      payoutId,
      status: readPayoutStatus(payout.status),
      failureReason: payout.failureReason,
    };
  }

  private async findRefund(paymentId: string) {
    const refund = await this.financeRepository.findRefundById(paymentId);
    if (!refund) throw new NotFoundException('Refund not found.');
    return refund;
  }

  private readText(value: string | undefined, field: string) {
    const text = value?.trim() || null;
    if (text && text.length > NOTE_MAX_LENGTH) {
      throw new BadRequestException(
        `${field} must be ${NOTE_MAX_LENGTH} characters or fewer.`,
      );
    }
    return text;
  }

  private formatAmount(refund: RefundRecord) {
    return `₦${(refund.refundAmount ?? refund.amount).toLocaleString('en-NG')}`;
  }

  /** A failed email must not undo the action, which is still recorded */
  private emailMentee(
    refund: RefundRecord,
    subject: string,
    paragraphs: string[],
    idempotencyKey: string,
  ) {
    const { mentee } = refund.booking;
    return this.emailService
      .sendBookingUpdate({
        email: mentee.email,
        firstName: mentee.firstName,
        subject,
        paragraphs,
        details: [],
        ctaLabel: 'View bookings',
        ctaPath: '/mentee/booking-session',
        idempotencyKey,
      })
      .catch(() => undefined);
  }

  private recordFinanceAction(
    action: SecurityEventAction,
    refund: RefundRecord,
    actor?: AdminActor,
  ) {
    return this.securityAudit.record({
      userId: refund.booking.mentee.id,
      email: refund.booking.mentee.email,
      action,
      status: 'SUCCESS',
      metadata: {
        adminId: actor?.id ?? null,
        adminName: actor ? fullName(actor) : null,
        detail: `${this.formatAmount(refund)} · ${refund.id}`,
      },
    });
  }

  private recordPayoutAction(
    action: SecurityEventAction,
    payout: { id: string; mentorId: string; amount: number },
    actor?: AdminActor,
  ) {
    return this.securityAudit.record({
      userId: payout.mentorId,
      action,
      status: 'SUCCESS',
      metadata: {
        adminId: actor?.id ?? null,
        adminName: actor ? fullName(actor) : null,
        detail: `₦${payout.amount.toLocaleString('en-NG')} · ${payout.id}`,
      },
    });
  }
}
