import { Injectable } from '@nestjs/common';
import {
  placeholderFlags,
  placeholderHistory,
} from './admin-moderation.placeholders';
import type {
  ContentFlag,
  FlagAuditEntry,
  FlagContentType,
  FlagStatus,
  ModerationFlagsFilters,
  ModerationHistoryEntry,
} from './dto/admin-moderation.dto';

const HOUR_MS = 60 * 60 * 1000;
const FLAGGED_OVER_HOURS = { '24h': 24, '7d': 7 * 24, '30d': 30 * 24 } as const;

/**
 * Holds flags in memory until moderation has its own tables. Every method here
 * is the shape a Prisma query will take, so only this file changes when it does.
 */
@Injectable()
export class AdminModerationRepository {
  private readonly flags: ContentFlag[] = placeholderFlags(new Date());
  private readonly history: ModerationHistoryEntry[] = placeholderHistory(
    new Date(),
  );

  findFlags(filters: ModerationFlagsFilters, now: Date) {
    const search = filters.search?.toLowerCase();
    const since = filters.flaggedOver
      ? now.getTime() - FLAGGED_OVER_HOURS[filters.flaggedOver] * HOUR_MS
      : null;

    return this.flags.filter(
      (flag) =>
        (!filters.type || flag.contentType === filters.type) &&
        (!filters.status || flag.status === filters.status) &&
        (since === null || flag.flaggedAt.getTime() >= since) &&
        (!search ||
          flag.content.toLowerCase().includes(search) ||
          flag.author.name.toLowerCase().includes(search) ||
          !!flag.recipient?.name.toLowerCase().includes(search)),
    );
  }

  countFlagsByType() {
    const counts: Record<FlagContentType, number> = {
      FORUM_POST: 0,
      MESSAGE: 0,
      PROFILE_TEXT: 0,
    };
    for (const flag of this.flags) counts[flag.contentType] += 1;
    return counts;
  }

  findFlagById(flagId: string) {
    return this.flags.find((flag) => flag.id === flagId) ?? null;
  }

  updateFlagStatus(
    flag: ContentFlag,
    status: FlagStatus,
    entry: FlagAuditEntry,
  ) {
    flag.status = status;
    flag.auditTrail.push(entry);
    return flag;
  }

  findHistory() {
    return this.history;
  }

  addHistoryEntry(entry: ModerationHistoryEntry) {
    // Newest first
    this.history.unshift(entry);
  }
}
