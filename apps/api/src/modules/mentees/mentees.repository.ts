import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class MenteesRepository {
  constructor(private readonly prisma: PrismaService) {}

  findUserForOnboarding(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        emailVerifiedAt: true,
        role: true,
        menteeProfile: { select: { id: true } },
      },
    });
  }

  createProfile(data: Prisma.MenteeProfileCreateInput) {
    return this.prisma.menteeProfile.create({
      data,
    });
  }

  updateProfileByUserId(userId: string, data: Prisma.MenteeProfileUpdateInput) {
    return this.prisma.menteeProfile.update({
      where: { userId },
      data,
    });
  }
}
