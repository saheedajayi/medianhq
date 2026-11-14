import { Injectable } from '@nestjs/common';
import { fullName, oneOf } from '../common/admin-actor';
import { buildTimeBuckets, growthPct } from '../common/time-buckets';
import {
  AdminFinanceRepository,
  type RefundRecord,
} from './admin-finance.repository';
import {
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

const PAYOUT_STATUSES: PayoutStatus[] = ['PAID', 'PENDING', 'FAILED'];
// Paystack reports a finished refund as PROCESSED
const REFUND_STATUS: Record<string, RefundStatus> = {
  PROCESSED: 'COMPLETED',
  PENDING: 'PENDING',
  FAILED: 'FAILED',
};
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
  oneOf(status.toUpperCase(), PAYOUT_STATUSES) ?? 'PENDING';

@Injectable()
export class AdminFinanceService {
  constructor(private readonly financeRepository: AdminFinanceRepository) {}

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

    const stat = (wanted: PayoutStatus) => {
      const amountIn = (isThisWeek: boolean) =>
        sum(
          recent
            .filter(
              (payout) =>
                readPayoutStatus(payout.status) === wanted &&
                payout.createdAt >= weekAgo === isThisWeek,
            )
            .map((payout) => payout.amount),
        );
      return {
        amount: sum(
          totals
            .filter((group) => readPayoutStatus(group.status) === wanted)
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
        pendingBalance: stat('PENDING'),
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
    const payouts = await this.financeRepository.findPayouts(
      search?.trim() || undefined,
      0,
      EXPORT_LIMIT,
    );
    return payouts
      .map((payout) => ({
        id: payout.id,
        mentor: {
          id: payout.mentor.id,
          name: fullName(payout.mentor),
          avatarUrl: payout.mentor.mentorProfile?.avatarUrl ?? null,
        },
        bankCode: payout.bankCode,
        amount: payout.amount,
        currency: payout.currency,
        status: readPayoutStatus(payout.status),
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
      status: oneOf(query.status, ['COMPLETED', 'PENDING', 'FAILED'] as const),
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
      requestedAt: refund.updatedAt,
      completedAt: refund.refundedAt,
    };
  };
}
