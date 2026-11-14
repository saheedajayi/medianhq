import { Injectable } from '@nestjs/common';
import { PaymentStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../../database/prisma.service';
import type { RefundsFilters } from './dto/admin-finance.dto';

const DAY_MS = 24 * 60 * 60 * 1000;
const RANGE_DAYS = { '7d': 7, '30d': 30, '90d': 90 } as const;
const PERSON_NAME_SELECT = {
  id: true,
  firstName: true,
  lastName: true,
} as const;

const PAYOUT_INCLUDE = {
  mentor: {
    select: {
      ...PERSON_NAME_SELECT,
      mentorProfile: { select: { avatarUrl: true } },
    },
  },
} satisfies Prisma.PayoutRequestInclude;

const REFUND_SELECT = {
  id: true,
  amount: true,
  refundAmount: true,
  refundStatus: true,
  refundedAt: true,
  updatedAt: true,
  booking: {
    select: {
      id: true,
      status: true,
      cancellationReason: true,
      mentee: {
        select: {
          ...PERSON_NAME_SELECT,
          menteeProfile: { select: { avatarUrl: true } },
        },
      },
    },
  },
} satisfies Prisma.PaymentSelect;

export type RefundRecord = Prisma.PaymentGetPayload<{
  select: typeof REFUND_SELECT;
}>;

/** Matches a person by any word of their name */
const nameContains = (search: string) => {
  const contains = { contains: search, mode: 'insensitive' } as const;
  return { OR: [{ firstName: contains }, { lastName: contains }] };
};

@Injectable()
export class AdminFinanceRepository {
  constructor(private readonly prisma: PrismaService) {}

  /** Money that came in: successful checkouts, with the kind of session each paid for */
  findSuccessfulPayments(since: Date) {
    return this.prisma.payment.findMany({
      where: { status: PaymentStatus.SUCCESSFUL, createdAt: { gte: since } },
      select: {
        amount: true,
        createdAt: true,
        booking: { select: { mentorSession: { select: { type: true } } } },
      },
    });
  }

  findPayouts(search?: string, skip?: number, take?: number) {
    return this.prisma.payoutRequest.findMany({
      where: search ? { mentor: nameContains(search) } : undefined,
      include: PAYOUT_INCLUDE,
      orderBy: { createdAt: 'desc' },
      skip,
      take,
    });
  }

  findPayoutAmounts(since: Date) {
    return this.prisma.payoutRequest.findMany({
      where: { createdAt: { gte: since } },
      select: { amount: true, status: true, createdAt: true },
    });
  }

  sumPayoutsByStatus() {
    return this.prisma.payoutRequest.groupBy({
      by: ['status'],
      _sum: { amount: true },
    });
  }

  /** What the platform kept from each paid session */
  findSessionCharges(search?: string, skip?: number, take?: number) {
    return this.prisma.mentorEarning.findMany({
      where: {
        bookingId: { not: null },
        ...(search && { mentor: nameContains(search) }),
      },
      select: {
        id: true,
        bookingId: true,
        grossAmount: true,
        platformFee: true,
        createdAt: true,
        mentor: { select: PERSON_NAME_SELECT },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take,
    });
  }

  countSessionCharges(search?: string) {
    return this.prisma.mentorEarning.count({
      where: {
        bookingId: { not: null },
        ...(search && { mentor: nameContains(search) }),
      },
    });
  }

  sumChargesByMentor() {
    return this.prisma.mentorEarning.groupBy({
      by: ['mentorId'],
      where: { bookingId: { not: null } },
      _count: { _all: true },
      _sum: { grossAmount: true, platformFee: true },
      orderBy: { _sum: { grossAmount: 'desc' } },
    });
  }

  findMentorNames(mentorIds: string[]) {
    return this.prisma.user.findMany({
      where: { id: { in: mentorIds } },
      select: PERSON_NAME_SELECT,
    });
  }

  buildRefundsWhereClause(
    filters: RefundsFilters,
    now: Date,
  ): Prisma.PaymentWhereInput {
    const and: Prisma.PaymentWhereInput[] = [{ refundStatus: { not: null } }];

    if (filters.status) {
      // Paystack reports a finished refund as PROCESSED
      and.push({
        refundStatus:
          filters.status === 'COMPLETED' ? 'PROCESSED' : filters.status,
      });
    }
    if (filters.range) {
      const since = now.getTime() - RANGE_DAYS[filters.range] * DAY_MS;
      and.push({ updatedAt: { gte: new Date(since) } });
    }
    if (filters.search) {
      and.push({
        OR: [
          { booking: { mentee: nameContains(filters.search) } },
          { id: filters.search },
        ],
      });
    }
    return { AND: and };
  }

  findRefunds(where: Prisma.PaymentWhereInput, skip?: number, take?: number) {
    return this.prisma.payment.findMany({
      where,
      select: REFUND_SELECT,
      orderBy: { updatedAt: 'desc' },
      skip,
      take,
    });
  }

  countRefunds(where: Prisma.PaymentWhereInput) {
    return this.prisma.payment.count({ where });
  }

  findRefundStatuses(since: Date) {
    return this.prisma.payment.findMany({
      where: { refundStatus: { not: null }, updatedAt: { gte: since } },
      select: { refundStatus: true, updatedAt: true },
    });
  }

  countRefundsByStatus() {
    return this.prisma.payment.groupBy({
      by: ['refundStatus'],
      where: { refundStatus: { not: null } },
      _count: { _all: true },
    });
  }
}
