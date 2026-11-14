import { Injectable } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { PrismaService } from '../../../database/prisma.service';

@Injectable()
export class HealthChecksRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: Prisma.HealthCheckCreateInput) {
    return this.prisma.healthCheck.create({ data, select: { id: true } });
  }

  findLatest() {
    return this.prisma.healthCheck.findFirst({
      orderBy: { checkedAt: 'desc' },
    });
  }

  findFirstSince(since: Date) {
    return this.prisma.healthCheck.findFirst({
      where: { checkedAt: { gte: since } },
      orderBy: { checkedAt: 'asc' },
      select: { checkedAt: true },
    });
  }

  /** Minutes with at least one check; several API instances checking in the same minute count once */
  async countCheckedMinutes(since: Date) {
    const [row] = await this.prisma.$queryRaw<{ minutes: number }[]>`
      SELECT COUNT(DISTINCT date_trunc('minute', "checkedAt"))::int AS minutes
      FROM "HealthCheck"
      WHERE "checkedAt" >= ${since}
    `;
    return row?.minutes ?? 0;
  }

  findLivekitLatencies(since: Date) {
    return this.prisma.healthCheck.findMany({
      where: {
        checkedAt: { gte: since },
        livekitOk: true,
        livekitMs: { not: null },
      },
      select: { livekitMs: true },
    });
  }

  deleteBefore(before: Date) {
    return this.prisma.healthCheck.deleteMany({
      where: { checkedAt: { lt: before } },
    });
  }
}
