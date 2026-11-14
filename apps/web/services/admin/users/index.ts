import { apiClient } from "@/services/api-client";
import type { AdminUserDetail, AdminUserRow, AdminUsersFilters, AdminUsersPage } from "./types";

const USERS_PATH = "/admin/users";
const userPath = (userId: string) => `${USERS_PATH}/${encodeURIComponent(userId)}`;

export const adminUsersService = {
  getUsers(filters: AdminUsersFilters, page: number) {
    return apiClient.get<AdminUsersPage>(USERS_PATH, { params: { ...filters, page } });
  },
  /** Every user matching the filters, not just one page */
  exportUsers(filters: AdminUsersFilters) {
    return apiClient.get<AdminUserRow[]>(`${USERS_PATH}/export`, { params: filters });
  },
  getUser(userId: string) {
    return apiClient.get<AdminUserDetail>(userPath(userId));
  },
  suspendUser(userId: string, reason: string) {
    return apiClient.patch(`${userPath(userId)}/suspend`, { reason });
  },
  reinstateUser(userId: string) {
    return apiClient.patch(`${userPath(userId)}/reinstate`);
  },
  setUserFlag(userId: string, flagged: boolean) {
    return apiClient.patch(`${userPath(userId)}/flag`, { flagged });
  },
};

export type {
  AdminUserDetail,
  AdminUserNote,
  AdminUserRole,
  AdminUserRow,
  AdminUserSession,
  AdminUsersFilters,
  AdminUsersPage,
  AdminUserStatus,
} from "./types";
