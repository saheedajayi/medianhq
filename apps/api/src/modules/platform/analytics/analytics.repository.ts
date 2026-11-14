import { Injectable } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { PrismaService } from '../../../database/prisma.service';

@Injectable()
export class AnalyticsRepository {
  constructor(private readonly prisma: PrismaService) {}

  createEvent(data: Prisma.AnalyticsEventCreateInput) {
    return this.prisma.analyticsEvent.create({ data, select: { id: true } });
  }
}
