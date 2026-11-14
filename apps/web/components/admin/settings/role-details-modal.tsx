"use client";

import { useAdminAccounts } from "@/services/admin/settings/queries/settings.queries";
import { AdminModal } from "../shared/admin-modal";
import { formatDay } from "../shared/format";
import type { AdminRole } from "./admin-roles";

interface RoleDetailsModalProps {
  role: AdminRole;
  onClose: () => void;
}

/** What a role allows and who currently has it */
export function RoleDetailsModal({ role, onClose }: RoleDetailsModalProps) {
  const { data: admins, isLoading } = useAdminAccounts();
  const holders =
    admins?.filter((admin) => admin.adminRole === role.value) ?? [];

  return (
    <AdminModal
      isOpen
      onClose={onClose}
      title={role.groupName}
      description={`${role.accessLevel} · ${role.summary}`}
    >
      <div>
        <h3 className="text-sm font-semibold text-[#101828]">Permissions</h3>
        <ul className="mt-2 list-inside list-disc text-sm text-[#344054]">
          {role.permissions.map((permission) => (
            <li key={permission}>{permission}</li>
          ))}
        </ul>
      </div>
      <div>
        <h3 className="text-sm font-semibold text-[#101828]">
          Admins with this role
        </h3>
        {isLoading ? (
          <p className="mt-2 text-sm text-[#667085]">Loading...</p>
        ) : holders.length === 0 ? (
          <p className="mt-2 text-sm text-[#667085]">
            No one has this role yet.
          </p>
        ) : (
          <ul className="mt-2 divide-y divide-[#EAECF0] rounded-xl border border-[#EAECF0]">
            {holders.map((admin) => (
              <li
                key={admin.id}
                className="flex items-center justify-between gap-3 px-3.5 py-2.5 text-sm"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium text-[#101828]">
                    {admin.name}
                  </p>
                  <p className="truncate text-xs text-[#667085]">
                    {admin.email}
                  </p>
                </div>
                <span className="shrink-0 text-xs text-[#667085]">
                  {admin.isActive
                    ? `Joined ${formatDay(admin.joinedAt)}`
                    : "Deactivated"}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </AdminModal>
  );
}
