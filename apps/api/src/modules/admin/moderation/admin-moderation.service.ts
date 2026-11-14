import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ContentFlagStatus, type ModerationActionType } from '@prisma/client';
import { EmailService } from '../../platform/email/email.service';
import { ContentScannerService } from '../../platform/moderation/content-scanner.service';
import { fullName, oneOf, type AdminActor } from '../common/admin-actor';
import { countryOf } from '../common/location';
import {
  AdminModerationRepository,
  type FlagPersonRecord,
  type FlagRecord,
} from './admin-moderation.repository';
import {
  FLAG_CONTENT_TYPES,
  FLAG_STATUSES,
  REVIEWER_ACTIONS,
  type AddBlockedTermDto,
  type ContentFlag,
  type FlagPerson,
  type ModerationFlagsFilters,
  type ModerationFlagsQueryDto,
  type ModerationHistoryQueryDto,
  type TakeFlagActionDto,
} from './dto/admin-moderation.dto';

const FLAGS_PAGE_SIZE = 10;
const HISTORY_PAGE_SIZE = 9;
const EXPORT_LIMIT = 5000;
const TERM_MAX_LENGTH = 60;
const REASON_MAX_LENGTH = 80;

// What each reviewer action leaves the flag as, and how the audit trail words it
const ACTION_OUTCOME: Record<
  ModerationActionType,
  { status: ContentFlagStatus; detail: string }
> = {
  APPROVE: { status: ContentFlagStatus.REVIEWED, detail: 'Approved' },
  REMOVE: { status: ContentFlagStatus.REMOVED, detail: 'Content removed' },
  ESCALATE: { status: ContentFlagStatus.ESCALATED, detail: 'Escalated' },
  WARN_USER: { status: ContentFlagStatus.FLAGGED, detail: 'User warned' },
};

const readPage = (page?: number | string) => Math.max(Number(page) || 1, 1);

@Injectable()
export class AdminModerationService {
  constructor(
    private readonly moderationRepository: AdminModerationRepository,
    private readonly contentScanner: ContentScannerService,
    private readonly emailService: EmailService,
  ) {}

  async getFlags(query: ModerationFlagsQueryDto, now = new Date()) {
    const page = readPage(query.page);
    const where = this.moderationRepository.buildFlagsWhereClause(
      this.readFilters(query),
      now,
    );
    const [flags, total, byType] = await Promise.all([
      this.moderationRepository.findFlags(
        where,
        (page - 1) * FLAGS_PAGE_SIZE,
        FLAGS_PAGE_SIZE,
      ),
      this.moderationRepository.countFlags(where),
      this.moderationRepository.countFlagsByType(),
    ]);
    const countOf = (type: string) =>
      byType.find((group) => group.contentType === type)?._count._all ?? 0;

    return {
      items: flags.map((flag) => this.toFlag(flag)),
      total,
      page,
      pageSize: FLAGS_PAGE_SIZE,
      counts: {
        all: byType.reduce((sum, group) => sum + group._count._all, 0),
        forumPost: countOf('FORUM_POST'),
        message: countOf('MESSAGE'),
        profileText: countOf('PROFILE_TEXT'),
      },
      updatedAt: now,
    };
  }

  /** Every flag matching the filters, for the CSV export */
  async exportFlags(query: ModerationFlagsQueryDto, now = new Date()) {
    const flags = await this.moderationRepository.findFlags(
      this.moderationRepository.buildFlagsWhereClause(
        this.readFilters(query),
        now,
      ),
      0,
      EXPORT_LIMIT,
    );
    return flags.map((flag) => this.toFlag(flag));
  }

  async getHistory(query: ModerationHistoryQueryDto) {
    const page = readPage(query.page);
    const [actions, total] = await Promise.all([
      this.moderationRepository.findActions(
        (page - 1) * HISTORY_PAGE_SIZE,
        HISTORY_PAGE_SIZE,
      ),
      this.moderationRepository.countActions(),
    ]);

    return {
      items: actions.map((action) => ({
        id: action.id,
        at: action.createdAt,
        contentType: action.flag.contentType,
        content: action.flag.content,
        authorName: fullName(action.flag.author),
        outcome: ACTION_OUTCOME[action.action].status,
        reviewer: {
          name: action.adminName ?? 'Backoffice',
          role: 'Admin',
          avatarUrl: null,
        },
        reason: action.flag.reason,
      })),
      total,
      page,
      pageSize: HISTORY_PAGE_SIZE,
    };
  }

