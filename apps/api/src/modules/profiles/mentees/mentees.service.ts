import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import type { CreateMenteeProfileDto } from './dto/create-mentee-profile.dto';
import { MenteesRepository } from './mentees.repository';
import { ContentScannerService } from '../../platform/moderation/content-scanner.service';

@Injectable()
export class MenteesService {
  constructor(
    private readonly menteesRepository: MenteesRepository,
    private readonly contentScanner: ContentScannerService,
  ) {}

  async createProfile(userId: string, dto: CreateMenteeProfileDto) {
    const user = await this.menteesRepository.findUserForOnboarding(userId);

    if (user?.role === UserRole.MENTOR) {
      throw new ForbiddenException(
        'A mentee profile cannot be created for a mentor user.',
      );
    }

    if (dto.bio) {
      this.contentScanner.scan({
        contentType: 'PROFILE_TEXT',
        contentId: userId,
        contentField: 'Bio',
        content: dto.bio,
        authorId: userId,
      });
    }

    const payload = {
      ...(dto.gender && { gender: dto.gender }),
      ...(dto.location && { location: dto.location }),
      ...(dto.bio && { bio: dto.bio }),
      ...(dto.avatarUrl && { avatarUrl: dto.avatarUrl }),
      ...(dto.goals && { goals: dto.goals }),
      ...(dto.goalDescription && { goalDescription: dto.goalDescription }),
      ...(dto.currentRole && { currentRole: dto.currentRole }),
      ...(dto.industry && { industry: dto.industry }),
      ...(dto.timeframe && { timeframe: dto.timeframe }),
    };

    if (user?.menteeProfile) {
      const profile = await this.menteesRepository.updateProfileByUserId(
        userId,
        payload,
      );

      return {
        success: true,
        message: 'Mentee profile updated successfully',
        profile,
      };
    }

    const profile = await this.menteesRepository.createProfile({
      user: { connect: { id: userId } },
      ...payload,
      goals: dto.goals || [],
    });

    return {
      success: true,
      message: 'Mentee profile saved successfully',
      profile,
    };
  }

  /**
   * A mentee's profile as a mentor sees it. Only the mentee themself and
   * mentors they have booked may load it.
   */
  async getProfile(
    viewer: { id: string; role: UserRole | null },
    menteeUserId: string,
  ) {
    if (viewer.id !== menteeUserId) {
      const allowed =
        viewer.role === UserRole.MENTOR &&
        (await this.menteesRepository.hasSharedBooking(
          viewer.id,
          menteeUserId,
        ));
      if (!allowed) {
        throw new ForbiddenException(
          'You can only view mentees who have booked a session with you.',
        );
      }
    }

    const [mentee, sessionCount] = await Promise.all([
      this.menteesRepository.findMenteeForProfile(menteeUserId),
      this.menteesRepository.countCompletedSessions(menteeUserId),
    ]);
    if (!mentee) {
      throw new NotFoundException('Mentee not found');
    }

    const profile = mentee.menteeProfile;
    const reviews = mentee.menteeBookings
      .map((booking) => booking.feedback)
      .filter((feedback) => feedback !== null)
      .map((feedback) => ({
        id: feedback.id,
        rating: feedback.rating,
        comment: feedback.comment,
        authorName:
          `${feedback.author.firstName} ${feedback.author.lastName}`.trim(),
        authorAvatar: feedback.author.mentorProfile?.avatarUrl ?? '',
        createdAt: feedback.createdAt,
      }));
    const rating =
      reviews.length > 0
        ? Math.round(
            (reviews.reduce((sum, review) => sum + review.rating, 0) /
              reviews.length) *
              10,
          ) / 10
        : 0;

    return {
      id: mentee.id,
      name: `${mentee.firstName} ${mentee.lastName}`.trim(),
      avatarUrl: profile?.avatarUrl ?? null,
      role: profile?.currentRole ?? null,
      // Where they work now, if they have added it in Settings
      company:
        mentee.workExperiences.find((entry) => entry.isCurrent)?.company ??
        null,
      location: profile?.location ?? null,
      bio: profile?.bio ?? null,
      // The skills they listed against their roles, each once
      expertise: [
        ...new Set(mentee.workExperiences.flatMap((entry) => entry.skills)),
      ],
      sessionCount,
      rating,
      reviewCount: reviews.length,
      workExperiences: mentee.workExperiences,
      socialLinks: mentee.socialLinks,
      reviews,
    };
  }
}
