export const adminSettingsQueryKeys = {
  all: ["admin", "settings"] as const,
  auditLog: () => [...adminSettingsQueryKeys.all, "audit-log"] as const,
};
