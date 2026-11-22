"use client";

import { X } from "lucide-react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/base/dialog";
import { useMarkRejectionSeen } from "@/services/mentors/queries/mentors.queries";

/** Shown once to someone whose mentor application was rejected and who is now a mentee */
export function MentorRejectionNotice({ open }: { open: boolean }) {
  const markSeen = useMarkRejectionSeen();

  return (
    <Dialog open={open && !markSeen.isSuccess} onOpenChange={(next) => !next && markSeen.mutate()}>
      <DialogContent
        showCloseButton={false}
        className="gap-4 rounded-[20px] bg-white p-6 text-center sm:max-w-[480px]"
      >
        <DialogClose
          aria-label="Close"
          className="ml-auto flex size-9 items-center justify-center rounded-full bg-[#F7F8FB] text-[#101828] transition hover:bg-[#EAECF0]"
        >
          <X className="size-4" />
        </DialogClose>
        <DialogTitle className="text-2xl font-semibold text-[#4B100D]">We&apos;re sorry!</DialogTitle>
        {/* Spans, not paragraphs: the description itself renders as a paragraph */}
        <DialogDescription className="flex flex-col gap-4 text-base leading-relaxed text-[#101828]">
          <span>
            Your mentor application has been rejected. After review, we concluded that you are not
            a fit at this moment, but we encourage you to reapply in 6 months.
          </span>
          <span>
            In the meantime, we&apos;ve set you up as a mentee, tell us what you&apos;re working on
            so we can match you with the right mentor.
          </span>
        </DialogDescription>
        <div className="mt-4 flex justify-center pb-2">
          <button
            type="button"
            disabled={markSeen.isPending}
            onClick={() => markSeen.mutate()}
            className="inline-flex h-11 items-center justify-center rounded-full bg-[#FF5514] px-5 text-base font-medium text-white transition hover:bg-[#E64A0F] disabled:opacity-60"
          >
            Set up my mentee profile
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
