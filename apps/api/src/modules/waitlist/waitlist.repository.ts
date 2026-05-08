import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';

const waitlistEntrySelect = {
  id: true,
  email: true,
  audience: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.WaitlistEntrySelect;

@Injectable()
export class WaitlistRepository {
  constructor(private readonly prisma: PrismaService) {}

  async countDistinctEmails() {
    const result = await this.prisma.$queryRaw<
      Array<{ count: bigint | number }>
    >`
      SELECT COUNT(DISTINCT "email") AS count FROM "WaitlistEntry"
    `;

    return Number(result[0]?.count ?? 0);
  }

  findByEmail(email: string) {
    return this.prisma.waitlistEntry.findFirst({
      where: {
        email,
      },
      select: waitlistEntrySelect,
    });
  }

  create(data: Prisma.WaitlistEntryCreateInput) {
    return this.prisma.waitlistEntry.create({
      data,
      select: waitlistEntrySelect,
    });
  }
}
