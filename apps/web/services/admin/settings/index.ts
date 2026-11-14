import { apiClient } from "@/services/api-client";
import type { AdminAuditEntry } from "./types";

const SETTINGS_PATH = "/admin/settings";

export const adminSettingsService = {
  getAuditLog() {
    return apiClient.get<AdminAuditEntry[]>(`${SETTINGS_PATH}/audit-log`);
  },
};

export type { AdminAuditEntry } from "./types";
