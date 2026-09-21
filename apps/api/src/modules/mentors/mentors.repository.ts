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

  findMentorById(id: string) {
    return this.prisma.mentorProfile.findFirst({
      where: {
        OR: [{ id }, { userId: id }],
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            mentorBookings: {
              include: {
                review: {
                  include: {
                    author: {
                      select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                      },
                    },
                  },
                },
                session: true,
              },
            },
          },
        },
      },
    });
  }

  buildExploreWhereClause(params: {
    search?: string;
    category?: string;
    priceType?: 'all' | 'free' | 'paid';
    location?: string;
    approvedOnly?: boolean;
  }) {
    const where: any = {};

    if (params.approvedOnly !== false) {
      where.status = MentorStatus.APPROVED;
    }

    if (params.category && params.category !== 'All') {
      if (params.category.toLowerCase() === 'tech') {
        where.OR = [
          { industry: { contains: 'Tech', mode: 'insensitive' } },
          { industry: { contains: 'Design', mode: 'insensitive' } },
          { industry: { contains: 'Data', mode: 'insensitive' } },
        ];
      } else {
        where.industry = { contains: params.category, mode: 'insensitive' };
      }
    }

    if (params.priceType === 'free') {
      where.pricePerSession = 0;
    } else if (params.priceType === 'paid') {
      where.pricePerSession = { gt: 0 };
    }

    if (params.location && params.location.trim()) {
      where.location = { contains: params.location.trim(), mode: 'insensitive' };
    }

    if (params.search && params.search.trim()) {
      const q = params.search.trim();
      const searchConditions = [
        { user: { firstName: { contains: q, mode: 'insensitive' } } },
        { user: { lastName: { contains: q, mode: 'insensitive' } } },
        { company: { contains: q, mode: 'insensitive' } },
        { jobTitle: { contains: q, mode: 'insensitive' } },
        { headline: { contains: q, mode: 'insensitive' } },
        { bio: { contains: q, mode: 'insensitive' } },
        { industry: { contains: q, mode: 'insensitive' } },
      ];

      if (where.OR) {
        where.AND = [{ OR: where.OR }, { OR: searchConditions }];
        delete where.OR;
      } else {
        where.OR = searchConditions;
      }
    }

    return where;
  }

  findExploreMentors(params: {
    where: any;
    sortBy?: string;
    skip?: number;
    take?: number;
  }) {
    let orderBy: any = { createdAt: 'desc' };
    if (params.sortBy === 'name') {
      orderBy = { user: { firstName: 'asc' } };
    } else if (params.sortBy === 'sessions') {
      orderBy = { user: { mentorBookings: { _count: 'desc' } } };
    }

    return this.prisma.mentorProfile.findMany({
      where: params.where,
      orderBy,
      skip: params.skip,
      take: params.take,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            mentorBookings: {
              select: {
                id: true,
                status: true,
                review: {
                  select: {
                    id: true,
                    rating: true,
                    comment: true,
                  },
                },
                session: {
                  select: {
                    id: true,
                    completedAt: true,
                  },
                },
              },
            },
          },
        },
      },
    });
  }

  countExploreMentors(where: any) {
    return this.prisma.mentorProfile.count({ where });
  }

  findFeaturedMentors(limit = 6) {
    return this.prisma.mentorProfile.findMany({
      where: {
        status: MentorStatus.APPROVED,
      },
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            mentorBookings: {
              select: {
                id: true,
                status: true,
                review: {
                  select: {
                    id: true,
                    rating: true,
                  },
                },
                session: {
                  select: {
                    id: true,
                    completedAt: true,
                  },
                },
              },
            },
          },
        },
      },
    });
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
