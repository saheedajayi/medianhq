import { Injectable } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  roles() {
    return Object.values(UserRole);
  }

  async updateRole(userId: string, role: UserRole) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { role },
    });

    return {
      success: true,
      message: 'Role updated successfully',
      role: user.role,
    };
  }
}
