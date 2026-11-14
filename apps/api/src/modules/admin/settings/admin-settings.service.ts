import { Injectable } from '@nestjs/common';
import { fullName } from '../common/admin-actor';
import { AdminSettingsRepository } from './admin-settings.repository';

const AUDIT_LOG_LIMIT = 50;

@Injectable()
export class AdminSettingsService {
  constructor(private readonly settingsRepository: AdminSettingsRepository) {}

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
