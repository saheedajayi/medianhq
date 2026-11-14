import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../database/prisma.service';

const PAYOUT_INCLUDE = {
  mentor: { select: { firstName: true, lastName: true, email: true } },
} satisfies Prisma.PayoutRequestInclude;

export type PayoutRecord = Prisma.PayoutRequestGetPayload<{
  include: typeof PAYOUT_INCLUDE;
}>;

@Injectable()
export class PayoutsRepository {
  constructor(private readonly prisma: PrismaService) {}

  findById(payoutId: string) {
    return this.prisma.payoutRequest.findUnique({
      where: { id: payoutId },
      include: PAYOUT_INCLUDE,
    });
  }

  findByTransferReference(reference: string) {
    return this.prisma.payoutRequest.findUnique({
      where: { transferReference: reference },
      include: PAYOUT_INCLUDE,
    });
  }

  /**
   * Moves a payout on only if it is still in the expected status. Returns
   * false when someone else got there first, so a payout is never sent twice.
   */
  async claim(
    payoutId: string,
    from: string,
    data: Prisma.PayoutRequestUpdateManyMutationInput,
  ) {
    const result = await this.prisma.payoutRequest.updateMany({
      where: { id: payoutId, status: from },
      data,
    });
    return result.count === 1;
  }

  update(payoutId: string, data: Prisma.PayoutRequestUpdateInput) {
    return this.prisma.payoutRequest.update({
      where: { id: payoutId },
      data,
      include: PAYOUT_INCLUDE,
    });
  }
}
