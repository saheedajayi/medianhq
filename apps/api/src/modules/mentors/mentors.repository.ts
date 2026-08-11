import { Injectable } from '@nestjs/common';
import { MentorStatus, UserRole } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import type { CreateMentorProfileDto } from './dto/create-mentor-profile.dto';

@Injectable()
export class MentorsRepository {
  constructor(private readonly prisma: PrismaService) {}

  findMenteeProfileByUserId(userId: string) {
    return this.prisma.menteeProfile.findUnique({
      where: { userId },
    });
  }

  findUserForOnboarding(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        emailVerifiedAt: true,
        role: true,
        menteeProfile: { select: { id: true } },
        mentorProfile: { select: { id: true, status: true } },
      },
    });
  }

  findApprovedMatches(menteeIndustry: string, menteeRole: string) {
    return this.prisma.$queryRaw<
      Array<{
        id: string;
        userId: string;
        headline: string | null;
        company: string | null;
        jobTitle: string | null;
        industry: string;
        firstName: string;
        lastName: string;
        score: number;
      }>
    >`
      SELECT m.id, m."userId", m.headline, m.company, m."jobTitle", m.industry, u."firstName", u."lastName",
        (CASE WHEN m.industry = ${menteeIndustry} THEN 50 ELSE 0 END) +
        (CASE WHEN m."jobTitle" = ${menteeRole} THEN 30 ELSE 0 END) AS score
      FROM "MentorProfile" m
      JOIN "User" u ON m."userId" = u.id
      WHERE m.status = 'APPROVED'
      ORDER BY score DESC
      LIMIT 5
    `;
  }

  async upsertProfileByUserId(userId: string, dto: CreateMentorProfileDto) {
    // Sync User role to MENTOR
    await this.prisma.user.update({
      where: { id: userId },
      data: { role: UserRole.MENTOR },
    });

    const existing = await this.prisma.mentorProfile.findUnique({
      where: { userId },
    });

    const industry = (dto.industry && dto.industry.trim()) || existing?.industry || 'Technology';
    const experience = (dto.experience && dto.experience.trim()) || existing?.experience || '1-3 years';
    const company = dto.company !== undefined ? (dto.company || null) : (existing?.company ?? null);
    const jobTitle = dto.currentRole !== undefined ? (dto.currentRole || null) : (existing?.jobTitle ?? null);
    const location = dto.location !== undefined ? (dto.location || null) : (existing?.location ?? null);
    const bio = dto.bio !== undefined ? (dto.bio || null) : (existing?.bio ?? null);
    const cvUrl = typeof dto.cvUrl === 'string' && dto.cvUrl.trim() ? dto.cvUrl : (existing?.cvUrl ?? null);

    return this.prisma.mentorProfile.upsert({
      where: { userId },
      update: {
        industry,
        experience,
        company,
        jobTitle,
        location,
        bio,
        cvUrl,
        status: MentorStatus.PENDING_REVIEW,
      },
      create: {
        userId,
        industry,
        experience,
        company,
        jobTitle,
        location,
        bio,
        cvUrl,
        status: MentorStatus.PENDING_REVIEW,
      },
    });
  }
}
