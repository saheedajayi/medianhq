"use client";

import { useState } from "react";
import type { CalendarSession } from "@/services/admin/sessions";
import { formatClock } from "../shared/format";
import { RISK, formatMonthDay } from "./calendar-utils";
import { sessionTypeColor } from "./session-utils";

const PREVIEW_COUNT = 5;
const panelClass = "rounded-2xl border border-[#D0D5DD] p-4";

interface CalendarSidebarProps {
  monthLabel: string;
  sessions: CalendarSession[];
}

/** The month's sessions as a list, above the key to the no-show risk colours */
export function CalendarSidebar({ monthLabel, sessions }: CalendarSidebarProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const shown = isExpanded ? sessions : sessions.slice(0, PREVIEW_COUNT);

  return (
    <aside className="flex flex-col gap-4">
      <section className={panelClass}>
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-lg font-semibold text-[#475467]">{monthLabel}</h3>
          {sessions.length > PREVIEW_COUNT && (
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-xs text-[#98A2B3] hover:text-[#475467]"
            >
              {isExpanded ? "see less" : "see all"}
            </button>
          )}
        </div>

        {sessions.length === 0 ? (
          <p className="mt-4 text-sm text-[#667085]">No sessions this month.</p>
        ) : (
          <ul className="mt-4 flex flex-col gap-3">
            {shown.map((session) => (
              <li key={session.id} className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 gap-2.5">
                  <span
                    className="mt-1.5 size-2 shrink-0 rounded-full"
                    style={{ backgroundColor: sessionTypeColor(session.type).dot }}
                  />
                  <div className="min-w-0">
                    <p className="truncate text-sm text-[#101828]">{session.type}</p>
                    <p className="truncate text-[9px] text-[#98A2B3]">
                      {session.mentor.name} - {session.mentee.name}
                    </p>
                  </div>
                </div>
                <p className="shrink-0 text-right text-[9px] leading-snug text-[#667085]">
                  {formatClock(session.startsAt)}
                  <br />
                  {formatMonthDay(session.startsAt)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className={panelClass}>
        <h3 className="text-lg font-semibold text-[#475467]">No show Tracker</h3>
        <ul className="mt-4 flex flex-col gap-4">
          {Object.values(RISK).map((risk) => (
            <li key={risk.label} className="flex items-center gap-2.5 text-sm" style={{ color: risk.color }}>
              <span className="size-2 rounded-full" style={{ backgroundColor: risk.color }} />
              {risk.label}
            </li>
          ))}
        </ul>
      </section>
    </aside>
  );
}
