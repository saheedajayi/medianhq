import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { MentorStatus, UserRole } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  roles() {
    return Object.values(UserRole);
  }

  async updateRole(userId: string, role: UserRole) {
    if (role !== UserRole.MENTEE && role !== UserRole.MENTOR) {
      throw new BadRequestException('Choose either the mentee or mentor role.');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        emailVerifiedAt: true,
        role: true,
        menteeProfile: true,
        mentorProfile: { select: { status: true } },
      },
    });

    if (!user?.emailVerifiedAt) {
      throw new ForbiddenException(
        'Verify your email before selecting a role.',
      );
    }

    if (user.role === role) {
      return {
        success: true,
        message: 'Role updated successfully',
        role,
      };
    }

    if (
      user.menteeProfile ||
      user.mentorProfile?.status === MentorStatus.APPROVED
    ) {
      throw new ConflictException(
        'Your account role has already been finalized.',
      );
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: { role },
    });

    return {
      success: true,
      message: 'Role updated successfully',
      role,
    };
  }
}
