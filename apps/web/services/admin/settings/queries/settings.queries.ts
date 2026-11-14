"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { ApiError } from "@/services/api-client";
import {
  adminSettingsService,
  type AdminAccount,
  type AdminAuditEntry,
  type UpdateAdminPayload,
} from "@/services/admin/settings";
import { adminSettingsQueryKeys } from "./query-keys";

export const useAdminAuditLog = () => {
  return useQuery<AdminAuditEntry[], ApiError>({
    queryKey: adminSettingsQueryKeys.auditLog(),
    queryFn: async () => (await adminSettingsService.getAuditLog()).data,
  });
};

export const useAdminAccounts = (options?: { enabled?: boolean }) => {
  return useQuery<AdminAccount[], ApiError>({
    queryKey: adminSettingsQueryKeys.admins(),
    queryFn: async () => (await adminSettingsService.getAdmins()).data,
    enabled: options?.enabled,
  });
};

/** A change to an admin shows in the admins list and the audit log, so settings reloads */
export const useUpdateAdmin = () => {
  const queryClient = useQueryClient();
  return useMutation<AdminAccount, ApiError, { adminId: string } & UpdateAdminPayload>({
    mutationFn: async ({ adminId, ...payload }) => (await adminSettingsService.updateAdmin(adminId, payload)).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: adminSettingsQueryKeys.all }),
  });
};
