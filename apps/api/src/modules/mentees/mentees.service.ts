import {
  ConflictException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import type { CreateMenteeProfileDto } from './dto/create-mentee-profile.dto';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class MenteesService {
  constructor(private readonly prisma: PrismaService) {}

  async createProfile(userId: string, dto: CreateMenteeProfileDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        emailVerifiedAt: true,
        role: true,
        menteeProfile: { select: { id: true } },
      },
    });

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
      throw new ConflictException(
        'Your mentee onboarding has already been completed.',
      );
    }

    const profile = await this.prisma.menteeProfile.create({
      data: {
        userId,
        goals: dto.goals,
        goalDescription: dto.goalDescription,
        currentRole: dto.currentRole,
        industry: dto.industry,
        timeframe: dto.timeframe,
      },
    });

    return {
      success: true,
      message: 'Mentee profile saved successfully',
      profile,
    };
  }
}
