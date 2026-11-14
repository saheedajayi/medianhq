import { TickCircle } from "iconsax-react";
import type { CalendarSession } from "@/services/admin/sessions";
import { cn } from "@/lib/utils";
import { formatClock } from "../shared/format";
import { RISK } from "./calendar-utils";
import { sessionTypeColor } from "./session-utils";

interface CalendarSessionBlockProps {
  session: CalendarSession;
}

/** One session inside a calendar day, coloured by its type and labelled with its no-show risk */
export function CalendarSessionBlock({ session }: CalendarSessionBlockProps) {
  const color = sessionTypeColor(session.type);

  return (
    <div className={cn("flex gap-1 rounded-sm px-1 py-1.5 text-[9px] leading-tight", color.block)}>
      <TickCircle size="12" variant="Outline" color={color.dot} className="shrink-0" />
      <div className="min-w-0">
        <p>{formatClock(session.startsAt)}</p>
        <p className="mt-0.5 truncate font-medium">{session.type}</p>
        <p className="mt-0.5 truncate text-[7px] opacity-70">
          {session.mentor.name} - {session.mentee.name}
        </p>
        <p className="mt-0.5 text-[6px]" style={{ color: RISK[session.risk].color }}>
          {RISK[session.risk].label}
        </p>
      </div>
    </div>
  );
}
