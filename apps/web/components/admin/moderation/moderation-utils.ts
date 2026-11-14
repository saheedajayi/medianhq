import type { ContentFlag, FlagContentType, FlagStatus } from "@/services/admin/moderation";
import { downloadCsv } from "@/lib/csv";

export const CONTENT_TYPE: Record<FlagContentType, { label: string; className: string }> = {
  FORUM_POST: { label: "Forum Post", className: "bg-[#EAF6FE] text-[#1B8FD6]" },
  MESSAGE: { label: "Message", className: "bg-[#FBE8FB] text-[#C026D3]" },
  PROFILE_TEXT: { label: "Profile Text", className: "bg-[#E9F8F1] text-[#2FC58A]" },
};

export const FLAG_STATUS: Record<FlagStatus, { label: string; className: string }> = {
  PENDING: { label: "Pending", className: "bg-[#FFEAD5] text-[#E04F16]" },
  FLAGGED: { label: "Flagged", className: "bg-[#FEE4E2] text-[#F04438]" },
  REVIEWED: { label: "Reviewed", className: "bg-[#E7F4EE] text-[#067647]" },
  ESCALATED: { label: "Escalated", className: "bg-[#FBE8FB] text-[#C026D3]" },
  REMOVED: { label: "Removed", className: "bg-[#F2F4F7] text-[#344054]" },
};

export const smallChipClass = "inline-block whitespace-nowrap rounded px-1.5 py-1 text-[10px]";
export const moderationHeadClass = "px-3 py-5 text-left text-xs font-semibold text-[#475467]";
export const moderationCellClass = "px-3 py-4 align-middle text-xs text-[#475467]";

/** "2h 15m", or "3d 4h" once it is over a day old */
export function formatFlagAge(flaggedAt: string) {
  const minutes = Math.max(Math.floor((Date.now() - new Date(flaggedAt).getTime()) / 60_000), 0);
  const hours = Math.floor(minutes / 60);
  if (hours >= 24) return `${Math.floor(hours / 24)}d ${hours % 24}h`;
  return `${hours}h ${minutes % 60}m`;
}

export function exportFlags(filename: string, flags: ContentFlag[]) {
  downloadCsv(filename, [
    ["Flag ID", "Type", "Content", "Author", "Recipient", "Reason", "Flagged by", "Flagged at", "Status"],
    ...flags.map((flag) => [
      flag.id,
      CONTENT_TYPE[flag.contentType].label,
      flag.content,
      flag.author.name,
      flag.recipient?.name,
      flag.reason,
      flag.flaggedBy,
      flag.flaggedAt,
      FLAG_STATUS[flag.status].label,
    ]),
  ]);
}
