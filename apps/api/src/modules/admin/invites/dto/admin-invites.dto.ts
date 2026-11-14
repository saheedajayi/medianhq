import type { AdminRole } from '@prisma/client';

export type AdminInviteStatus = 'PENDING' | 'EXPIRED';

export interface CreateAdminInviteDto {
  email?: string;
  role?: string;
}

export interface AcceptAdminInviteDto {
  firstName?: string;
  lastName?: string;
  password?: string;
}

export interface AdminInviteItem {
  id: string;
  email: string;
  role: AdminRole;
  status: AdminInviteStatus;
  invitedBy: string | null;
  sentAt: Date;
  expiresAt: Date;
}
