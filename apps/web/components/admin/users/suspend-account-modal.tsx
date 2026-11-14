"use client";

import { useState } from "react";
import { AdminModal } from "../shared/admin-modal";
import { dangerPillClass, dangerSolidPillClass, neutralPillClass, textareaClass } from "../shared/shared";

interface SuspendAccountModalProps {
  userName: string;
  isSubmitting: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
}

/** Suspending takes two steps: give a reason, then confirm it */
export function SuspendAccountModal({ userName, isSubmitting, onClose, onConfirm }: SuspendAccountModalProps) {
  const [reason, setReason] = useState("");
  const [isConfirming, setIsConfirming] = useState(false);
  const trimmedReason = reason.trim();

  if (isConfirming) {
    return (
      <AdminModal
        isOpen
        onClose={onClose}
        title={`Suspend ${userName}?`}
        description="They will be signed out everywhere and won't be able to sign in or be booked until reinstated."
      >
        <p className="rounded-xl bg-[#F9FAFB] px-3.5 py-3 text-sm text-[#344054]">Reason: {trimmedReason}</p>
        <div className="flex justify-end gap-3">
          <button type="button" onClick={() => setIsConfirming(false)} className={neutralPillClass}>
            Back
          </button>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => onConfirm(trimmedReason)}
            className={dangerSolidPillClass}
          >
            {isSubmitting ? "Suspending..." : "Suspend account"}
          </button>
        </div>
      </AdminModal>
    );
  }

  return (
    <AdminModal
      isOpen
      onClose={onClose}
      title="Suspend account"
      description={`Give the reason for suspending ${userName}. It is saved to the audit log.`}
    >
      <label className="flex flex-col gap-2 text-sm font-medium text-[#344054]">
        Reason
        <textarea
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          rows={4}
          maxLength={500}
          placeholder="For example: repeated no-shows reported by mentees"
          className={`${textareaClass} font-normal`}
        />
      </label>
      <div className="flex justify-end gap-3">
        <button type="button" onClick={onClose} className={neutralPillClass}>
          Cancel
        </button>
        <button
          type="button"
          disabled={!trimmedReason}
          onClick={() => setIsConfirming(true)}
          className={dangerPillClass}
        >
          Continue
        </button>
      </div>
    </AdminModal>
  );
}
