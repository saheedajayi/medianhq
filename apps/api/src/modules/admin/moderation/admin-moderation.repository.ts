import { Injectable } from '@nestjs/common';
import {
  ContentFlagStatus,
  Prisma,
  type ContentFlagType,
  type ModerationActionType,
} from '@prisma/client';
import { PrismaService } from '../../../database/prisma.service';
import type { ModerationFlagsFilters } from './dto/admin-moderation.dto';

const HOUR_MS = 60 * 60 * 1000;
const FLAGGED_OVER_HOURS = { '24h': 24, '7d': 7 * 24, '30d': 30 * 24 } as const;

// Shown in a conversation in place of a removed message, so the thread still reads in order
const REMOVED_MESSAGE = 'This message was removed by Median moderators.';

const PERSON_SELECT = {
  id: true,
  firstName: true,
  lastName: true,
  role: true,
  createdAt: true,
  suspendedAt: true,
  mentorProfile: { select: { avatarUrl: true, location: true } },
  menteeProfile: { select: { avatarUrl: true, location: true } },
} satisfies Prisma.UserSelect;

const FLAG_INCLUDE = {
  author: { select: PERSON_SELECT },
  recipient: { select: PERSON_SELECT },
  actions: { orderBy: { createdAt: 'asc' } },
} satisfies Prisma.ContentFlagInclude;

export type FlagRecord = Prisma.ContentFlagGetPayload<{
  include: typeof FLAG_INCLUDE;
}>;
export type FlagPersonRecord = FlagRecord['author'];

@Injectable()
export class AdminModerationRepository {
  constructor(private readonly prisma: PrismaService) {}

  buildFlagsWhereClause(
    filters: ModerationFlagsFilters,
    now: Date,
  ): Prisma.ContentFlagWhereInput {
    const and: Prisma.ContentFlagWhereInput[] = [];
    if (filters.type) and.push({ contentType: filters.type });
    if (filters.status) and.push({ status: filters.status });
    if (filters.flaggedOver) {
      const since =
        now.getTime() - FLAGGED_OVER_HOURS[filters.flaggedOver] * HOUR_MS;
      and.push({ flaggedAt: { gte: new Date(since) } });
    }
    for (const term of filters.search?.split(/\s+/).filter(Boolean) ?? []) {
      const contains = { contains: term, mode: 'insensitive' } as const;
      and.push({
        OR: [
          { content: contains },
          { author: { firstName: contains } },
          { author: { lastName: contains } },
          { recipient: { firstName: contains } },
          { recipient: { lastName: contains } },
        ],
      });
    }
    return { AND: and };
  }

  findFlags(where: Prisma.ContentFlagWhereInput, skip?: number, take?: number) {
    return this.prisma.contentFlag.findMany({
      where,
      include: FLAG_INCLUDE,
      orderBy: { flaggedAt: 'desc' },
      skip,
      take,
    });
  }

  countFlags(where: Prisma.ContentFlagWhereInput) {
    return this.prisma.contentFlag.count({ where });
  }

  countFlagsByType() {
    return this.prisma.contentFlag.groupBy({
      by: ['contentType'],
      _count: { _all: true },
    });
  }

  findFlagById(flagId: string) {
    return this.prisma.contentFlag.findUnique({
      where: { id: flagId },
      include: FLAG_INCLUDE,
    });
  }

  /** Records the reviewer's action and the flag's new status together */
  recordAction(
    flagId: string,
    status: ContentFlagStatus,
    action: {
      action: ModerationActionType;
      adminId: string | null;
      adminName: string | null;
    },
  ) {
    return this.prisma.contentFlag.update({
      where: { id: flagId },
      data: { status, reviewedAt: new Date(), actions: { create: action } },
      include: FLAG_INCLUDE,
    });
  }

  /**
   * Takes the flagged text down. Posts and comments are deleted, a message
   * is replaced with a removal notice, and profile text is cleared. The flag
   * keeps its own copy of the text.
   */
  async removeContent(flag: {
    contentType: ContentFlagType;
    contentId: string;
    contentField: string;
    authorId: string;
  }) {
    switch (flag.contentType) {
      case 'FORUM_POST':
        if (flag.contentField === 'Comment') {
          await this.prisma.communityComment.deleteMany({
            where: { id: flag.contentId },
          });
        } else {
          await this.prisma.communityPost.deleteMany({
            where: { id: flag.contentId },
          });
        }
        return;
      case 'MESSAGE':
        await this.prisma.message.updateMany({
          where: { id: flag.contentId },
          data: { content: REMOVED_MESSAGE },
        });
        return;
      case 'PROFILE_TEXT':
        // A user has a mentor or a mentee profile; clearing both covers either
        await Promise.all([
          this.prisma.mentorProfile.updateMany({
            where: { userId: flag.authorId },
            data: { bio: null },
          }),
          this.prisma.menteeProfile.updateMany({
            where: { userId: flag.authorId },
            data: { bio: null },
          }),
        ]);
        return;
    }
  }

  /** Every reviewer action with the content it was taken on, newest first */
  findActions(skip: number, take: number) {
    return this.prisma.moderationAction.findMany({
      include: {
        flag: {
          select: {
            contentType: true,
            content: true,
            reason: true,
            status: true,
            author: { select: { firstName: true, lastName: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take,
    });
  }

  countActions() {
    return this.prisma.moderationAction.count();
  }

  findAuthorEmail(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, firstName: true },
    });
  }

  findBlockedTerms() {
    return this.prisma.blockedTerm.findMany({ orderBy: { term: 'asc' } });
  }

  /** Adding a term that is already listed updates its reason */
  upsertBlockedTerm(term: string, reason: string, createdById: string | null) {
    return this.prisma.blockedTerm.upsert({
      where: { term },
      create: { term, reason, createdById },
      update: { reason },
    });
  }

  deleteBlockedTerm(termId: string) {
    return this.prisma.blockedTerm.deleteMany({ where: { id: termId } });
  }
}