  async takeAction(flagId: string, dto: TakeFlagActionDto, actor?: AdminActor) {
    const action = oneOf(dto.action, REVIEWER_ACTIONS);
    if (!action) throw new BadRequestException('Choose a reviewer action.');

    const flag = await this.moderationRepository.findFlagById(flagId);
    if (!flag) throw new NotFoundException('Flagged content not found.');

    if (action === 'REMOVE') {
      await this.moderationRepository.removeContent(flag);
    }
    if (action === 'WARN_USER') {
      await this.warnAuthor(flag);
    }

    const updated = await this.moderationRepository.recordAction(
      flag.id,
      ACTION_OUTCOME[action].status,
      {
        action,
        adminId: actor?.id ?? null,
        adminName: actor ? fullName(actor) : null,
      },
    );
    return this.toFlag(updated);
  }

  async getBlocklist() {
    const terms = await this.moderationRepository.findBlockedTerms();
    return terms.map(({ id, term, reason, createdAt }) => ({
      id,
      term,
      reason,
      createdAt,
    }));
  }

  /** New terms apply to content written from now on; existing content isn't rescanned */
  async addBlockedTerm(dto: AddBlockedTermDto, actor?: AdminActor) {
    const term = dto.term?.trim().toLowerCase();
    const reason = dto.reason?.trim();
    if (!term) throw new BadRequestException('Enter a word or phrase.');
    if (!reason)
      throw new BadRequestException('Enter the reason it is blocked.');
    if (term.length > TERM_MAX_LENGTH || reason.length > REASON_MAX_LENGTH) {
      throw new BadRequestException(
        `Keep the term under ${TERM_MAX_LENGTH} characters and the reason under ${REASON_MAX_LENGTH}.`,
      );
    }

    const saved = await this.moderationRepository.upsertBlockedTerm(
      term,
      reason,
      actor?.id ?? null,
    );
    this.contentScanner.clearCache();
    return {
      id: saved.id,
      term: saved.term,
      reason: saved.reason,
      createdAt: saved.createdAt,
    };
  }

  async removeBlockedTerm(termId: string) {
    await this.moderationRepository.deleteBlockedTerm(termId);
    this.contentScanner.clearCache();
    return { termId };
  }

  /** A failed email must not undo the warning, which is still recorded */
  private async warnAuthor(flag: FlagRecord) {
    const author = await this.moderationRepository.findAuthorEmail(
      flag.authorId,
    );
    if (!author) return;
    await this.emailService
      .sendBookingUpdate({
        email: author.email,
        firstName: author.firstName,
        subject: 'A note about your content on Median',
        paragraphs: [
          `Something you wrote on Median was flagged by our moderators for: ${flag.reason}.`,
          'Please keep conversations respectful, keep contact on Median and avoid promotions. Repeated breaches can lead to your account being suspended.',
          'You are welcome to reply to this email if you think this was a mistake.',
        ],
        details: [],
        ctaLabel: 'Visit Median',
        ctaPath: '/',
        idempotencyKey: `moderation-warning:${flag.id}:${flag.flaggedAt.getTime()}`,
      })
      .catch(() => undefined);
  }

  private readFilters(query: ModerationFlagsQueryDto): ModerationFlagsFilters {
    return {
      type: oneOf(query.type, FLAG_CONTENT_TYPES),
      status: oneOf(query.status, FLAG_STATUSES),
      flaggedOver: oneOf(query.flaggedOver, ['24h', '7d', '30d'] as const),
      search: query.search?.trim() || undefined,
    };
  }

  private toFlag(flag: FlagRecord): ContentFlag {
    return {
      id: flag.id,
      contentType: flag.contentType,
      content: flag.content,
      author: this.toPerson(flag.author),
      recipient: flag.recipient && this.toPerson(flag.recipient),
      profileField:
        flag.contentType === 'PROFILE_TEXT' ? flag.contentField : null,
      reason: flag.reason,
      flaggedBy: 'Automated System',
      flaggedAt: flag.flaggedAt,
      status: flag.status,
      auditTrail: [
        { at: flag.flaggedAt, label: 'Flagged by System', detail: flag.reason },
        ...flag.actions.map((action) => ({
          at: action.createdAt,
          label: `Reviewed by ${action.adminName ?? 'Backoffice'}`,
          detail: ACTION_OUTCOME[action.action].detail,
        })),
      ],
    };
  }

  private toPerson(person: FlagPersonRecord): FlagPerson {
    const profile = person.mentorProfile ?? person.menteeProfile;
    return {
      id: person.id,
      name: fullName(person),
      avatarUrl: profile?.avatarUrl ?? null,
      role: person.role === 'MENTOR' ? 'Mentor' : 'Mentee',
      joinedAt: person.createdAt,
      country: countryOf(profile?.location) ?? '—',
      accountStatus: person.suspendedAt ? 'Suspended' : 'Active',
    };
  }
}
