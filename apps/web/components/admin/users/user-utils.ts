import type { AdminUserRole, AdminUserRow, AdminUserStatus } from "@/services/admin/users";
import { downloadCsv } from "@/lib/csv";

export const USER_STATUS: Record<AdminUserStatus, { label: string; className: string }> = {
  ACTIVE: { label: "Active", className: "bg-[#ECFDF3] text-[#067647]" },
  UNDER_REVIEW: { label: "Under review", className: "bg-[#FFFAEB] text-[#B54708]" },
  SUSPENDED: { label: "Suspended", className: "bg-[#FEF3F2] text-[#B42318]" },
  INACTIVE: { label: "Inactive", className: "bg-[#F2F4F7] text-[#344054]" },
};

export const USER_ROLE: Record<AdminUserRole, string> = { MENTOR: "Mentor", MENTEE: "Mentee" };

export function exportUsers(filename: string, users: AdminUserRow[]) {
  downloadCsv(filename, [
    ["User ID", "Name", "Email", "Role", "Status", "Country", "Joined", "Trust Score", "Last active"],
    ...users.map((user) => [
      user.id,
      user.name,
      user.email,
      USER_ROLE[user.role],
      USER_STATUS[user.status].label,
      user.country,
      user.joinedAt,
      user.trustScore,
      user.lastActiveAt,
    ]),
  ]);
}
