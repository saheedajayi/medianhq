export const adminSettingsQueryKeys = {
  all: ["admin", "settings"] as const,
  admins: () => [...adminSettingsQueryKeys.all, "admins"] as const,
  auditLog: () => [...adminSettingsQueryKeys.all, "audit-log"] as const,
};
