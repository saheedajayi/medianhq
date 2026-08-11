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

    if (user.menteeProfile) {
      const profile = await this.menteesRepository.updateProfileByUserId(userId, {
        goals: dto.goals,
        goalDescription: dto.goalDescription,
        currentRole: dto.currentRole,
        industry: dto.industry,
        timeframe: dto.timeframe,
      });

      return {
        success: true,
        message: 'Mentee profile updated successfully',
        profile,
      };
    }

    const profile = await this.menteesRepository.createProfile({
      user: { connect: { id: userId } },
      goals: dto.goals,
      goalDescription: dto.goalDescription,
      currentRole: dto.currentRole,
      industry: dto.industry,
      timeframe: dto.timeframe,
    });

    return {
      success: true,
      message: 'Mentee profile saved successfully',
      profile,
    };
  }
}
