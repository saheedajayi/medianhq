import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { MentorStatus, Prisma } from '@prisma/client';
import {
  SecurityAuditService,
  type SecurityEventAction,
} from '../../identity/auth/security-audit.service';
import { EmailService } from '../../platform/email/email.service';
import { UploadsService } from '../../platform/uploads/uploads.service';
import { fullName, oneOf, type AdminActor } from '../common/admin-actor';
import { addBusinessDays, businessDaysBetween } from '../common/business-days';
import {
  AdminApplicationsRepository,
  type ApplicationRecord,
} from './admin-applications.repository';
import { approvalEmail, rejectionEmail } from './application-emails';
import {
  REVIEW_CHECKLIST_ITEMS,
  type AdminApplicationsFilters,
  type AdminApplicationsQueryDto,
  type ApplicationStatus,
  type AssignReviewerDto,
  type ReviewChecklist,
  type SaveApplicationReviewDto,
} from './dto/admin-applications.dto';

const PAGE_SIZE = 6;
const EXPORT_LIMIT = 5000;
const AUDIT_LIMIT = 20;
/** Applications are reviewed by a person within 3 to 5 business days */
const REVIEW_TARGET_BUSINESS_DAYS = 5;
const NEARING_TARGET_BUSINESS_DAYS = 4;

@Injectable()
export class AdminApplicationsService {
  constructor(
    private readonly applicationsRepository: AdminApplicationsRepository,
    private readonly securityAudit: SecurityAuditService,
    private readonly emailService: EmailService,
    private readonly uploadsService: UploadsService,
  ) {}

  async list(query: AdminApplicationsQueryDto, now = new Date()) {
    const filters = this.readFilters(query);
    const page = Math.max(Number(query.page) || 1, 1);
    const where = this.applicationsRepository.buildWhereClause(filters, now);

    const [applications, total, byStatus, pending, industries, admins] =
      await Promise.all([
        this.applicationsRepository.findApplications(
          where,
          filters.sort,
          (page - 1) * PAGE_SIZE,
          PAGE_SIZE,
        ),
        this.applicationsRepository.countApplications(where),
        this.applicationsRepository.countByStatus(),
        this.applicationsRepository.findPendingSubmissionDates(),
        this.applicationsRepository.findExpertiseOptions(),
        this.applicationsRepository.findAdmins(),
      ]);

    const countFor = (status: MentorStatus) =>
      byStatus.find((group) => group.status === status)?._count._all ?? 0;

    return {
      items: applications.map((application) => this.toItem(application, now)),
      total,
      page,
      pageSize: PAGE_SIZE,
      counts: {
        pending: countFor(MentorStatus.PENDING_REVIEW),
        approved: countFor(MentorStatus.APPROVED),
        rejected: countFor(MentorStatus.REJECTED),
      },
      nearingTarget: pending.filter(
        (application) =>
          businessDaysBetween(
            application.submittedAt ?? application.updatedAt,
            now,
          ) >= NEARING_TARGET_BUSINESS_DAYS,
      ).length,
      expertise: industries.map((profile) => profile.industry),
      reviewers: admins.map((admin) => ({
        id: admin.id,
        name: fullName(admin),
      })),
    };
  }

  /** Every application matching the filters, for the CSV export */
  async export(query: AdminApplicationsQueryDto, now = new Date()) {
    const filters = this.readFilters(query);
    const applications = await this.applicationsRepository.findApplications(
      this.applicationsRepository.buildWhereClause(filters, now),
      filters.sort,
      0,
      EXPORT_LIMIT,
    );
    return applications.map((application) => this.toItem(application, now));
  }

  async getDetail(applicationId: string, now = new Date()) {
    const application =
      await this.applicationsRepository.findSubmittedById(applicationId);
    if (!application) {
      throw new NotFoundException('Mentor application not found.');
    }
    const events = await this.applicationsRepository.findAuditEvents(
      application.userId,
      AUDIT_LIMIT,
    );

    return {
      ...this.toItem(application, now),
      location: application.location,
      experience: application.experience,
      skills: application.skills,
      bio: application.bio,
      motivation: application.motivation,
      linkedinUrl: application.linkedinUrl,
      cvUrl: application.cvUrl ? this.signCvUrl(application.cvUrl) : null,
      decidedAt: application.decidedAt,
      checklist: this.readChecklist(application.reviewChecklist),
      auditTrail: events.map((event) => {
        const metadata = this.readMetadata(event.metadata);
        return {
          id: event.id,
          action: event.action,
          adminName: metadata.adminName,
          detail: metadata.detail,
          at: event.createdAt,
        };
      }),
      emailPreview: { accept: approvalEmail(), reject: rejectionEmail() },
    };
  }

