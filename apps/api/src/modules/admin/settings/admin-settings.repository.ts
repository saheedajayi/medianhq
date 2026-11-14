import { Injectable } from '@nestjs/common';
import { AdminRole, UserRole } from '@prisma/client';
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

  findAdmins() {
    return this.prisma.user.findMany({
      where: { role: UserRole.ADMIN },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        adminRole: true,
        suspendedAt: true,
        createdAt: true,
        deviceSessions: {
          select: { lastActiveAt: true },
          orderBy: { lastActiveAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  findAdmin(adminId: string) {
    return this.prisma.user.findFirst({
      where: { id: adminId, role: UserRole.ADMIN },
      select: { id: true, email: true, adminRole: true, suspendedAt: true },
    });
  }

  /** Active super admins, counting those from before admin types, who have full access */
  countActiveSuperAdmins() {
    return this.prisma.user.count({
      where: {
        role: UserRole.ADMIN,
        suspendedAt: null,
        OR: [{ adminRole: AdminRole.SUPER_ADMIN }, { adminRole: null }],
      },
    });
  }

  updateAdminRole(adminId: string, adminRole: AdminRole) {
    return this.prisma.user.update({
      where: { id: adminId },
      data: { adminRole },
    });
  }

  /** Deactivating also signs the admin out everywhere */
  setAdminActive(adminId: string, isActive: boolean) {
    return this.prisma.user.update({
      where: { id: adminId },
      data: isActive
        ? { suspendedAt: null, suspensionReason: null }
        : {
            suspendedAt: new Date(),
            suspensionReason: 'Admin access removed',
            sessionVersion: { increment: 1 },
          },
    });
  }

  findUserNames(userIds: string[]) {
    return this.prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, firstName: true, lastName: true },
    });
  }
}
