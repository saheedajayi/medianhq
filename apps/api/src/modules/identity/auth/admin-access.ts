import { AdminRole } from '@prisma/client';

/** Every admin account must use a Median address */
export const ADMIN_EMAIL_DOMAIN = 'medianhq.co';
export const ADMIN_EMAIL_MESSAGE = `Admins must use an @${ADMIN_EMAIL_DOMAIN} email address.`;

/** Only the exact domain counts; lookalikes such as medianhq.co.evil.com or sub.medianhq.co don't */
export const isAdminEmail = (email: string | null | undefined) =>
  !!email && email.trim().toLowerCase().endsWith(`@${ADMIN_EMAIL_DOMAIN}`);

export const ADMIN_SECTIONS = [
  'overview',
  'users',
  'applications',
  'sessions',
  'moderation',
  'finance',
  'analytics',
  'settings',
] as const;
export type AdminSection = (typeof ADMIN_SECTIONS)[number];

/** Read lets an admin open a section; write also lets them change things there */
export type AdminAccessLevel = 'read' | 'write';
export type AdminAccess = Partial<Record<AdminSection, AdminAccessLevel>>;

const FULL_ACCESS = Object.fromEntries(
  ADMIN_SECTIONS.map((section) => [section, 'write']),
) as Record<AdminSection, AdminAccessLevel>;

/**
 * What each admin type may do, following the roles table in the admin
 * settings design. Super admins can do everything, including managing admins.
 */
export const ADMIN_ACCESS: Record<AdminRole, AdminAccess> = {
  SUPER_ADMIN: FULL_ACCESS,
  // User management, sessions log, dispute resolution, moderation access
  OPERATIONS_ADMIN: {
    overview: 'read',
    users: 'write',
    applications: 'write',
    sessions: 'write',
    moderation: 'write',
    analytics: 'read',
  },
  // Content moderation queue, keyword blocklist, user warnings
  MODERATION_ADMIN: {
    overview: 'read',
    moderation: 'write',
  },
  // Revenue reports, payout management, refund processing, CSV export
  FINANCE_ADMIN: {
    overview: 'read',
    finance: 'write',
  },
  // View user profiles and session logs; escalations go to Ops
  SUPPORT_AGENT: {
    overview: 'read',
    users: 'read',
    sessions: 'read',
  },
};

/** An admin with no recorded type predates roles, so keeps full access */
export const adminAccessFor = (adminRole: AdminRole | null | undefined) =>
  ADMIN_ACCESS[adminRole ?? AdminRole.SUPER_ADMIN];

export function canAccessSection(
  adminRole: AdminRole | null | undefined,
  section: AdminSection,
  level: AdminAccessLevel,
) {
  const granted = adminAccessFor(adminRole)[section];
  return granted === 'write' || (granted === 'read' && level === 'read');
}
