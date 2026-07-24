import { Injectable } from '@nestjs/common';
import type { CreateMenteeProfileDto } from './dto/create-mentee-profile.dto';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class MenteesService {
  constructor(private readonly prisma: PrismaService) {}

  async createProfile(userId: string, dto: CreateMenteeProfileDto) {
    const profile = await this.prisma.menteeProfile.upsert({
      where: { userId },
      create: {
        userId,
        goals: dto.goals,
        goalDescription: dto.goalDescription,
        currentRole: dto.currentRole,
        industry: dto.industry,
        timeframe: dto.timeframe,
      },
      update: {
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
