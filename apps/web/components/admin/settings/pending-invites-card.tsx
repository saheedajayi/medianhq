"use client";

import { toast } from "sonner";
import type { AdminInvite } from "@/services/admin/invites";
import {
  useAdminInvites,
  useResendAdminInvite,
  useRevokeAdminInvite,
} from "@/services/admin/invites/queries/invites.queries";
import { cn } from "@/lib/utils";
import { formatDay } from "../shared/format";
import { adminRoleName } from "./admin-roles";

const headClass = "px-6 py-3 text-left text-sm font-semibold text-[#101828]";
const cellClass = "px-6 py-4 text-sm text-[#101828]";
const actionClass =
  "rounded border px-2 py-1.5 text-sm transition-colors disabled:opacity-50";

const STATUS: Record<
  AdminInvite["status"],
  { label: string; className: string }
> = {
  PENDING: { label: "Pending", className: "bg-[#FFEAD5] text-[#E04F16]" },
  EXPIRED: { label: "Expired", className: "bg-[#F2F4F7] text-[#475467]" },
};

/** Invites sent but not yet accepted. Hidden while there are none. */
export function PendingInvitesCard() {
  const { data: invites } = useAdminInvites();
  const resendInvite = useResendAdminInvite();
  const revokeInvite = useRevokeAdminInvite();
  const isSaving = resendInvite.isPending || revokeInvite.isPending;

  if (!invites?.length) return null;

  const handleResend = (invite: AdminInvite) =>
    resendInvite.mutate(invite.id, {
      onSuccess: () =>
        toast.success(`A new invite link was sent to ${invite.email}.`),
      onError: (error) =>
        toast.error(error.message || "We couldn't resend the invite."),
    });

  const handleRevoke = (invite: AdminInvite) =>
    revokeInvite.mutate(invite.id, {
      onSuccess: () =>
        toast.success(`The invite to ${invite.email} was cancelled.`),
      onError: (error) =>
        toast.error(error.message || "We couldn't cancel the invite."),
    });

  return (
    <section className="overflow-hidden rounded-2xl border border-[#EAECF0] bg-white">
      <h2 className="px-6 py-6 text-2xl font-semibold tracking-tight text-[#475467]">
        Pending Invites
      </h2>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] border-collapse">
          <thead className="bg-[#F2F4F7]">
            <tr>
              {[
                "Email",
                "Admin Type",
                "Invited By",
                "Sent",
                "Status",
                "Actions",
              ].map((column) => (
                <th key={column} scope="col" className={headClass}>
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {invites.map((invite) => (
              <tr key={invite.id}>
                <td className={cellClass}>{invite.email}</td>
                <td className={cellClass}>{adminRoleName(invite.role)}</td>
                <td className={cellClass}>{invite.invitedBy ?? "—"}</td>
                <td className={cn(cellClass, "whitespace-nowrap")}>
                  {formatDay(invite.sentAt)}
                  <span className="block text-xs text-[#667085]">
                    {invite.status === "PENDING" ? "Expires" : "Expired"}{" "}
                    {formatDay(invite.expiresAt)}
                  </span>
                </td>
                <td className={cellClass}>
                  <span
                    className={cn(
                      "rounded px-2 py-1 text-xs",
                      STATUS[invite.status].className,
                    )}
                  >
                    {STATUS[invite.status].label}
                  </span>
                </td>
                <td className={cellClass}>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={isSaving}
                      onClick={() => handleResend(invite)}
                      className={cn(
                        actionClass,
                        "border-[#101828] hover:bg-[#F9FAFB]",
                      )}
                    >
                      Resend
                    </button>
                    <button
                      type="button"
                      disabled={isSaving}
                      onClick={() => handleRevoke(invite)}
                      className={cn(
                        actionClass,
                        "border-[#FDA29B] text-[#B42318] hover:bg-[#FEF3F2]",
                      )}
                    >
                      Cancel invite
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
