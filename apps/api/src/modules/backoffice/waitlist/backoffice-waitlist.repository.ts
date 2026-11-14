import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../database/prisma.service';

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
export class BackofficeWaitlistRepository {
  constructor(private readonly prisma: PrismaService) {}

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
}
