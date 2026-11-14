import type { AdminRole } from "@/services/auth/types";

export type AdminAccount = {
  id: string;
  name: string;
  email: string;
  adminRole: AdminRole;
  isActive: boolean;
  joinedAt: string;
  lastActiveAt: string | null;
};

export type UpdateAdminPayload = { adminRole?: AdminRole; isActive?: boolean };

export type AdminAuditEntry = {
  id: string;
  at: string;
  adminName: string;
  action: string;
  /** Who it was done to, and any reason given */
  details: string;
};
