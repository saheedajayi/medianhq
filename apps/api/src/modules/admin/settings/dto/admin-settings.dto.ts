import type { AdminRole } from '@prisma/client';

export interface UpdateAdminDto {
  adminRole?: string;
  /** False deactivates the admin, true reactivates them */
  isActive?: boolean;
}

export interface AdminAccountItem {
  id: string;
  name: string;
  email: string;
  adminRole: AdminRole;
  isActive: boolean;
  joinedAt: Date;
  lastActiveAt: Date | null;
}
