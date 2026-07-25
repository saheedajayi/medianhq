import { ConflictException, Injectable } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  roles() {
    return Object.values(UserRole);
  }

  async updateRole(userId: string, role: UserRole) {
    const result = await this.prisma.user.updateMany({
      where: { id: userId, role: null },
      data: { role },
    });

    if (result.count === 0) {
      throw new ConflictException('Your account role has already been selected.');
    }

    return {
      success: true,
      message: 'Role updated successfully',
      role,
    };
  }
}
