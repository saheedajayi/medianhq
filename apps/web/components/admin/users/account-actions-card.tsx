"use client";

import { useState } from "react";
import { toast } from "sonner";
import type { ApiError } from "@/services/api-client";
import type { AdminUserDetail } from "@/services/admin/users";
import { useReinstateUser, useSetUserFlag, useSuspendUser } from "@/services/admin/users/queries/users.queries";
import { cn } from "@/lib/utils";
import {
  badgeClass,
  cardClass,
  cardTitleClass,
  dangerPillClass,
  neutralPillClass,
  primaryPillClass,
} from "../shared/shared";
import { useAdminAccess } from "../shared/admin-access";
import { SuspendAccountModal } from "./suspend-account-modal";

const showError = (error: ApiError) => toast.error(error.message || "That didn't work. Please try again.");

interface AccountActionsCardProps {
  user: AdminUserDetail;
}

export function AccountActionsCard({ user }: AccountActionsCardProps) {
  const [isSuspendModalOpen, setIsSuspendModalOpen] = useState(false);
  const suspendUser = useSuspendUser(user.id);
  const reinstateUser = useReinstateUser(user.id);
  const setUserFlag = useSetUserFlag(user.id);

  const isSuspended = user.status === "SUSPENDED";
  const { canWrite } = useAdminAccess();
  const isSaving = suspendUser.isPending || reinstateUser.isPending || setUserFlag.isPending;

  // Read-only admin types can see the account but not change it
  if (!canWrite("users")) return null;

  const handleSuspend = (reason: string) =>
    suspendUser.mutate(reason, {
      onSuccess: () => {
        toast.success("Account suspended.");
        setIsSuspendModalOpen(false);
      },
      onError: showError,
    });

  const handleReinstate = () =>
    reinstateUser.mutate(undefined, {
      onSuccess: () => toast.success("Account reinstated."),
      onError: showError,
    });

  const handleToggleFlag = () =>
    setUserFlag.mutate(!user.isFlagged, {
      onSuccess: () => toast.success(user.isFlagged ? "Flag removed." : "Account flagged for review."),
      onError: showError,
    });

  return (
    <section className={cn(cardClass, "p-5")}>
      <div className="flex items-center justify-between gap-3">
        <h2 className={cardTitleClass}>Account actions</h2>
        <span className={cn(badgeClass, "bg-[#FFEEE8] text-[#E84D12]")}>Super Admin access</span>
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <a href={`mailto:${user.email}`} className={primaryPillClass}>
          Manual email
        </a>
        <button type="button" disabled={isSaving || isSuspended} onClick={handleToggleFlag} className={neutralPillClass}>
          {user.isFlagged ? "Remove flag" : "Flag for review"}
        </button>
        <button
          type="button"
          disabled={isSaving || isSuspended}
          onClick={() => setIsSuspendModalOpen(true)}
          className={dangerPillClass}
        >
          Suspend...
        </button>
        <button type="button" disabled={isSaving || !isSuspended} onClick={handleReinstate} className={neutralPillClass}>
          Reinstate
        </button>
      </div>

      {isSuspended && user.suspensionReason && (
        <p className="mt-4 rounded-xl bg-[#FEF3F2] px-3.5 py-3 text-sm text-[#B42318]">
          Suspended: {user.suspensionReason}
        </p>
      )}
      <p className="mt-4 text-xs text-[#667085]">
        Suspension requires a reason and a separate confirmation. Reinstate is available only for suspended accounts.
      </p>

      {isSuspendModalOpen && (
        <SuspendAccountModal
          userName={user.name}
          isSubmitting={suspendUser.isPending}
          onClose={() => setIsSuspendModalOpen(false)}
          onConfirm={handleSuspend}
        />
      )}
    </section>
  );
}
