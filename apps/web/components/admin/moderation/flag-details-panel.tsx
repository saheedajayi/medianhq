"use client";

import { Add, ArrowDown2 } from "iconsax-react";
import type { ContentFlag, FlagContentType } from "@/services/admin/moderation";
import { formatClock, formatLongDate } from "../shared/format";
import { UserAvatar } from "../shared/shared";
import { ContentTypeChip, FlagStatusChip } from "./moderation-cells";
import { formatFlagAge, smallChipClass } from "./moderation-utils";
import { ReviewerActions } from "./reviewer-actions";

const TITLE: Record<FlagContentType, string> = {
  FORUM_POST: "Post Details",
  MESSAGE: "Message Details",
  PROFILE_TEXT: "Profile Text Details",
};

const panelClass = "rounded-lg border border-[#EAECF0] p-2.5";
const labelClass = "text-[10px] text-[#475467]";
// Reasons can be long, so these chips wrap inside the narrow panel
const dangerChipClass = `${smallChipClass} whitespace-normal bg-[#FEE4E2] text-[#F04438]`;

interface FlagDetailsPanelProps {
  flag: ContentFlag;
  onClose: () => void;
}

/** Everything a reviewer needs on one flagged item, beside the queue */
export function FlagDetailsPanel({ flag, onClose }: FlagDetailsPanelProps) {
  const facts: [label: string, value: React.ReactNode][] = [
    ["Reason for flagging", <span key="reason" className={dangerChipClass}>{flag.reason}</span>],
    ["Flagged by", flag.flaggedBy],
    ["Flagged at", `${formatLongDate(flag.flaggedAt)}, ${formatClock(flag.flaggedAt)}`],
    ["Age", <span key="age" className={dangerChipClass}>{formatFlagAge(flag.flaggedAt)}</span>],
    ["Status", <FlagStatusChip key="status" status={flag.status} />],
  ];

  return (
    <aside className="flex w-full flex-col gap-4 xl:w-64">
      <section className={`${panelClass} flex flex-col gap-4`}>
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-[15px] text-[#101828]">{TITLE[flag.contentType]}</h2>
          <button type="button" onClick={onClose} className="flex size-6 items-center justify-center">
            <Add size="20" variant="Linear" color="#101828" className="rotate-45" />
            <span className="sr-only">Close details</span>
          </button>
        </div>

        <div className="flex items-start justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <UserAvatar name={flag.author.name} avatarUrl={flag.author.avatarUrl} className="size-10" />
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold text-[#101828]">{flag.author.name}</p>
              <p className="text-[8px] text-[#667085]">
                {flag.author.role} · {formatLongDate(flag.flaggedAt)} {formatClock(flag.flaggedAt)}
              </p>
            </div>
          </div>
          <ContentTypeChip type={flag.contentType} className="text-[8px]" />
        </div>

        {flag.recipient && (
          <p className="text-[10px] text-[#475467]">
            To <span className="font-semibold text-[#101828]">{flag.recipient.name}</span> · {flag.recipient.role}
          </p>
        )}

        <p className="rounded border border-[#EAECF0] p-3 text-xs leading-relaxed text-[#101828]">{flag.content}</p>

        <dl className="flex flex-col gap-2">
          {facts.map(([label, value]) => (
            <div key={label} className="grid grid-cols-[100px_minmax(0,1fr)] items-center gap-2">
              <dt className={labelClass}>{label}</dt>
              <dd className="text-[8px] text-[#667085]">{value}</dd>
            </div>
          ))}
        </dl>

        <div>
          <h3 className="text-[11px] text-[#101828]">User details</h3>
          <dl className="mt-2 grid grid-cols-[88px_minmax(0,1fr)] gap-y-1.5 text-[9px] text-[#667085]">
            <dt>Joined</dt>
            <dd>{formatLongDate(flag.author.joinedAt)}</dd>
            <dt>Location</dt>
            <dd>{flag.author.country}</dd>
            <dt>Account Status</dt>
            <dd>
              <span className="rounded bg-[#E7F4EE] px-1 py-0.5 text-[#067647]">• {flag.author.accountStatus}</span>
            </dd>
          </dl>
        </div>

        <ReviewerActions key={flag.id} flag={flag} />
      </section>

      <details open className={panelClass}>
        <summary className="flex cursor-pointer list-none items-center justify-between text-[15px] text-[#101828]">
          Audit Trials
          <ArrowDown2 size="16" variant="Outline" color="#101828" />
        </summary>
        <ol className="mt-3 flex flex-col gap-3 border-l border-[#D0D5DD] pl-3">
          {flag.auditTrail.map((entry) => (
            <li key={`${entry.at}-${entry.label}`} className="grid grid-cols-2 gap-2 text-[9px] text-[#667085]">
              <p>
                {formatLongDate(entry.at)}
                <br />
                {formatClock(entry.at)}
              </p>
              <p>
                {entry.label}
                <br />
                <span className="text-[#E04F16]">{entry.detail}</span>
              </p>
            </li>
          ))}
        </ol>
      </details>
    </aside>
  );
}
