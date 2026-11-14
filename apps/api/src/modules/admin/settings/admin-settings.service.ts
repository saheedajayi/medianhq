import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AdminRole } from '@prisma/client';
import { SecurityAuditService } from '../../identity/auth/security-audit.service';
import { fullName, oneOf, type AdminActor } from '../common/admin-actor';
import type {
  AdminAccountItem,
  UpdateAdminDto,
} from './dto/admin-settings.dto';
import { AdminSettingsRepository } from './admin-settings.repository';

const AUDIT_LOG_LIMIT = 50;

@Injectable()
export class AdminSettingsService {
  constructor(
    private readonly settingsRepository: AdminSettingsRepository,
    private readonly securityAudit: SecurityAuditService,
  ) {}

  async listAdmins(): Promise<AdminAccountItem[]> {
    const admins = await this.settingsRepository.findAdmins();
    return admins.map((admin) => ({
      id: admin.id,
      name: fullName(admin),
      email: admin.email,
      adminRole: admin.adminRole ?? AdminRole.SUPER_ADMIN,
      isActive: !admin.suspendedAt,
      joinedAt: admin.createdAt,
      lastActiveAt: admin.deviceSessions[0]?.lastActiveAt ?? null,
    }));
  }

  /**
   * Changes an admin's type or deactivates them. Admins can't change
   * themselves, and the platform always keeps at least one active super admin.
   */
  async updateAdmin(adminId: string, dto: UpdateAdminDto, actor?: AdminActor) {
    if (actor && actor.id === adminId) {
      throw new BadRequestException("You can't change your own admin access.");
    }
    const admin = await this.settingsRepository.findAdmin(adminId);
    if (!admin) throw new NotFoundException('Admin not found.');

    const adminRole =
      dto.adminRole === undefined
        ? undefined
        : oneOf(dto.adminRole, Object.values(AdminRole));
    if (dto.adminRole !== undefined && !adminRole) {
      throw new BadRequestException('Choose an admin type.');
    }
    const isSuper =
      (admin.adminRole ?? AdminRole.SUPER_ADMIN) === AdminRole.SUPER_ADMIN;
    const losesSuper =
      isSuper &&
      !admin.suspendedAt &&
      ((adminRole && adminRole !== AdminRole.SUPER_ADMIN) ||
        dto.isActive === false);
    if (
      losesSuper &&
      (await this.settingsRepository.countActiveSuperAdmins()) <= 1
    ) {
      throw new BadRequestException(
        'Median needs at least one active super admin.',
      );
    }

    if (adminRole) {
      await this.settingsRepository.updateAdminRole(adminId, adminRole);
    }
    if (typeof dto.isActive === 'boolean') {
      await this.settingsRepository.setAdminActive(adminId, dto.isActive);
    }

    await this.securityAudit.record({
      userId: adminId,
      email: admin.email,
      action: 'ADMIN_ACCESS_CHANGED',
      status: 'SUCCESS',
      metadata: {
        adminId: actor?.id ?? null,
        adminName: actor ? fullName(actor) : null,
        detail: [
          adminRole && `Type: ${adminRole}`,
          dto.isActive === false && 'Deactivated',
          dto.isActive === true && 'Reactivated',
        ]
          .filter(Boolean)
          .join(' · '),
      },
    });
    return (await this.listAdmins()).find((item) => item.id === adminId);
  }

  async getAuditLog() {
    const entries =
      await this.settingsRepository.findAdminActions(AUDIT_LOG_LIMIT);

    const read = (entry: (typeof entries)[number]) => {
      const metadata =
        entry.metadata &&
        typeof entry.metadata === 'object' &&
        !Array.isArray(entry.metadata)
          ? entry.metadata
          : {};
      const text = (value: unknown) =>
        typeof value === 'string' ? value : null;
      return {
        adminId: text(metadata.adminId),
        adminName: text(metadata.adminName),
        detail: text(metadata.detail) ?? text(metadata.reason),
      };
    };

    // Older entries recorded only the admin's ID, so their names are looked up
    const adminIds = entries
      .map((entry) => read(entry))
      .filter((entry) => entry.adminId && !entry.adminName)
      .map((entry) => entry.adminId as string);
    const admins = await this.settingsRepository.findUserNames([
      ...new Set(adminIds),
    ]);
    const nameOf = new Map(admins.map((admin) => [admin.id, fullName(admin)]));

    return entries.map((entry) => {
      const { adminId, adminName, detail } = read(entry);
      return {
        id: entry.id,
        at: entry.createdAt,
        // The backoffice key has no admin account behind it
        adminName:
          adminName ?? (adminId && nameOf.get(adminId)) ?? 'Backoffice',
        action: this.describeAction(entry.action),
        details: [entry.user && fullName(entry.user), detail]
          .filter(Boolean)
          .join(' · '),
      };
    });
  }

  /** ACCOUNT_SUSPENDED becomes "Account suspended" */
  private describeAction(action: string) {
    const words = action.toLowerCase().replace(/_/g, ' ');
    return words.charAt(0).toUpperCase() + words.slice(1);
  }
}
