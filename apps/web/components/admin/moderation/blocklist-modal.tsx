"use client";

import { useState } from "react";
import { Trash } from "iconsax-react";
import { toast } from "sonner";
import {
  useAddBlockedTerm,
  useBlocklist,
  useRemoveBlockedTerm,
} from "@/services/admin/moderation/queries/moderation.queries";
import { AdminModal } from "../shared/admin-modal";
import { primaryPillClass } from "../shared/shared";

const inputClass =
  "h-10 rounded-lg border border-[#D0D5DD] px-3 text-sm text-[#101828] outline-none placeholder:text-[#98A2B3] focus:border-[#FF5514]";

interface BlocklistModalProps {
  onClose: () => void;
}

/** The words and phrases that flag content for review, and the reason each one gives */
export function BlocklistModal({ onClose }: BlocklistModalProps) {
  const [term, setTerm] = useState("");
  const [reason, setReason] = useState("");
  const { data: terms, isLoading } = useBlocklist();
  const addTerm = useAddBlockedTerm();
  const removeTerm = useRemoveBlockedTerm();

  const handleAdd = (event: React.FormEvent) => {
    event.preventDefault();
    addTerm.mutate(
      { term: term.trim(), reason: reason.trim() },
      {
        onSuccess: () => {
          toast.success(`"${term.trim()}" added to the blocklist.`);
          setTerm("");
        },
        onError: (error) => toast.error(error.message || "We couldn't add that term."),
      },
    );
  };

  const handleRemove = (termId: string, label: string) =>
    removeTerm.mutate(termId, {
      onSuccess: () => toast.success(`"${label}" removed from the blocklist.`),
      onError: (error) => toast.error(error.message || "We couldn't remove that term."),
    });

  return (
    <AdminModal
      isOpen
      onClose={onClose}
      title="Blocklist"
      description="Posts, comments, messages and profile text containing these words are flagged for review. Changes apply to new content."
    >
      <form onSubmit={handleAdd} className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]">
        <label className="sr-only" htmlFor="blocked-term">
          Word or phrase
        </label>
        <input
          id="blocked-term"
          value={term}
          onChange={(event) => setTerm(event.target.value)}
          maxLength={60}
          placeholder="Word or phrase"
          className={inputClass}
        />
        <label className="sr-only" htmlFor="blocked-reason">
          Reason
        </label>
        <input
          id="blocked-reason"
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          maxLength={80}
          placeholder="Reason, e.g. Spam/Self Promotion"
          className={inputClass}
        />
        <button
          type="submit"
          disabled={!term.trim() || !reason.trim() || addTerm.isPending}
          className={primaryPillClass}
        >
          Add
        </button>
      </form>

      <ul className="max-h-72 divide-y divide-[#EAECF0] overflow-y-auto rounded-xl border border-[#EAECF0]">
        {isLoading && <li className="px-3.5 py-3 text-sm text-[#667085]">Loading...</li>}
        {terms?.length === 0 && <li className="px-3.5 py-3 text-sm text-[#667085]">No blocked terms yet.</li>}
        {terms?.map((blocked) => (
          <li key={blocked.id} className="flex items-center justify-between gap-3 px-3.5 py-2.5">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-[#101828]">{blocked.term}</p>
              <p className="truncate text-xs text-[#667085]">{blocked.reason}</p>
            </div>
            <button
              type="button"
              disabled={removeTerm.isPending}
              onClick={() => handleRemove(blocked.id, blocked.term)}
              className="flex size-8 shrink-0 items-center justify-center rounded-full hover:bg-[#FEF3F2] disabled:opacity-50"
            >
              <Trash size="16" variant="Outline" color="#D92D20" />
              <span className="sr-only">Remove {blocked.term}</span>
            </button>
          </li>
        ))}
      </ul>
    </AdminModal>
  );
}
