import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';

const waitlistEntrySelect = {
  id: true,
  firstName: true,
  lastName: true,
  email: true,
  audience: true,
  location: true,
  expertise: true,
  currentRole: true,
  company: true,
  levelOfExperience: true,
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

  count() {
    return this.prisma.waitlistEntry.count();
  }

  findMany({ skip, take }: { skip: number; take: number }) {
    return this.prisma.waitlistEntry.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      skip,
      take,
      select: waitlistEntrySelect,
    });
  }

  findLatest() {
    return this.prisma.waitlistEntry.findFirst({
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        createdAt: true,
      },
    });
  }

  countByAudience() {
    return this.prisma.waitlistEntry.groupBy({
      by: ['audience'],
      _count: {
        _all: true,
      },
    });
  }

  create(data: Prisma.WaitlistEntryCreateInput) {
    return this.prisma.waitlistEntry.create({
      data,
      select: waitlistEntrySelect,
    });
  }
}
