import { ForbiddenException, Injectable } from '@nestjs/common';
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
}