  /** Assigns one reviewer to several pending applications, or clears it */
  async assignReviewer(dto: AssignReviewerDto, actor?: AdminActor) {
    const applicationIds = Array.isArray(dto.applicationIds)
      ? dto.applicationIds.filter((id): id is string => typeof id === 'string')
      : [];
    if (!applicationIds.length) {
      throw new BadRequestException('Select at least one application.');
    }

    const reviewerId =
      typeof dto.reviewerId === 'string' ? dto.reviewerId : null;
    const reviewer = reviewerId
      ? await this.applicationsRepository.findAdminById(reviewerId)
      : null;
    if (reviewerId && !reviewer) {
      throw new BadRequestException('The reviewer must be an admin.');
    }

    const applications =
      await this.applicationsRepository.findPendingByIds(applicationIds);
    await this.applicationsRepository.assignReviewer(
      applications.map((application) => application.id),
      reviewerId,
    );
    await Promise.all(
      applications.map((application) =>
        this.record(
          application,
          'APPLICATION_REVIEWER_ASSIGNED',
          actor,
          reviewer ? fullName(reviewer) : 'Unassigned',
        ),
      ),
    );
    return { updated: applications.length };
  }

  async saveReview(
    applicationId: string,
    dto: SaveApplicationReviewDto,
    actor?: AdminActor,
  ) {
    const application = await this.findPending(applicationId);
    const hasChecklist = dto.checklist !== undefined;
    const hasNote = typeof dto.note === 'string';
    const checklist = this.readChecklist(dto.checklist);

    const data: Prisma.MentorProfileUpdateInput = {};
    if (hasChecklist) data.reviewChecklist = checklist;
    if (hasNote) {
      data.reviewNote = (dto.note as string).trim() || null;
      data.reviewNoteAt = new Date();
      data.reviewNoteBy = actor ? fullName(actor) : null;
    }
    await this.applicationsRepository.updateReview(applicationId, data);

    if (hasChecklist) {
      const done = Object.values(checklist).filter(Boolean).length;
      await this.record(
        application,
        'APPLICATION_CHECKLIST_UPDATED',
        actor,
        `${done} of ${REVIEW_CHECKLIST_ITEMS.length} checks`,
      );
    }
    if (hasNote) {
      await this.record(application, 'APPLICATION_NOTE_SAVED', actor);
    }
    return { applicationId };
  }

  async approve(applicationId: string, actor?: AdminActor) {
    const application = await this.decide(
      applicationId,
      MentorStatus.APPROVED,
      actor,
    );
    await this.sendDecisionEmail(
      application,
      approvalEmail(),
      `mentor-approved:${application.id}`,
    );
    return { mentorProfileId: applicationId, status: application.status };
  }

  async reject(applicationId: string, reason?: string, actor?: AdminActor) {
    const application = await this.decide(
      applicationId,
      MentorStatus.REJECTED,
      actor,
    );
    await this.sendDecisionEmail(
      application,
      rejectionEmail(reason),
      `mentor-rejected:${application.id}`,
    );
    return { mentorProfileId: applicationId, status: application.status };
  }

  private async decide(
    applicationId: string,
    status: MentorStatus,
    actor?: AdminActor,
  ) {
    const existing = await this.applicationsRepository.findById(applicationId);
    if (!existing) {
      throw new NotFoundException('Mentor application not found.');
    }
    if (existing.status === MentorStatus.DRAFT) {
      throw new BadRequestException(
        'This mentor has not submitted an application yet.',
      );
    }

    const application = await this.applicationsRepository.setDecision(
      applicationId,
      status,
    );
    await this.record(
      application,
      status === MentorStatus.APPROVED
        ? 'APPLICATION_APPROVED'
        : 'APPLICATION_REJECTED',
      actor,
    );
    return application;
  }

