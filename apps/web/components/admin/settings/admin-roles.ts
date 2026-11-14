import { downloadCsv } from "@/lib/csv";

export interface AdminRole {
  /** The singular name, as on the role card and in the Add Admin form */
  name: string;
  /** The plural name, as in the roles table */
  groupName: string;
  accessLevel: string;
  /** The access level's colour on the cards and in the table */
  color: string;
  summary: string;
  permissions: string[];
}

/**
 * The admin roles the platform is designed around. They are descriptions only
 * for now: every admin account has full access until roles are enforced.
 */
export const ADMIN_ROLES: AdminRole[] = [
  {
    name: "Super Admin",
    groupName: "Super Admins",
    accessLevel: "Full Access",
    color: "#FF7A45",
    summary: "Complete access to all features and settings",
    permissions: ["All modules", "System settings", "Role management", "Financial data"],
  },
  {
    name: "Operations Admin",
    groupName: "Operations Admins",
    accessLevel: "Operational",
    color: "#8C5A52",
    summary: "Manage operations and user activities",
    permissions: ["User management", "Sessions log", "Dispute resolution", "Moderation access"],
  },
  {
    name: "Moderation Admin",
    groupName: "Moderation Admins",
    accessLevel: "Content Only",
    color: "#FDB022",
    summary: "Handle content and community safety",
    permissions: ["Content moderation queue", "Keyword blocklist", "User warnings"],
  },
  {
    name: "Finance Admin",
    groupName: "Finance Admins",
    accessLevel: "Finance Only",
    color: "#4A0A05",
    summary: "Access financial data and reports",
    permissions: ["Revenue reports", "Payout management", "Refund processing", "CSV export"],
  },
  {
    name: "Support Agent",
    groupName: "Support Agent",
    accessLevel: "Read + Limited",
    color: "#F04438",
    summary: "View information and raise escalates",
    permissions: ["View user profiles", "Session logs", "Submit escalations to Ops Admin"],
  },
];

export function exportAdminRoles() {
  downloadCsv("median-admin-roles.csv", [
    ["Role", "Access level", "Key permissions", "Status"],
    ...ADMIN_ROLES.map((role) => [role.groupName, role.accessLevel, role.permissions.join("; "), "Active"]),
  ]);
}
