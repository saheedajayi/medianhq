import type { AdminRoleValue } from "@/services/admin/invites";
import { downloadCsv } from "@/lib/csv";
import { ADMIN_ROLE_NAMES } from "../shared/admin-access";

export interface AdminRole {
  value: AdminRoleValue;
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
 * The admin roles the platform is designed around. Each admin is given one
 * when invited, and the API limits them to the sections it allows.
 */
export const ADMIN_ROLES: AdminRole[] = [
  {
    value: "SUPER_ADMIN",
    name: "Super Admin",
    groupName: "Super Admins",
    accessLevel: "Full Access",
    color: "#FF7A45",
    summary: "Complete access to all features and settings",
    permissions: [
      "All modules",
      "System settings",
      "Role management",
      "Financial data",
    ],
  },
  {
    value: "OPERATIONS_ADMIN",
    name: "Operations Admin",
    groupName: "Operations Admins",
    accessLevel: "Operational",
    color: "#8C5A52",
    summary: "Manage operations and user activities",
    permissions: [
      "User management",
      "Sessions log",
      "Dispute resolution",
      "Moderation access",
    ],
  },
  {
    value: "MODERATION_ADMIN",
    name: "Moderation Admin",
    groupName: "Moderation Admins",
    accessLevel: "Content Only",
    color: "#FDB022",
    summary: "Handle content and community safety",
    permissions: [
      "Content moderation queue",
      "Keyword blocklist",
      "User warnings",
    ],
  },
  {
    value: "FINANCE_ADMIN",
    name: "Finance Admin",
    groupName: "Finance Admins",
    accessLevel: "Finance Only",
    color: "#4A0A05",
    summary: "Access financial data and reports",
    permissions: [
      "Revenue reports",
      "Payout management",
      "Refund processing",
      "CSV export",
    ],
  },
  {
    value: "SUPPORT_AGENT",
    name: "Support Agent",
    groupName: "Support Agent",
    accessLevel: "Read + Limited",
    color: "#F04438",
    summary: "View information and raise escalates",
    permissions: [
      "View user profiles",
      "Session logs",
      "Submit escalations to Ops Admin",
    ],
  },
];

export function exportAdminRoles() {
  downloadCsv("median-admin-roles.csv", [
    ["Role", "Access level", "Key permissions", "Status"],
    ...ADMIN_ROLES.map((role) => [
      role.groupName,
      role.accessLevel,
      role.permissions.join("; "),
      "Active",
    ]),
  ]);
}

/** "Operations Admin" for OPERATIONS_ADMIN */
export const adminRoleName = (value: AdminRoleValue) => ADMIN_ROLE_NAMES[value];
