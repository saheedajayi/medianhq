import {
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import type { CreateMenteeProfileDto } from './dto/create-mentee-profile.dto';
import { MenteesRepository } from './mentees.repository';

@Injectable()
export class MenteesService {
  constructor(private readonly menteesRepository: MenteesRepository) {}

  async createProfile(userId: string, dto: CreateMenteeProfileDto) {
    const user = await this.menteesRepository.findUserForOnboarding(userId);

    if (!user?.emailVerifiedAt) {
      throw new ForbiddenException(
        'Verify your email before starting onboarding.',
      );
    }

    if (user?.role !== UserRole.MENTEE) {
      throw new ForbiddenException(
        'A mentee role is required to create this profile.',
      );
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

    if (user.menteeProfile) {
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
}
