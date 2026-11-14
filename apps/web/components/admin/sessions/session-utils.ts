import type { AdminSession } from "@/services/admin/sessions";
import { downloadCsv } from "@/lib/csv";

// Session types are free text, so each one is given a colour that stays the same wherever it appears
const TYPE_COLORS = [
  { chip: "bg-[#EAF6FE] text-[#1B8FD6]", block: "bg-[#E3F3FC] text-[#1B8FD6]", dot: "#1B9AE4" },
  { chip: "bg-[#F1E8FD] text-[#7A2EDB]", block: "bg-[#EBDFF8] text-[#7A2EDB]", dot: "#7A2EDB" },
  { chip: "bg-[#E9F8F1] text-[#2FC58A]", block: "bg-[#DCEBE4] text-[#0B6B46]", dot: "#0B7A4E" },
] as const;

export function sessionTypeColor(type: string) {
  const hash = [...type].reduce((sum, character) => sum + character.charCodeAt(0), 0);
  return TYPE_COLORS[hash % TYPE_COLORS.length]!;
}

/** The band across the top of a sessions table */
export const sessionsHeadClass = "px-3 py-5 text-left text-xs font-semibold text-[#475467]";
export const sessionsCellClass = "px-3 py-4 align-middle text-sm text-[#101828]";
export const viewButtonClass =
  "inline-block rounded-md bg-[#EAECF0] px-3 py-1.5 text-sm text-[#101828]! transition-colors hover:bg-[#D0D5DD]";
export const squareChipClass = "inline-block whitespace-nowrap rounded-md px-2.5 py-1.5 text-sm";

export function exportSessions(filename: string, sessions: AdminSession[]) {
  downloadCsv(filename, [
    ["Session ID", "Starts at", "Duration (mins)", "Type", "Status", "Mentor", "Mentee", "Rating"],
    ...sessions.map((session) => [
      session.id,
      session.startsAt,
      session.durationMinutes,
      session.type,
      session.status,
      session.mentor.name,
      session.mentee.name,
      session.rating,
    ]),
  ]);
}
