"use client";

import { toast } from "sonner";
import type { AdminApplicationDetail, AdminChecklistItem } from "@/services/admin/applications";
import { useSaveApplicationReview } from "@/services/admin/applications/queries/applications.queries";
import { cn } from "@/lib/utils";
import { badgeClass, cardClass, cardTitleClass, checkboxClass } from "../shared/shared";

const CHECKLIST: { key: AdminChecklistItem; label: string; guide: string }[] = [
  {
    key: "credibility",
    label: "Professional credibility",
    guide: "LinkedIn profile and CV reviewed; employment history and qualifications are consistent.",
  },
  {
    key: "seniority",
    label: "Seniority & expertise",
    guide: "Years of experience, leadership scope and proposed topics fit mentor expectations.",
  },
  {
    key: "conduct",
    label: "Conduct & community standards",
    guide: "Code of conduct accepted; respectful communication and safeguarding obligations reviewed.",
  },
  {
    key: "conflictOfInterest",
    label: "Conflict of interest",
    guide: "No undisclosed conflicts; employer confidentiality boundaries acknowledged.",
  },
];

interface ReviewChecklistCardProps {
  application: AdminApplicationDetail;
}

/** Each tick saves straight away, so the checklist never has unsaved changes */
export function ReviewChecklistCard({ application }: ReviewChecklistCardProps) {
  const saveReview = useSaveApplicationReview(application.id);
  const isLocked = application.status !== "PENDING_REVIEW";
  const isComplete = application.checksDone === application.checksTotal;

  const handleToggle = (key: AdminChecklistItem) =>
    saveReview.mutate(
      { checklist: { ...application.checklist, [key]: !application.checklist[key] } },
      { onError: (error) => toast.error(error.message || "We couldn't save the checklist.") },
    );

  return (
    <section className={cn(cardClass, "p-5")}>
      <div className="flex items-center justify-between gap-3">
        <h2 className={cardTitleClass}>Human review checklist</h2>
        <span className={cn(badgeClass, isComplete ? "bg-[#ECFDF3] text-[#067647]" : "bg-[#F2F4F7] text-[#344054]")}>
          {application.checksDone} of {application.checksTotal}
        </span>
      </div>
      <p className="mt-3 text-xs leading-relaxed text-[#667085]">
        Each assessment is completed by the assigned reviewer. No automated prescreening.
      </p>

      <ul className="mt-4 flex flex-col gap-4">
        {CHECKLIST.map((item) => (
          <li key={item.key}>
            <label className="flex cursor-pointer items-start gap-3">
              <input
                type="checkbox"
                checked={application.checklist[item.key]}
                disabled={isLocked || saveReview.isPending}
                onChange={() => handleToggle(item.key)}
                className={cn(checkboxClass, "mt-0.5 shrink-0")}
              />
              <span>
                <span className="block text-sm font-semibold text-[#101828]">{item.label}</span>
                <span className="mt-1 block text-sm leading-relaxed text-[#667085]">{item.guide}</span>
              </span>
            </label>
          </li>
        ))}
      </ul>
    </section>
  );
}
