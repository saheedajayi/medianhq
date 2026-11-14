import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { fullName, oneOf, type AdminActor } from '../common/admin-actor';
import { AdminModerationRepository } from './admin-moderation.repository';
import {
  FLAG_CONTENT_TYPES,
  FLAG_STATUSES,
  REVIEWER_ACTIONS,
  type FlagStatus,
  type ModerationFlagsFilters,
  type ModerationFlagsQueryDto,
  type ModerationHistoryQueryDto,
  type ReviewerAction,
  type TakeFlagActionDto,
} from './dto/admin-moderation.dto';

const FLAGS_PAGE_SIZE = 10;
const HISTORY_PAGE_SIZE = 9;

// What each reviewer action leaves the flag as, and how the audit trail words it
const ACTION_OUTCOME: Record<
  ReviewerAction,
  { status: FlagStatus; detail: string }
> = {
  APPROVE: { status: 'REVIEWED', detail: 'Approved' },
  REMOVE: { status: 'REMOVED', detail: 'Content removed' },
  ESCALATE: { status: 'ESCALATED', detail: 'Escalated' },
  WARN_USER: { status: 'REVIEWED', detail: 'User warned' },
};

const readPage = (page?: number | string) => Math.max(Number(page) || 1, 1);

const paginate = <T>(items: T[], page: number, pageSize: number) =>
  items.slice((page - 1) * pageSize, page * pageSize);

@Injectable()
export class AdminModerationService {
  constructor(
    private readonly moderationRepository: AdminModerationRepository,
  ) {}

  getFlags(query: ModerationFlagsQueryDto, now = new Date()) {
    const page = readPage(query.page);
    const flags = this.moderationRepository.findFlags(
      this.readFilters(query),
      now,
    );
    const byType = this.moderationRepository.countFlagsByType();

    return {
      items: paginate(flags, page, FLAGS_PAGE_SIZE),
      total: flags.length,
      page,
      pageSize: FLAGS_PAGE_SIZE,
      counts: {
        all: byType.FORUM_POST + byType.MESSAGE + byType.PROFILE_TEXT,
        forumPost: byType.FORUM_POST,
        message: byType.MESSAGE,
        profileText: byType.PROFILE_TEXT,
      },
      updatedAt: now,
    };
  }

  /** Every flag matching the filters, for the CSV export */
  exportFlags(query: ModerationFlagsQueryDto, now = new Date()) {
    return this.moderationRepository.findFlags(this.readFilters(query), now);
  }

  getHistory(query: ModerationHistoryQueryDto) {
    const page = readPage(query.page);
    const history = this.moderationRepository.findHistory();
    return {
      items: paginate(history, page, HISTORY_PAGE_SIZE),
      total: history.length,
      page,
      pageSize: HISTORY_PAGE_SIZE,
    };
  }

  takeAction(
    flagId: string,
    dto: TakeFlagActionDto,
    actor?: AdminActor,
    now = new Date(),
  ) {
    const action = oneOf(dto.action, REVIEWER_ACTIONS);
    if (!action) {
      throw new BadRequestException('Choose a reviewer action.');
    }
    const flag = this.moderationRepository.findFlagById(flagId);
    if (!flag) throw new NotFoundException('Flagged content not found.');

    const { status, detail } = ACTION_OUTCOME[action];
    const reviewerName = actor ? fullName(actor) : 'Admin';
    this.moderationRepository.updateFlagStatus(flag, status, {
      at: now,
      label: `Reviewed by ${reviewerName}`,
      detail,
    });
    this.moderationRepository.addHistoryEntry({
      id: `${flag.id}:${now.getTime()}`,
      at: now,
      contentType: flag.contentType,
      content: flag.content,
      authorName: flag.author.name,
      outcome: status,
      reviewer: { name: reviewerName, role: 'Admin', avatarUrl: null },
      reason: flag.reason,
    });
    return flag;
  }

  private readFilters(query: ModerationFlagsQueryDto): ModerationFlagsFilters {
    return {
      type: oneOf(query.type, FLAG_CONTENT_TYPES),
      status: oneOf(query.status, FLAG_STATUSES),
      flaggedOver: oneOf(query.flaggedOver, ['24h', '7d', '30d'] as const),
      search: query.search?.trim() || undefined,
    };
  }
}
