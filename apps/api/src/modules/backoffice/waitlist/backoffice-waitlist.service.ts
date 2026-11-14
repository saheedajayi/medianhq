import { Injectable } from '@nestjs/common';
import { WaitlistAudience } from '@prisma/client';
import { BackofficeWaitlistRepository } from './backoffice-waitlist.repository';
import type { BackofficeWaitlistQueryDto } from './dto/backoffice-waitlist.dto';

@Injectable()
export class BackofficeWaitlistService {
  constructor(
    private readonly waitlistRepository: BackofficeWaitlistRepository,
  ) {}

  /** Who has joined the waitlist, newest first, with totals by audience */
  async getDashboard(query: BackofficeWaitlistQueryDto) {
    const page = Number(query.page ?? 1);
    const limit = Number(query.limit ?? 20);
    const requestedPage = Number.isFinite(page) ? page : 1;
    const requestedLimit = Number.isFinite(limit) ? limit : 20;
    const pageSize = Math.min(100, Math.max(1, Math.floor(requestedLimit)));

    const [totalItems, audienceCounts, latestEntry] = await Promise.all([
      this.waitlistRepository.count(),
      this.waitlistRepository.countByAudience(),
      this.waitlistRepository.findLatest(),
    ]);
    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
    const currentPage = Math.min(
      totalPages,
      Math.max(1, Math.floor(requestedPage)),
    );
    const entries = await this.waitlistRepository.findMany({
      skip: (currentPage - 1) * pageSize,
      take: pageSize,
    });
    const counts = audienceCounts.reduce(
      (acc, item) => {
        acc[item.audience] = item._count._all;
        return acc;
      },
      {
        [WaitlistAudience.MENTEE]: 0,
        [WaitlistAudience.MENTOR]: 0,
      },
    );

    return {
      summary: {
        total: totalItems,
        mentees: counts[WaitlistAudience.MENTEE],
        mentors: counts[WaitlistAudience.MENTOR],
        latestSignupAt: latestEntry?.createdAt ?? null,
      },
      pagination: {
        page: currentPage,
        limit: pageSize,
        totalItems,
        totalPages,
        hasNextPage: currentPage < totalPages,
        hasPreviousPage: currentPage > 1,
      },
      entries,
    };
  }
}
