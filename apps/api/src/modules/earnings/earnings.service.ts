import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import type { AuthUser } from '../auth/dto/auth.dto';

@Injectable()
export class EarningsService {
  constructor(private readonly prisma: PrismaService) {}

  private ensureMentor(user: AuthUser) {
    if (user.role !== 'MENTOR') {
      throw new ForbiddenException('Only mentors can access earnings.');
    }
  }

  async getMentorSummary(user: AuthUser) {
    this.ensureMentor(user);

    const [earnings, payouts] = await Promise.all([
      this.prisma.mentorEarning.findMany({
        where: { mentorId: user.id },
      }),
      this.prisma.payoutRequest.findMany({
        where: { mentorId: user.id },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    const totalEarned = earnings.reduce((sum, e) => sum + e.amount, 0);
    const totalPaidOut = payouts
      .filter((p) => p.status === 'PROCESSED')
      .reduce((sum, p) => sum + p.amount, 0);
    const pendingPayout = payouts
      .filter((p) => p.status === 'PENDING')
      .reduce((sum, p) => sum + p.amount, 0);

    const availableBalance = Math.max(0, totalEarned - totalPaidOut - pendingPayout);

    return {
      totalEarned,
      totalPaidOut,
      pendingPayout,
      availableBalance,
      currency: 'NGN',
      recentPayouts: payouts.slice(0, 10),
    };
  }

  async requestPayout(
    user: AuthUser,
    dto: { amount: number; accountNumber: string; bankCode: string },
  ) {
    this.ensureMentor(user);

    if (!dto.amount || dto.amount <= 0) {
      throw new BadRequestException('Payout amount must be greater than zero.');
    }

    if (!dto.accountNumber || !dto.bankCode) {
      throw new BadRequestException('Account number and bank code are required.');
    }

    const summary = await this.getMentorSummary(user);
    if (dto.amount > summary.availableBalance) {
      throw new BadRequestException('Requested amount exceeds available balance.');
    }

    return this.prisma.payoutRequest.create({
      data: {
        mentorId: user.id,
        amount: dto.amount,
        accountNumber: dto.accountNumber,
        bankCode: dto.bankCode,
        currency: 'NGN',
        status: 'PENDING',
      },
    });
  }
}
