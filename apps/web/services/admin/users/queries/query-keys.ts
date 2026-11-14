import type { AdminUsersFilters } from "@/services/admin/users";

export const adminUsersQueryKeys = {
  all: ["admin", "users"] as const,
  list: (filters: AdminUsersFilters, page: number) => [...adminUsersQueryKeys.all, "list", filters, page] as const,
  detail: (userId: string) => [...adminUsersQueryKeys.all, "detail", userId] as const,
};
