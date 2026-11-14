"use client";

import type { AdminRole, AdminSection } from "@/services/auth/types";
import { useCurrentUser } from "@/services/auth/queries/auth.queries";

export const ADMIN_ROLE_NAMES: Record<AdminRole, string> = {
  SUPER_ADMIN: "Super Admin",
  OPERATIONS_ADMIN: "Operations Admin",
  MODERATION_ADMIN: "Moderation Admin",
  FINANCE_ADMIN: "Finance Admin",
  SUPPORT_AGENT: "Support Agent",
};

// The admin section each page belongs to, longest prefix first
const SECTION_PATHS: [prefix: string, section: AdminSection][] = [
  ["/admin/users", "users"],
  ["/admin/applications", "applications"],
  ["/admin/sessions", "sessions"],
  ["/admin/bookings", "sessions"],
  ["/admin/moderation", "moderation"],
  ["/admin/finance", "finance"],
  ["/admin/analytics", "analytics"],
  ["/admin/settings", "settings"],
  ["/admin", "overview"],
];

export const sectionForPath = (pathname: string) =>
  SECTION_PATHS.find(([prefix]) => pathname === prefix || pathname.startsWith(`${prefix}/`))?.[1] ?? "overview";

/**
 * What the signed-in admin may do. The API enforces the same rules, so this
 * only decides what to show; until the user has loaded, nothing is allowed.
 */
export function useAdminAccess() {
  const { data: user } = useCurrentUser();
  const access = user?.adminAccess ?? {};

  return {
    adminRole: user?.adminRole ?? null,
    canRead: (section: AdminSection) => !!access[section],
    canWrite: (section: AdminSection) => access[section] === "write",
  };
}
