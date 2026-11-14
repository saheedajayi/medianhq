"use client";

import { useState } from "react";
import { Lock1 } from "iconsax-react";
import { toast } from "sonner";
import type { AdminApplicationDetail } from "@/services/admin/applications";
import { useSaveApplicationReview } from "@/services/admin/applications/queries/applications.queries";
import { cn } from "@/lib/utils";
import { formatMoment } from "../shared/format";
import { cardClass, cardTitleClass, neutralPillClass, textareaClass } from "../shared/shared";

interface ReviewerNotesCardProps {
  application: AdminApplicationDetail;
}

export function ReviewerNotesCard({ application }: ReviewerNotesCardProps) {
  const savedNote = application.note ?? "";
  const [note, setNote] = useState(savedNote);
  const saveReview = useSaveApplicationReview(application.id);
  const isLocked = application.status !== "PENDING_REVIEW";

  const handleSave = () =>
    saveReview.mutate(
      { note },
      {
        onSuccess: () => toast.success("Note saved."),
        onError: (error) => toast.error(error.message || "We couldn't save the note."),
      },
    );

  return (
    <section className={cn(cardClass, "p-5")}>
      <div className="flex items-center justify-between gap-3">
        <h2 className={cardTitleClass}>Private reviewer notes</h2>
        <Lock1 size="18" variant="Outline" color="#667085" />
      </div>

      <label className="mt-4 block">
        <span className="sr-only">Private reviewer note</span>
        <textarea
          value={note}
          onChange={(event) => setNote(event.target.value)}
          disabled={isLocked}
          rows={5}
          maxLength={2000}
          placeholder="What you verified and what you recommend."
          className={cn(textareaClass, "border-[#EAECF0] py-3 leading-relaxed")}
        />
      </label>
      <p className="mt-2 text-xs text-[#667085]">
        Internal only — never included in public profiles or decision emails.
      </p>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <span className="text-xs text-[#667085]">
          {application.noteAt
            ? `Saved${application.noteBy ? ` by ${application.noteBy}` : ""} · ${formatMoment(application.noteAt)} WAT`
            : "Not saved yet"}
        </span>
        {!isLocked && (
          <button
            type="button"
            disabled={saveReview.isPending || note.trim() === savedNote}
            onClick={handleSave}
            className={neutralPillClass}
          >
            {saveReview.isPending ? "Saving..." : "Save note"}
          </button>
        )}
      </div>
    </section>
  );
}
