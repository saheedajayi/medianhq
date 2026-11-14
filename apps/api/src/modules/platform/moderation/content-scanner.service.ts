import { Injectable, Logger } from '@nestjs/common';
import { ContentFlagStatus, type ContentFlagType } from '@prisma/client';
import { PrismaService } from '../../../database/prisma.service';
import { findBlockedTerms, type BlockedTermRule } from './blocked-terms';

// The blocklist changes rarely, so it is read at most this often
const CACHE_MS = 60_000;

export type ScannedContent = {
  contentType: ContentFlagType;
  contentId: string;
  /** "Post" or "Comment" for forum posts, the field name for profile text */
  contentField: string;
  content: string;
  authorId: string;
  recipientId?: string;
};

/**
 * Checks new and edited text against the admins' blocklist and flags matches
 * for review in the moderation queue. Content is never blocked from being
 * saved: flagging happens afterwards and its failures are only logged.
 */
@Injectable()
export class ContentScannerService {
  private readonly logger = new Logger(ContentScannerService.name);
  private cache: { rules: BlockedTermRule[]; loadedAt: number } | null = null;

  constructor(private readonly prisma: PrismaService) {}

  /** Not awaited by callers, so it can't slow down or break the write it follows */
  scan(input: ScannedContent) {
    void this.flagIfBlocked(input).catch((error: unknown) =>
      this.logger.error(
        `Could not scan ${input.contentType} ${input.contentId}`,
        error instanceof Error ? error.stack : error,
      ),
    );
  }

  /** Called when admins change the blocklist, so new terms apply straight away */
  clearCache() {
    this.cache = null;
  }

  async flagIfBlocked(input: ScannedContent) {
    const content = input.content.trim();
    if (!content) return null;

    const matches = findBlockedTerms(content, await this.loadRules());
    if (!matches.length) return null;

    const flag = {
      content,
      authorId: input.authorId,
      recipientId: input.recipientId ?? null,
      reason: [...new Set(matches.map((match) => match.reason))].join(', '),
      matchedTerms: matches.map((match) => match.term),
      status: ContentFlagStatus.PENDING,
      flaggedAt: new Date(),
      reviewedAt: null,
    };
    // Editing flagged content puts it back in the queue with the new text
    return this.prisma.contentFlag.upsert({
      where: {
        contentType_contentId_contentField: {
          contentType: input.contentType,
          contentId: input.contentId,
          contentField: input.contentField,
        },
      },
      create: {
        contentType: input.contentType,
        contentId: input.contentId,
        contentField: input.contentField,
        ...flag,
      },
      update: flag,
    });
  }

  private async loadRules() {
    if (this.cache && Date.now() - this.cache.loadedAt < CACHE_MS) {
      return this.cache.rules;
    }
    const rules = await this.prisma.blockedTerm.findMany({
      select: { term: true, reason: true },
    });
    this.cache = { rules, loadedAt: Date.now() };
    return rules;
  }
}
