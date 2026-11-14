import { Injectable } from '@nestjs/common';
import { MentorStatus } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { UploadsService } from '../platform/uploads/uploads.service';
import { AdminApplicationsService } from './applications/admin-applications.service';
import type { AdminActor } from './common/admin-actor';

@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly applicationsService: AdminApplicationsService,
    private readonly uploadsService: UploadsService,
  ) {}

  /** Mentor applications, newest first, with a one-hour link to each CV */
  async listMentorApplications(
    status: MentorStatus = MentorStatus.PENDING_REVIEW,
  ) {
    const profiles = await this.prisma.mentorProfile.findMany({
      where: { status },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            createdAt: true,
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return profiles.map((profile) => ({
      id: profile.id,
      userId: profile.userId,
      name: `${profile.user.firstName} ${profile.user.lastName}`.trim(),
      email: profile.user.email,
      status: profile.status,
      currentRole: profile.jobTitle,
      company: profile.company,
      industry: profile.industry,
      experience: profile.experience,
      motivation: profile.motivation,
      linkedinUrl: profile.linkedinUrl,
      cvUrl: profile.cvUrl ? this.signCvUrl(profile.cvUrl) : null,
      appliedAt: profile.updatedAt,
    }));
  }

  approveMentor(mentorProfileId: string, actor?: AdminActor) {
    return this.applicationsService.approve(mentorProfileId, actor);
  }

  rejectMentor(mentorProfileId: string, reason?: string, actor?: AdminActor) {
    return this.applicationsService.reject(mentorProfileId, reason, actor);
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

  metrics() {
    return {
      approvedMentors: 0,
      totalMentees: 0,
      totalUsers: 0,
      completedSessions: 0,
      completedMinutes: 0,
      repeatBookingRate: 0,
      averageRevenuePerMentor: 0,
      sessionCompletionRate: 0,
      nps: 0,
    };
  }
}
