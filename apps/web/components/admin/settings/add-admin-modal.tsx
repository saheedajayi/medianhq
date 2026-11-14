"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/base/dialog";
import { cn } from "@/lib/utils";
import { ADMIN_ROLES } from "./admin-roles";

interface AddAdminModalProps {
  onClose: () => void;
}

export function AddAdminModal({ onClose }: AddAdminModalProps) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<string | null>(null);

  // Granting admin access is not connected yet, so nothing is created or changed
  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    toast.info("Adding admins isn't connected yet.");
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="gap-6 rounded-2xl bg-white p-6 sm:max-w-xl">
        <DialogTitle className="pt-6 text-2xl font-semibold text-[#4A0A05]">Add Admin</DialogTitle>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <label className="flex flex-col gap-2 text-sm text-[#344054]">
            Email Address
            <input
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Enter email address"
              className="h-12 rounded-lg border border-[#EAECF0] bg-[#FCFCFD] px-3.5 text-sm text-[#101828] outline-none placeholder:text-[#98A2B3] focus:border-[#FF5514]"
            />
          </label>

          <fieldset className="flex flex-col gap-2.5">
            <legend className="mb-2.5 text-sm text-[#344054]">Admin Type</legend>
            {ADMIN_ROLES.map((option) => (
              <label
                key={option.name}
                className={cn(
                  "flex cursor-pointer items-center gap-3 rounded-lg border px-3.5 py-2.5 text-sm font-medium text-[#101828]",
                  role === option.name ? "border-[#FF5514]" : "border-[#EAECF0]",
                )}
              >
                <input
                  type="radio"
                  name="adminType"
                  value={option.name}
                  checked={role === option.name}
                  onChange={() => setRole(option.name)}
                  className="size-4 accent-[#FF5514]"
                />
                {option.name}
              </label>
            ))}
          </fieldset>

          <button
            type="submit"
            disabled={!email.trim() || !role}
            className="mt-2 rounded-full bg-[#FF5514] py-3 text-base font-medium text-white transition-colors hover:bg-[#E84D12] disabled:opacity-60"
          >
            Add Admin
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
