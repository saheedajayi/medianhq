import Link from "next/link";
import { Add } from "iconsax-react";
import type { AdminApplicationRow } from "@/services/admin/applications";
import { formatDateTime, formatDay, formatMoment } from "../shared/format";
import { DetailList, UserAvatar, cardTitleClass, chipClass, primaryPillClass } from "../shared/shared";
import { APPLICATION_STATUS, formatAge, formatRole } from "./application-utils";

interface SelectedApplicationPanelProps {
  application: AdminApplicationRow;
  onClose: () => void;
}

/** A summary of the ticked application beside the queue, with a way into its full review */
export function SelectedApplicationPanel({ application, onClose }: SelectedApplicationPanelProps) {
  const role = formatRole(application, " @ ");

  return (
    <aside className="rounded-2xl border border-[#EAECF0] p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className={cardTitleClass}>Selected application</h2>
        <button
          type="button"
          onClick={onClose}
          className="flex size-7 items-center justify-center rounded-full hover:bg-[#F2F4F7]"
        >
          <Add size="20" variant="Linear" color="#667085" className="rotate-45" />
          <span className="sr-only">Close panel</span>
        </button>
      </div>

      <div className="mt-4 flex items-center gap-3">
        <UserAvatar name={application.name} avatarUrl={application.avatarUrl} className="size-11" />
        <div className="min-w-0">
          <p className="truncate text-base font-semibold text-[#101828]">{application.name}</p>
          <p className="truncate text-xs text-[#667085]">
            {application.id} · {APPLICATION_STATUS[application.status].label}
          </p>
        </div>
      </div>
      {role && <p className="mt-4 text-sm font-semibold text-[#101828]">{role}</p>}
      <span className={`${chipClass} mt-3 inline-block`}>{application.expertise}</span>

      <DetailList
        className="mt-5"
        items={[
          ["Submitted", formatDateTime(application.submittedAt)],
          ["Application age", formatAge(application.ageBusinessDays, "business")],
          ["Review target", `By ${formatDay(application.reviewTarget)}`],
          ["Assigned reviewer", application.reviewer?.name ?? "Unassigned"],
        ]}
      />

      <div className="mt-5 rounded-xl bg-[#F9FAFB] p-3.5">
        <p className="text-xs font-semibold text-[#101828]">Latest private note</p>
        <p className="mt-2 text-sm leading-relaxed text-[#475467]">{application.note ?? "No note saved yet."}</p>
        {application.note && application.noteAt && (
          <p className="mt-2 text-xs text-[#667085]">
            {[application.noteBy, `${formatMoment(application.noteAt)} WAT`].filter(Boolean).join(" · ")}
          </p>
        )}
      </div>

      <Link href={`/admin/applications/${application.id}`} className={`${primaryPillClass} mt-5 inline-block`}>
        Open full review
      </Link>
    </aside>
  );
}