  /** A failed email must not undo the decision, so errors are swallowed */
  private sendDecisionEmail(
    application: ApplicationRecord,
    email: ReturnType<typeof approvalEmail>,
    idempotencyKey: string,
  ) {
    return this.emailService
      .sendBookingUpdate({
        email: application.user.email,
        firstName: application.user.firstName,
        ...email,
        details: [],
        idempotencyKey,
      })
      .catch(() => undefined);
  }

  private async findPending(applicationId: string) {
    const application =
      await this.applicationsRepository.findPendingById(applicationId);
    if (!application) {
      throw new NotFoundException('Pending mentor application not found.');
    }
    return application;
  }

  private record(
    application: ApplicationRecord,
    action: SecurityEventAction,
    actor?: AdminActor,
    detail?: string,
  ) {
    return this.securityAudit.record({
      userId: application.user.id,
      email: application.user.email,
      action,
      status: 'SUCCESS',
      metadata: {
        applicationId: application.id,
        adminId: actor?.id ?? null,
        adminName: actor ? fullName(actor) : null,
        ...(detail && { detail }),
      },
    });
  }

  private readFilters(
    query: AdminApplicationsQueryDto,
  ): AdminApplicationsFilters {
    return {
      status:
        oneOf(query.status, [
          'PENDING_REVIEW',
          'APPROVED',
          'REJECTED',
        ] as const) ?? 'PENDING_REVIEW',
      submitted: oneOf(query.submitted, ['7d', '30d', '90d'] as const),
      sort: oneOf(query.sort, ['oldest', 'newest'] as const) ?? 'oldest',
      search: query.search?.trim() || undefined,
      expertise: query.expertise?.trim() || undefined,
      reviewer: query.reviewer?.trim() || undefined,
    };
  }

  private toItem(application: ApplicationRecord, now: Date) {
    const submittedAt = application.submittedAt ?? application.updatedAt;
    const checklist = this.readChecklist(application.reviewChecklist);
    return {
      id: application.id,
      userId: application.userId,
      name: fullName(application.user),
      email: application.user.email,
      avatarUrl: application.avatarUrl,
      jobTitle: application.jobTitle,
      company: application.company,
      expertise: application.industry,
      status: application.status as ApplicationStatus,
      submittedAt,
      // Stops counting once a decision is made
      ageBusinessDays: businessDaysBetween(
        submittedAt,
        application.decidedAt ?? now,
      ),
      reviewTarget: addBusinessDays(submittedAt, REVIEW_TARGET_BUSINESS_DAYS),
      reviewer: application.reviewer && {
        id: application.reviewer.id,
        name: fullName(application.reviewer),
      },
      checksDone: Object.values(checklist).filter(Boolean).length,
      checksTotal: REVIEW_CHECKLIST_ITEMS.length,
      note: application.reviewNote,
      noteAt: application.reviewNoteAt,
      noteBy: application.reviewNoteBy,
    };
  }

  /** Only the known checks, each as a plain true or false */
  private readChecklist(value: unknown): ReviewChecklist {
    const source =
      value && typeof value === 'object' && !Array.isArray(value)
        ? (value as Record<string, unknown>)
        : {};
    return Object.fromEntries(
      REVIEW_CHECKLIST_ITEMS.map((item) => [item, source[item] === true]),
    ) as ReviewChecklist;
  }

  private readMetadata(metadata: Prisma.JsonValue) {
    const source =
      metadata && typeof metadata === 'object' && !Array.isArray(metadata)
        ? metadata
        : {};
    const text = (value: unknown) => (typeof value === 'string' ? value : null);
    return { adminName: text(source.adminName), detail: text(source.detail) };
  }

  /** CVs are private Cloudinary assets; PDFs live under image/, Word files under raw/ */
  private signCvUrl(cvUrl: string) {
    const resourceType = cvUrl.match(
      /\/(image|raw|video)\/(?:authenticated|upload)\//,
    )?.[1];
    return this.uploadsService.getSignedUrl(
      cvUrl,
      (resourceType as 'image' | 'raw' | 'video' | undefined) ?? 'image',
    );
  }
}
