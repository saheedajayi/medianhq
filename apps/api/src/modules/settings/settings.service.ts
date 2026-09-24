import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import type { AuthUser } from '../auth/dto/auth.dto';

export type UpdateSettingsDto = {
  emailNotifications?: boolean;
  marketingEmails?: boolean;
  timezone?: string;
};

@Injectable()
export class SettingsService {
  constructor(private readonly prisma: PrismaService) {}

  async getMySettings(user: AuthUser) {
    const settings = await this.prisma.userSettings.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        emailNotifications: true,
        marketingEmails: false,
        timezone: 'Africa/Lagos',
      },
      update: {},
    });

    const userDetails = await this.prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        mentorProfile: true,
        menteeProfile: true,
      },
    });

    return {
      settings,
      profile: userDetails,
    };
  }

  async updateMySettings(user: AuthUser, dto: UpdateSettingsDto) {
    const updated = await this.prisma.userSettings.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        emailNotifications: dto.emailNotifications ?? true,
        marketingEmails: dto.marketingEmails ?? false,
        timezone: dto.timezone ?? 'Africa/Lagos',
      },
      update: {
        ...(dto.emailNotifications !== undefined && { emailNotifications: dto.emailNotifications }),
        ...(dto.marketingEmails !== undefined && { marketingEmails: dto.marketingEmails }),
        ...(dto.timezone !== undefined && { timezone: dto.timezone }),
      },
    });

    return {
      success: true,
      settings: updated,
    };
  }
}
