"use client";

import { useQuery } from "@tanstack/react-query";

import type { ApiError } from "@/services/api-client";
import { adminSettingsService, type AdminAuditEntry } from "@/services/admin/settings";
import { adminSettingsQueryKeys } from "./query-keys";

export const useAdminAuditLog = () => {
  return useQuery<AdminAuditEntry[], ApiError>({
    queryKey: adminSettingsQueryKeys.auditLog(),
    queryFn: async () => (await adminSettingsService.getAuditLog()).data,
  });
};
