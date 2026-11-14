import type { ModerationFlagsFilters } from "@/services/admin/moderation";

export const adminModerationQueryKeys = {
  all: ["admin", "moderation"] as const,
  flags: (filters: ModerationFlagsFilters, page: number) =>
    [...adminModerationQueryKeys.all, "flags", filters, page] as const,
  blocklist: () => [...adminModerationQueryKeys.all, "blocklist"] as const,
  history: (page: number) => [...adminModerationQueryKeys.all, "history", page] as const,
};
