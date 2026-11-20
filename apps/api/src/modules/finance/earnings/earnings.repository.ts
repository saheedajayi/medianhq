import { Injectable } from '@nestjs/common';
import { BookingStatus, PaymentStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../../database/prisma.service';

/** The repository's own client, or the transaction a caller is already inside */
type Db = Prisma.TransactionClient;

const SESSION_SELECT = {
  id: true,
  title: true,
  startsAt: true,
  mentorSession: { select: { title: true } },
  session: { select: { completedAt: true } },
  payment: {
    select: {
      amount: true,
      refundAmount: true,
      refundStatus: true,
      refundedAt: true,
    },
  },
  mentee: {
    select: {
      firstName: true,
      lastName: true,
      menteeProfile: { select: { avatarUrl: true, currentRole: true } },
    },
  },
} satisfies Prisma.BookingSelect;

export type EarningSessionRecord = Prisma.BookingGetPayload<{
  select: typeof SESSION_SELECT;
}>;

@Injectable()
export class EarningsRepository {
  constructor(private readonly prisma: PrismaService) {}

  findEarnings(mentorId: string, db: Db = this.prisma) {
    return db.mentorEarning.findMany({
      where: { mentorId },
      orderBy: { createdAt: 'desc' },
    });
  }

  /** The sessions behind a set of earnings; an earning only stores its booking's ID */
  findSessions(bookingIds: string[], db: Db = this.prisma) {
    return db.booking.findMany({
      where: { id: { in: bookingIds } },
      select: SESSION_SELECT,
    });
  }

  findPayouts(mentorId: string, db: Db = this.prisma) {
    return db.payoutRequest.findMany({
      where: { mentorId },
      orderBy: { createdAt: 'desc' },
    });
  }

  findPayout(mentorId: string, payoutId: string) {
    return this.prisma.payoutRequest.findFirst({
      where: { id: payoutId, mentorId },
    });
  }

  /** What accepted, paid sessions in a period would bring in before fees */
  findBookedPayments(mentorId: string, from: Date, to: Date) {
    return this.prisma.payment.findMany({
      where: {
        status: PaymentStatus.SUCCESSFUL,
        booking: {
          mentorId,
          status: BookingStatus.CONFIRMED,
          startsAt: { gte: from, lt: to },
        },
      },
      select: { amount: true },
    });
  }

  findPayoutAccount(mentorId: string, db: Db = this.prisma) {
    return db.payoutAccount.findUnique({ where: { mentorId } });
  }

  savePayoutAccount(
    mentorId: string,
    data: {
      bankCode: string;
      bankName: string;
      accountNumber: string;
      accountName: string;
    },
  ) {
    return this.prisma.payoutAccount.upsert({
      where: { mentorId },
      create: { mentorId, ...data },
      update: data,
    });
  }

  createPayout(
    data: {
      mentorId: string;
      amount: number;
      accountNumber: string;
      bankCode: string;
    },
    db: Db = this.prisma,
  ) {
    return db.payoutRequest.create({
      data: { ...data, currency: 'NGN', status: 'PENDING' },
    });
  }

  /**
   * Runs the work while holding this mentor's lock, so two payout requests
   * sent together can't both read the same balance and withdraw it twice.
   */
  withMentorLock<T>(mentorId: string, work: (db: Db) => Promise<T>) {
    return this.prisma.$transaction(async (db) => {
      await db.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${mentorId}))`;
      return work(db);
    });
  }
}
