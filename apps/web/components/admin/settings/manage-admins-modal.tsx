"use client";

import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/base/select";
import type { AdminRole as AdminRoleValue } from "@/services/auth/types";
import { useCurrentUser } from "@/services/auth/queries/auth.queries";
import {
  useAdminAccounts,
  useUpdateAdmin,
} from "@/services/admin/settings/queries/settings.queries";
import { cn } from "@/lib/utils";
import { AdminModal } from "../shared/admin-modal";
import { ADMIN_ROLES } from "./admin-roles";

const toggleClass =
  "shrink-0 rounded border px-2 py-1.5 text-xs transition-colors disabled:opacity-50";

interface ManageAdminsModalProps {
  onClose: () => void;
}

/** Every admin, with their type and whether they can still sign in */
export function ManageAdminsModal({ onClose }: ManageAdminsModalProps) {
  const { data: currentUser } = useCurrentUser();
  const { data: admins, isLoading } = useAdminAccounts();
  const updateAdmin = useUpdateAdmin();

  const handleUpdate = (
    adminId: string,
    change: { adminRole?: AdminRoleValue; isActive?: boolean },
    message: string,
  ) =>
    updateAdmin.mutate(
      { adminId, ...change },
      {
        onSuccess: () => toast.success(message),
        onError: (error) =>
          toast.error(error.message || "We couldn't update that admin."),
      },
    );

  return (
    <AdminModal
      isOpen
      onClose={onClose}
      title="Manage Roles"
      description="Change what each admin can do, or deactivate an admin to sign them out and stop them signing in."
    >
      <ul className="max-h-96 divide-y divide-[#EAECF0] overflow-y-auto rounded-xl border border-[#EAECF0]">
        {isLoading && (
          <li className="px-3.5 py-3 text-sm text-[#667085]">Loading...</li>
        )}
        {admins?.map((admin) => {
          const isYou = admin.id === currentUser?.id;
          return (
            <li
              key={admin.id}
              className="flex flex-wrap items-center gap-3 px-3.5 py-3"
            >
              <div className="min-w-0 flex-1">
                <p
                  className={cn(
                    "truncate text-sm font-medium",
                    admin.isActive ? "text-[#101828]" : "text-[#98A2B3]",
                  )}
                >
                  {admin.name}
                  {isYou && " (you)"}
                </p>
                <p className="truncate text-xs text-[#667085]">{admin.email}</p>
              </div>
              <Select
                value={admin.adminRole}
                disabled={isYou || !admin.isActive || updateAdmin.isPending}
                onValueChange={(value) =>
                  handleUpdate(
                    admin.id,
                    { adminRole: value as AdminRoleValue },
                    `${admin.name}'s admin type changed.`,
                  )
                }
              >
                <SelectTrigger className="h-9 w-40 rounded-lg text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ADMIN_ROLES.map((role) => (
                    <SelectItem key={role.value} value={role.value}>
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <button
                type="button"
                disabled={isYou || updateAdmin.isPending}
                onClick={() =>
                  handleUpdate(
                    admin.id,
                    { isActive: !admin.isActive },
                    admin.isActive
                      ? `${admin.name} was deactivated.`
                      : `${admin.name} was reactivated.`,
                  )
                }
                className={cn(
                  toggleClass,
                  admin.isActive
                    ? "border-[#FDA29B] text-[#B42318] hover:bg-[#FEF3F2]"
                    : "border-[#101828] text-[#101828] hover:bg-[#F9FAFB]",
                )}
              >
                {admin.isActive ? "Deactivate" : "Reactivate"}
              </button>
            </li>
          );
        })}
      </ul>
    </AdminModal>
  );
}
