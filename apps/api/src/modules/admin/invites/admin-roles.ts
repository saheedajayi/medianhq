import { AdminRole } from '@prisma/client';

export const ADMIN_ROLES = Object.values(AdminRole);

export const ADMIN_ROLE_LABELS: Record<AdminRole, string> = {
  SUPER_ADMIN: 'Super Admin',
  OPERATIONS_ADMIN: 'Operations Admin',
  MODERATION_ADMIN: 'Moderation Admin',
  FINANCE_ADMIN: 'Finance Admin',
  SUPPORT_AGENT: 'Support Agent',
};
