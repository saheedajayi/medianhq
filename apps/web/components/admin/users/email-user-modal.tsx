"use client";

import { useState } from "react";
import type { AdminUserEmail } from "@/services/admin/users";
import { AdminModal } from "../shared/admin-modal";
import type { RichTextBlock } from "../shared/rich-text";
import { RichTextEditor } from "../shared/rich-text-editor";
import { neutralPillClass, primaryPillClass, textareaClass } from "../shared/shared";

const MAX_SUBJECT_LENGTH = 150;

interface EmailUserModalProps {
  userName: string;
  userEmail: string;
  isSubmitting: boolean;
  onClose: () => void;
  onSend: (email: AdminUserEmail) => void;
}

/** Writes an email that Median sends to the user on the admin's behalf */
export function EmailUserModal({ userName, userEmail, isSubmitting, onClose, onSend }: EmailUserModalProps) {
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState<RichTextBlock[]>([]);
  const canSend = !!subject.trim() && body.length > 0 && !isSubmitting;

  return (
    <AdminModal
      isOpen
      isWide
      onClose={onClose}
      title={`Email ${userName}`}
      description={`Sent from Median to ${userEmail}. It opens with "Hi" and their first name, and is saved to the activity log.`}
    >
      <label className="flex flex-col gap-2 text-sm font-medium text-[#344054]">
        Subject
        <input
          type="text"
          autoFocus
          value={subject}
          onChange={(event) => setSubject(event.target.value)}
          maxLength={MAX_SUBJECT_LENGTH}
          className={`${textareaClass} font-normal`}
        />
      </label>
      <div className="flex flex-col gap-2 text-sm font-medium text-[#344054]">
        Message
        <RichTextEditor ariaLabel="Message" placeholder="Write your message" onChange={setBody} />
      </div>
      <div className="flex justify-end gap-3">
        <button type="button" onClick={onClose} className={neutralPillClass}>
          Cancel
        </button>
        <button
          type="button"
          disabled={!canSend}
          onClick={() => onSend({ subject: subject.trim(), body })}
          className={primaryPillClass}
        >
          {isSubmitting ? "Sending..." : "Send email"}
        </button>
      </div>
    </AdminModal>
  );
}
