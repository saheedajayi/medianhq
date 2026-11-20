import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { MentorEarning, Prisma } from '@prisma/client';
import type { AuthUser } from '../../identity/auth/dto/auth.dto';
import { getEarningsBreakdown } from '../../scheduling/bookings/booking-policy';
import type { EarningsQueryDto } from './dto/earnings.dto';
import {
  getBalances,
  isWithin,
  lagosMonthOf,
  type LedgerEntry,
} from './earnings-ledger';
import {
  EarningsRepository,
  type EarningSessionRecord,
} from './earnings.repository';

const EARNINGS_PAGE_SIZE = 8;
const EXPANDED_PAGE_SIZE = 25;

export const readPage = (page?: number | string) =>
  Math.max(Number(page) || 1, 1);

export const paginate = <T>(items: T[], page: number, pageSize: number) =>
  items.slice((page - 1) * pageSize, page * pageSize);

export function assertMentor(user: AuthUser) {
  if (user.role !== 'MENTOR') {
    throw new ForbiddenException('Only mentors can access earnings.');
  }
}

type EarningWithSession = MentorEarning & {
  session: EarningSessionRecord | null;
};

const sessionDate = (earning: EarningWithSession) =>
  earning.session?.startsAt ?? earning.createdAt;

@Injectable()
export class EarningsService {
  constructor(private readonly earningsRepository: EarningsRepository) {}

  async getMentorSummary(user: AuthUser, now = new Date()) {
    assertMentor(user);
    const month = lagosMonthOf(now);

    const [account, booked] = await Promise.all([
      this.loadAccount(user.id, now),
      this.earningsRepository.findBookedPayments(user.id, now, month.to),
    ]);
    const { earnings, payouts, balances } = account;

    const earnedThisMonth = earnings
      .filter((earning) => {
        const status = balances.ledger.get(earning.id)!.status;
        return (
          isWithin(earning.createdAt, month) &&
          (status === 'PENDING' || status === 'PAID_OUT')
        );
      })
      .reduce((total, earning) => total + earning.amount, 0);
    const stillToCome = booked.reduce(
      (total, payment) =>
        total + getEarningsBreakdown(payment.amount).netAmount,
      0,
    );

    return {
      totalEarned: balances.totalEarned,
      totalPaidOut: balances.totalPaidOut,
      pendingPayout: balances.pendingPayout,
      availableBalance: balances.availableBalance,
      pendingClearance: balances.pendingClearance,
      nextClearanceAt: balances.nextClearanceAt,
      heldOnDispute: balances.heldOnDispute,
      // What this month has brought in so far, plus accepted sessions still to happen
      projectedThisMonth: earnedThisMonth + stillToCome,
      firstEarningAt: balances.firstEarningAt,
      currency: 'NGN',
      recentPayouts: payouts.slice(0, 10),
    };
  }

  async getEarnings(user: AuthUser, query: EarningsQueryDto, now = new Date()) {
    assertMentor(user);
    const page = readPage(query.page);
    const pageSize =
      query.view === 'all' ? EXPANDED_PAGE_SIZE : EARNINGS_PAGE_SIZE;
    const { earnings, balances } = await this.loadAccount(user.id, now);

    return {
      items: paginate(earnings, page, pageSize).map((earning) =>
        this.toItem(earning, balances.ledger.get(earning.id)!),
      ),
      total: earnings.length,
      page,
      pageSize,
    };
  }

  async getEarning(user: AuthUser, earningId: string, now = new Date()) {
    assertMentor(user);
    const { earnings, balances } = await this.loadAccount(user.id, now);
    const earning = earnings.find((item) => item.id === earningId);
    if (!earning) throw new NotFoundException('Earning not found.');

    const entry = balances.ledger.get(earning.id)!;
    const mentee = earning.session?.mentee;
    return {
      ...this.toItem(earning, entry),
      mentee: {
        name: this.menteeName(earning),
        avatarUrl: mentee?.menteeProfile?.avatarUrl ?? null,
        role: mentee?.menteeProfile?.currentRole ?? null,
      },
      serviceCharge: earning.platformFee ?? 0,
      completedAt: earning.session?.session?.completedAt ?? earning.createdAt,
      clearsAt: entry.clearsAt,
      hasCleared: entry.hasCleared,
      paidOutAt: entry.paidOutAt,
      payoutRequestedAt: entry.payoutRequestedAt,
      refundedAt: earning.session?.payment?.refundedAt ?? null,
    };
  }

  /**
   * Everything the mentor's balance depends on: their earnings with the
   * session each came from, their payouts, and the figures worked out from both.
   */
  async loadAccount(
    mentorId: string,
    now: Date,
    db?: Prisma.TransactionClient,
  ) {
    const [rows, payouts] = await Promise.all([
      this.earningsRepository.findEarnings(mentorId, db),
      this.earningsRepository.findPayouts(mentorId, db),
    ]);
    const bookingIds = rows.flatMap((row) => row.bookingId ?? []);
    const sessions = bookingIds.length
      ? await this.earningsRepository.findSessions(bookingIds, db)
      : [];
    const sessionById = new Map(sessions.map((item) => [item.id, item]));

    const earnings: EarningWithSession[] = rows
      .map((row) => ({
        ...row,
        session: (row.bookingId && sessionById.get(row.bookingId)) || null,
      }))
      // Listed by when the session was, newest first, as that is the date shown
      .sort((a, b) => sessionDate(b).getTime() - sessionDate(a).getTime());
    const balances = getBalances(
      earnings.map((earning) => ({
        id: earning.id,
        amount: earning.amount,
        grossAmount: earning.grossAmount,
        createdAt: earning.createdAt,
        payment: earning.session?.payment ?? null,
      })),
      payouts,
      now,
    );

    return { earnings, payouts, balances };
  }

  toItem(earning: EarningWithSession, entry: LedgerEntry) {
    const session = earning.session;
    return {
      id: earning.id,
      bookingId: earning.bookingId,
      sessionTitle:
        session?.mentorSession?.title ?? session?.title ?? 'Session',
      menteeName: this.menteeName(earning),
      date: sessionDate(earning),
      grossAmount: earning.grossAmount ?? earning.amount,
      netAmount: earning.amount,
      currency: earning.currency,
      status: entry.status,
    };
  }

  private menteeName(earning: EarningWithSession) {
    const mentee = earning.session?.mentee;
    return mentee ? `${mentee.firstName} ${mentee.lastName}`.trim() : 'Mentee';
  }
}
