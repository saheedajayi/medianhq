import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import type { AuthUser } from '../auth/dto/auth.dto';

const DEFAULT_ACHIEVEMENTS = [
  {
    title: 'First Step',
    description: 'Completed profile onboarding and setup goals.',
    points: 10,
    badgeUrl: '/badges/first-step.svg',
  },
  {
    title: 'Explorer',
    description: 'Browsed and favorited 3 mentors.',
    points: 20,
    badgeUrl: '/badges/explorer.svg',
  },
  {
    title: 'Session Starter',
    description: 'Booked and attended your first 1:1 session.',
    points: 50,
    badgeUrl: '/badges/session-starter.svg',
  },
  {
    title: 'Feedback Master',
    description: 'Left a detailed review following a completed session.',
    points: 30,
    badgeUrl: '/badges/feedback-master.svg',
  },
];

@Injectable()
export class AchievementsService {
  constructor(private readonly prisma: PrismaService) {}

  async seedCatalog() {
    for (const item of DEFAULT_ACHIEVEMENTS) {
      const existing = await this.prisma.achievement.findFirst({
        where: { title: item.title },
      });
      if (!existing) {
        await this.prisma.achievement.create({ data: item });
      }
    }
  }

  async getCatalog() {
    await this.seedCatalog();
    return this.prisma.achievement.findMany({
      orderBy: { points: 'asc' },
    });
  }

  async getMyAchievements(user: AuthUser) {
    await this.seedCatalog();

    const [earned, all] = await Promise.all([
      this.prisma.userAchievement.findMany({
        where: { userId: user.id },
        include: { achievement: true },
      }),
      this.prisma.achievement.findMany(),
    ]);

    const earnedIds = new Set(earned.map((e) => e.achievementId));
    const totalPoints = earned.reduce((sum, e) => sum + e.achievement.points, 0);

    return {
      totalPoints,
      earnedCount: earned.length,
      totalCount: all.length,
      achievements: all.map((a) => ({
        ...a,
        isUnlocked: earnedIds.has(a.id),
        unlockedAt: earned.find((e) => e.achievementId === a.id)?.earnedAt || null,
      })),
    };
  }
}
