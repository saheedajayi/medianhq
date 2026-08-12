import {
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
} from '@nestjs/common';
import { MentorStatus, UserRole } from '@prisma/client';
import type { CreateMentorProfileDto } from './dto/create-mentor-profile.dto';
import { MentorsRepository } from './mentors.repository';

@Injectable()
export class MentorsService {
  private readonly logger = new Logger(MentorsService.name);

  constructor(private readonly mentorsRepository: MentorsRepository) {}

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
