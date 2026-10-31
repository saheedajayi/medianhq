import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { MentorStatus } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { EmailService } from '../platform/email/email.service';
import { UploadsService } from '../platform/uploads/uploads.service';

@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
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

  async approveMentor(mentorProfileId: string) {
    const profile = await this.setMentorStatus(
      mentorProfileId,
      MentorStatus.APPROVED,
    );
    await this.emailService
      .sendBookingUpdate({
        email: profile.user.email,
        firstName: profile.user.firstName,
        subject: "You're approved to mentor on Median",
        paragraphs: [
          'Your mentor application has been approved, and your profile is now visible to mentees.',
          'Set your weekly availability and create your first session so mentees can book you.',
        ],
        details: [],
        ctaLabel: 'Set your availability',
        ctaPath: '/mentor/availability',
        idempotencyKey: `mentor-approved:${profile.id}`,
      })
      .catch(() => undefined);
    return { mentorProfileId, status: profile.status };
  }

  async rejectMentor(mentorProfileId: string, reason?: string) {
    const profile = await this.setMentorStatus(
      mentorProfileId,
      MentorStatus.REJECTED,
    );
    await this.emailService
      .sendBookingUpdate({
        email: profile.user.email,
        firstName: profile.user.firstName,
        subject: 'An update on your Median mentor application',
        paragraphs: [
          "Thank you for applying to mentor on Median. We aren't able to approve your application right now.",
          ...(reason?.trim()
            ? [`Feedback from our team: ${reason.trim()}`]
            : []),
          'You are welcome to reply to this email with any questions.',
        ],
        details: [],
        ctaLabel: 'Visit Median',
        ctaPath: '/',
        idempotencyKey: `mentor-rejected:${profile.id}`,
      })
      .catch(() => undefined);
    return { mentorProfileId, status: profile.status };
  }

  private async setMentorStatus(mentorProfileId: string, status: MentorStatus) {
    const existing = await this.prisma.mentorProfile.findUnique({
      where: { id: mentorProfileId },
    });
    if (!existing) {
      throw new NotFoundException('Mentor application not found.');
    }
    if (existing.status === MentorStatus.DRAFT) {
      throw new BadRequestException(
        'This mentor has not submitted an application yet.',
      );
    }
    return this.prisma.mentorProfile.update({
      where: { id: mentorProfileId },
      data: { status },
      include: { user: { select: { email: true, firstName: true } } },
    });
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
