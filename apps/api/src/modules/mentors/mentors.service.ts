import { ConflictException, ForbiddenException, Injectable } from '@nestjs/common';
import { MentorStatus, UserRole } from '@prisma/client';
import type { CreateMentorProfileDto } from './dto/create-mentor-profile.dto';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class MentorsService {
  constructor(private readonly prisma: PrismaService) {}

  async getMatches(userId: string) {
    const menteeProfile = await this.prisma.menteeProfile.findUnique({
      where: { userId },
    });

    const menteeIndustry = menteeProfile?.industry ?? '';
    const menteeRole = menteeProfile?.currentRole ?? '';

    // Raw SQL to sort mentors by exact match score
    const matches = await this.prisma.$queryRaw<
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

    if (!matches || matches.length === 0) {
      return { data: [] };
    }

    return {
      data: matches.map((m) => ({
        id: m.id,
        name: `${m.firstName} ${m.lastName}`,
        role: `${m.jobTitle ?? m.headline} @ ${m.company ?? 'Company'}`,
        sessions: '0 sessions', // placeholder
        match: `${m.score > 0 ? m.score : 50}%`, // Ensure it shows a percentage, base 50 if no match for placeholder
        image: 'https://i.pravatar.cc/150?u=' + m.id,
      })),
    };
  }

  async apply(userId: string, dto: CreateMentorProfileDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        role: true,
        mentorProfile: { select: { id: true } },
      },
    });

    if (user?.role !== UserRole.MENTOR) {
      throw new ForbiddenException('A mentor role is required to create this profile.');
    }

    if (user.mentorProfile) {
      throw new ConflictException('Your mentor onboarding has already been completed.');
    }

    const profile = await this.prisma.mentorProfile.create({
      data: {
        userId,
        industry: dto.industry,
        experience: dto.experience,
        company: dto.company,
        jobTitle: dto.currentRole,
        location: dto.location,
        status: MentorStatus.PENDING_REVIEW,
      },
    });

    return {
      success: true,
      message: 'Application submitted successfully',
      profile,
    };
  }
}
