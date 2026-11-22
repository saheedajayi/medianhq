import { Injectable } from '@nestjs/common';
import { MentorStatus, Prisma, UserRole } from '@prisma/client';
import { PrismaService } from '../../../database/prisma.service';
import type { AdminApplicationsFilters } from './dto/admin-applications.dto';

const DAY_MS = 24 * 60 * 60 * 1000;
const SUBMITTED_DAYS = { '7d': 7, '30d': 30, '90d': 90 } as const;
const PERSON_NAME_SELECT = {
  id: true,
  firstName: true,
  lastName: true,
} as const;

const APPLICATION_INCLUDE = {
  user: { select: { ...PERSON_NAME_SELECT, email: true } },
  reviewer: { select: PERSON_NAME_SELECT },
} satisfies Prisma.MentorProfileInclude;

export type ApplicationRecord = Prisma.MentorProfileGetPayload<{
  include: typeof APPLICATION_INCLUDE;
}>;

@Injectable()
export class AdminApplicationsRepository {
  constructor(private readonly prisma: PrismaService) {}

  buildWhereClause(
    filters: AdminApplicationsFilters,
    now: Date,
  ): Prisma.MentorProfileWhereInput {
    const and: Prisma.MentorProfileWhereInput[] = [{ status: filters.status }];

    // Every word has to match the applicant's name, email or the application ID
    for (const term of filters.search?.split(/\s+/).filter(Boolean) ?? []) {
      and.push({
        OR: [
          { user: { firstName: { contains: term, mode: 'insensitive' } } },
          { user: { lastName: { contains: term, mode: 'insensitive' } } },
          { user: { email: { contains: term, mode: 'insensitive' } } },
          { id: term },
        ],
      });
    }
    if (filters.expertise) and.push({ industry: filters.expertise });
    if (filters.submitted) {
      const since = now.getTime() - SUBMITTED_DAYS[filters.submitted] * DAY_MS;
      and.push({ submittedAt: { gte: new Date(since) } });
    }
    if (filters.reviewer) {
      and.push({
        reviewerId: filters.reviewer === 'unassigned' ? null : filters.reviewer,
      });
    }
    return { AND: and };
  }

  findApplications(
    where: Prisma.MentorProfileWhereInput,
    sort: AdminApplicationsFilters['sort'],
    skip?: number,
    take?: number,
  ) {
    return this.prisma.mentorProfile.findMany({
      where,
      include: APPLICATION_INCLUDE,
      orderBy: { submittedAt: sort === 'newest' ? 'desc' : 'asc' },
      skip,
      take,
    });
  }

  countApplications(where: Prisma.MentorProfileWhereInput) {
    return this.prisma.mentorProfile.count({ where });
  }

  countByStatus() {
    return this.prisma.mentorProfile.groupBy({
      by: ['status'],
      _count: { _all: true },
    });
  }

  findPendingSubmissionDates() {
    return this.prisma.mentorProfile.findMany({
      where: { status: MentorStatus.PENDING_REVIEW },
      select: { submittedAt: true, updatedAt: true },
    });
  }

  /** The industries applicants have applied under, for the expertise filter */
  findExpertiseOptions() {
    return this.prisma.mentorProfile.findMany({
      where: { status: { not: MentorStatus.DRAFT } },
      select: { industry: true },
      distinct: ['industry'],
      orderBy: { industry: 'asc' },
    });
  }

  findAdmins() {
    return this.prisma.user.findMany({
      where: { role: UserRole.ADMIN },
      select: PERSON_NAME_SELECT,
      orderBy: { firstName: 'asc' },
    });
  }

  findAdminById(adminId: string) {
    return this.prisma.user.findFirst({
      where: { id: adminId, role: UserRole.ADMIN },
      select: PERSON_NAME_SELECT,
    });
  }

  /** A submitted application; drafts are not reviewable */
  findSubmittedById(applicationId: string) {
    return this.prisma.mentorProfile.findFirst({
      where: { id: applicationId, status: { not: MentorStatus.DRAFT } },
      include: APPLICATION_INCLUDE,
    });
  }

  findPendingById(applicationId: string) {
    return this.prisma.mentorProfile.findFirst({
      where: { id: applicationId, status: MentorStatus.PENDING_REVIEW },
      include: APPLICATION_INCLUDE,
    });
  }

  findPendingByIds(applicationIds: string[]) {
    return this.prisma.mentorProfile.findMany({
      where: {
        id: { in: applicationIds },
        status: MentorStatus.PENDING_REVIEW,
      },
      include: APPLICATION_INCLUDE,
    });
  }

  findById(applicationId: string) {
    return this.prisma.mentorProfile.findUnique({
      where: { id: applicationId },
    });
  }

  findAuditEvents(userId: string, take: number) {
    return this.prisma.securityAuditLog.findMany({
      where: { userId, action: { startsWith: 'APPLICATION_' } },
      select: { id: true, action: true, metadata: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
      take,
    });
  }

  assignReviewer(applicationIds: string[], reviewerId: string | null) {
    return this.prisma.mentorProfile.updateMany({
      where: { id: { in: applicationIds } },
      data: { reviewerId },
    });
  }

  updateReview(applicationId: string, data: Prisma.MentorProfileUpdateInput) {
    return this.prisma.mentorProfile.update({
      where: { id: applicationId },
      data,
    });
  }

  setDecision(applicationId: string, status: MentorStatus) {
    return this.prisma.mentorProfile.update({
      where: { id: applicationId },
      data: {
        status,
        decidedAt: new Date(),
        rejectionSeenAt: null,
        // A rejected applicant carries on as a mentee instead of being left with
        // nothing to do; approving puts them back on the mentor side
        user: {
          update:
            status === MentorStatus.REJECTED
              ? {
                  role: UserRole.MENTEE,
                  menteeProfile: { upsert: { create: {}, update: {} } },
                }
              : { role: UserRole.MENTOR },
        },
      },
      include: APPLICATION_INCLUDE,
    });
  }
}
