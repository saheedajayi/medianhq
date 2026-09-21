import {
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { MentorStatus, UserRole } from '@prisma/client';
import type { CreateMentorProfileDto } from './dto/create-mentor-profile.dto';
import type {
  ExploreMentorItem,
  ExploreMentorsQueryDto,
  PaginatedExploreMentorsResponse,
} from './dto/explore-mentors-query.dto';
import { MentorsRepository } from './mentors.repository';

@Injectable()
export class MentorsService {
  private readonly logger = new Logger(MentorsService.name);

  constructor(private readonly mentorsRepository: MentorsRepository) {}

  private mapCategory(industry?: string | null): 'Tech' | 'Finance' | 'Business' | 'Consulting' {
    if (!industry) return 'Business';
    const ind = industry.toLowerCase();
    if (
      ind.includes('tech') ||
      ind.includes('design') ||
      ind.includes('software') ||
      ind.includes('data') ||
      ind.includes('engineer') ||
      ind.includes('it')
    ) {
      return 'Tech';
    }
    if (
      ind.includes('finance') ||
      ind.includes('account') ||
      ind.includes('bank') ||
      ind.includes('invest') ||
      ind.includes('insurance')
    ) {
      return 'Finance';
    }
    if (ind.includes('consult')) {
      return 'Consulting';
    }
    return 'Business';
  }

  private formatPrice(pricePerSession: number, currency: string = 'NGN'): string {
    if (!pricePerSession || pricePerSession <= 0) {
      return 'Free';
    }
    const symbol = currency === 'USD' ? '$' : '₦';
    return `${symbol}${pricePerSession.toLocaleString()}`;
  }

  private getNextAvailability(mentorId: string) {
    // Deterministic offset based on ID hash for consistent display
    const charCodeSum = mentorId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const daysAhead = (charCodeSum % 5) + 1; // 1 to 5 days ahead
    const hour = 10 + (charCodeSum % 7); // 10 AM to 4 PM
    const timeStr = `${hour > 12 ? hour - 12 : hour}:00 ${hour >= 12 ? 'PM' : 'AM'}`;

    const date = new Date();
    date.setDate(date.getDate() + daysAhead);

    return {
      relative: daysAhead === 1 ? 'tomorrow' : `in ${daysAhead} days`,
      formattedDate: `${date.toLocaleDateString('en-US', {
        weekday: 'short',
        day: 'numeric',
        month: 'long',
      })} ${timeStr}`,
    };
  }

  private formatMentorItem(m: any, isFeatured = false): ExploreMentorItem {
    const bookings = m.user?.mentorBookings || [];
    const completedSessions = bookings.filter(
      (b: any) => b.status === 'COMPLETED' || b.session?.completedAt,
    ).length;

    const reviews = bookings.map((b: any) => b.review).filter(Boolean);
    const reviewCount = reviews.length;
    const avgRating =
      reviewCount > 0
        ? Number((reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / reviewCount).toFixed(1))
        : 4.8; // Default initial rating for approved mentors

    const tags: string[] = [];
    if (m.industry) tags.push(m.industry);
    if (m.jobTitle && !tags.includes(m.jobTitle)) tags.push(m.jobTitle);
    if (m.experience && !tags.includes(m.experience)) tags.push(m.experience);

    return {
      id: m.id,
      name: `${m.user?.firstName ?? ''} ${m.user?.lastName ?? ''}`.trim() || 'Mentor',
      role: m.jobTitle || m.headline || 'Mentor',
      company: m.company || 'Independent',
      location: m.location || 'Remote',
      sessionCount: completedSessions,
      rating: avgRating,
      reviewCount,
      bio: m.bio || m.headline || '',
      category: this.mapCategory(m.industry),
      tags,
      avatarUrl: `https://i.pravatar.cc/150?u=${m.id}`,
      isFeatured,
      nextAvailability: this.getNextAvailability(m.id),
      price: this.formatPrice(m.pricePerSession, m.currency),
      pricePerSession: m.pricePerSession || 0,
      currency: m.currency || 'NGN',
    };
  }

  async explore(query: ExploreMentorsQueryDto): Promise<PaginatedExploreMentorsResponse> {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(query.limit) || 12));
    const skip = (page - 1) * limit;

    const where = this.mentorsRepository.buildExploreWhereClause({
      search: query.search,
      category: query.category,
      priceType: query.priceType,
      location: query.location,
    });

    const [rawMentors, totalCount] = await Promise.all([
      this.mentorsRepository.findExploreMentors({
        where,
        sortBy: query.sortBy,
        skip,
        take: limit,
      }),
      this.mentorsRepository.countExploreMentors(where),
    ]);

    let formatted = rawMentors.map((m: any, index: number) =>
      this.formatMentorItem(m, index < 2),
    );

    // Filter by minRating if requested
    if (query.minRating !== undefined && query.minRating !== '') {
      const minR = Number(query.minRating);
      if (!isNaN(minR)) {
        formatted = formatted.filter((m) => m.rating >= minR);
      }
    }

    // Secondary in-memory sort if sortBy === 'rating'
    if (query.sortBy === 'rating') {
      formatted.sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount);
    }

    return {
      data: formatted,
      pagination: {
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit) || 1,
      },
    };
  }

  async getFeatured(limit = 6): Promise<ExploreMentorItem[]> {
    const featured = await this.mentorsRepository.findFeaturedMentors(limit);
    return featured.map((m: any) => this.formatMentorItem(m, true));
  }

  async getMentorProfile(id: string) {
    const mentor = await this.mentorsRepository.findMentorById(id);
    if (!mentor) {
      throw new NotFoundException(`Mentor with ID '${id}' not found`);
    }

    const item = this.formatMentorItem(mentor, false);

    // Format all review details for the profile page
    const bookings = mentor.user?.mentorBookings || [];
    const reviews = bookings
      .map((b: any) => b.review)
      .filter(Boolean)
      .map((r: any) => ({
        id: r.id,
        rating: r.rating,
        comment: r.comment,
        authorName: r.author ? `${r.author.firstName} ${r.author.lastName}`.trim() : 'Anonymous',
        authorAvatar: `https://i.pravatar.cc/150?u=${r.author?.id || r.id}`,
        createdAt: r.createdAt,
      }));

    return {
      ...item,
      experience: mentor.experience,
      linkedinUrl: mentor.linkedinUrl,
      reviews,
    };
  }

  async getMatches(userId: string) {
    const menteeProfile = await this.mentorsRepository.findMenteeProfileByUserId(userId);

    const menteeIndustry = menteeProfile?.industry ?? '';
    const menteeRole = menteeProfile?.currentRole ?? '';

    const matches = await this.mentorsRepository.findApprovedMatches(
      menteeIndustry,
      menteeRole,
    );

    if (!matches || matches.length === 0) {
      return { data: [] };
    }

    return {
      data: matches.map((m) => ({
        id: m.id,
        name: `${m.firstName} ${m.lastName}`,
        role: `${m.jobTitle ?? m.headline} @ ${m.company ?? 'Company'}`,
        sessions: '0 sessions',
        match: `${m.score > 0 ? m.score : 50}%`,
        image: 'https://i.pravatar.cc/150?u=' + m.id,
      })),
    };
  }

  async apply(userId: string, dto: CreateMentorProfileDto) {
    const user = await this.mentorsRepository.findUserForOnboarding(userId);

    if (!user?.emailVerifiedAt) {
      throw new ForbiddenException(
        'Verify your email before starting onboarding.',
      );
    }

    if (user.menteeProfile) {
      throw new ForbiddenException(
        'Your account is currently registered as a Mentee.',
      );
    }

    if (user.mentorProfile && user.mentorProfile.status === MentorStatus.APPROVED) {
      throw new ConflictException(
        'Your mentor application has already been approved.',
      );
    }

    try {
      const profile = await this.mentorsRepository.upsertProfileByUserId(
        userId,
        dto,
      );

      return {
        success: true,
        message: 'Application submitted successfully',
        profile,
      };
    } catch (error) {
      this.logger.error(`Failed to apply for mentor profile (userId: ${userId})`, error);
      throw error;
    }
  }
}
