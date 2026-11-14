import { apiClient } from "@/services/api-client";
import type { AdminAccount, AdminAuditEntry, UpdateAdminPayload } from "./types";

const SETTINGS_PATH = "/admin/settings";

export const adminSettingsService = {
  getAdmins() {
    return apiClient.get<AdminAccount[]>(`${SETTINGS_PATH}/admins`);
  },
  updateAdmin(adminId: string, payload: UpdateAdminPayload) {
    return apiClient.patch<AdminAccount>(`${SETTINGS_PATH}/admins/${encodeURIComponent(adminId)}`, payload);
  },
  getAuditLog() {
    return apiClient.get<AdminAuditEntry[]>(`${SETTINGS_PATH}/audit-log`);
  },
};

export type { AdminAccount, AdminAuditEntry, UpdateAdminPayload } from "./types";
