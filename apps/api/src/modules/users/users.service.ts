import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
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
      select: { emailVerifiedAt: true, role: true },
    });

    if (!user?.emailVerifiedAt) {
      throw new ForbiddenException(
        'Verify your email before selecting a role.',
      );
    }

    if (user.role) {
      throw new ConflictException(
        'Your account role has already been selected.',
      );
    }

    const result = await this.prisma.user.updateMany({
      where: { id: userId, role: null, emailVerifiedAt: { not: null } },
      data: { role },
    });

    if (result.count === 0) {
      throw new ConflictException(
        'Your account role has already been selected.',
      );
    }

    return {
      success: true,
      message: 'Role updated successfully',
      role,
    };
  }
}
