"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/base/dialog";
import type { AdminRoleValue } from "@/services/admin/invites";
import { useCreateAdminInvite } from "@/services/admin/invites/queries/invites.queries";
import { cn } from "@/lib/utils";
import { ADMIN_ROLES } from "./admin-roles";
import { ADMIN_EMAIL_DOMAIN, isAdminEmail } from "../shared/admin-access";

interface AddAdminModalProps {
  onClose: () => void;
}

/** Sends an invite: the new admin sets their own name and password from the emailed link */
export function AddAdminModal({ onClose }: AddAdminModalProps) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<AdminRoleValue | null>(null);
  const createInvite = useCreateAdminInvite();
  const trimmedEmail = email.trim();
  // Flagged once they've typed the domain, not while they're still typing the name
  const isWrongDomain = trimmedEmail.includes("@") && !isAdminEmail(trimmedEmail);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!trimmedEmail || !role || isWrongDomain) return;

    createInvite.mutate(
      { email: trimmedEmail, role },
      {
        onSuccess: () => {
          toast.success(`Invite sent to ${trimmedEmail}.`);
          onClose();
        },
        onError: (error) =>
          toast.error(
            error.message || "We couldn't send the invite. Please try again.",
          ),
      },
    );
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="gap-6 rounded-2xl bg-white p-6 sm:max-w-xl">
        <div>
          <DialogTitle className="pt-6 text-2xl font-semibold text-[#4A0A05]">
            Add Admin
          </DialogTitle>
          <DialogDescription className="mt-1.5 text-sm text-[#667085]">
            We&apos;ll email them a link to set their name and password. It
            expires in 7 days.
          </DialogDescription>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <label className="flex flex-col gap-2 text-sm text-[#344054]">
            Email Address
            <input
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Enter email address"
              aria-invalid={isWrongDomain}
              aria-describedby={isWrongDomain ? "admin-email-domain" : undefined}
              className="h-12 rounded-lg border border-[#EAECF0] bg-[#FCFCFD] px-3.5 text-sm text-[#101828] outline-none placeholder:text-[#98A2B3] focus:border-[#FF5514] aria-[invalid=true]:border-red-500"
            />
            {isWrongDomain && (
              <span id="admin-email-domain" className="text-xs font-medium text-red-600">
                Admins must use an @{ADMIN_EMAIL_DOMAIN} email address.
              </span>
            )}
          </label>

          <fieldset className="flex flex-col gap-2.5">
            <legend className="mb-2.5 text-sm text-[#344054]">
              Admin Type
            </legend>
            {ADMIN_ROLES.map((option) => (
              <label
                key={option.value}
                className={cn(
                  "flex cursor-pointer items-center gap-3 rounded-lg border px-3.5 py-2.5 text-sm font-medium text-[#101828]",
                  role === option.value
                    ? "border-[#FF5514]"
                    : "border-[#EAECF0]",
                )}
              >
                <input
                  type="radio"
                  name="adminType"
                  value={option.value}
                  checked={role === option.value}
                  onChange={() => setRole(option.value)}
                  className="size-4 accent-[#FF5514]"
                />
                {option.name}
              </label>
            ))}
          </fieldset>

          <button
            type="submit"
            disabled={!trimmedEmail || !role || isWrongDomain || createInvite.isPending}
            className="mt-2 rounded-full bg-[#FF5514] py-3 text-base font-medium text-white transition-colors hover:bg-[#E84D12] disabled:opacity-60"
          >
            {createInvite.isPending ? "Sending invite..." : "Add Admin"}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
