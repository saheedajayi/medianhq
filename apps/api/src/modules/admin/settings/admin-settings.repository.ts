import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { ADMIN_ACCOUNT_ACTIONS } from '../../identity/auth/security-audit.service';

@Injectable()
export class AdminSettingsRepository {
  constructor(private readonly prisma: PrismaService) {}

  /** What admins have done to accounts and applications, newest first */
  findAdminActions(take: number) {
    return this.prisma.securityAuditLog.findMany({
      where: { action: { in: [...ADMIN_ACCOUNT_ACTIONS] } },
      select: {
        id: true,
        action: true,
        metadata: true,
        createdAt: true,
        user: { select: { firstName: true, lastName: true } },
      },
      orderBy: { createdAt: 'desc' },
      take,
    });
  }

  findUserNames(userIds: string[]) {
    return this.prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, firstName: true, lastName: true },
    });
  }
}
