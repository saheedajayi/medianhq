"use client";

import { useState } from "react";
import { ArrowLeft2, ArrowRight2 } from "iconsax-react";
import { DashboardErrorState } from "@/components/dashboard/dashboard-error-state";
import { useSessionsCalendar } from "@/services/admin/sessions/queries/sessions.queries";
import { cn } from "@/lib/utils";
import { CalendarSessionBlock } from "./calendar-session-block";
import { CalendarSidebar } from "./calendar-sidebar";
import { WEEKDAYS, buildCalendarDays, currentMonth, formatMonth, shiftMonth } from "./calendar-utils";

// A day shows this many sessions, then "+N more"
const SESSIONS_PER_DAY = 2;

export function SessionsCalendar() {
  const [month, setMonth] = useState(currentMonth);
  const { data, isError, isFetching, refetch } = useSessionsCalendar(month);

  if (isError && !data) return <DashboardErrorState onRetry={() => refetch()} isRetrying={isFetching} />;

  const sessions = data?.sessions ?? [];
  const monthLabel = formatMonth(month);
  const today = currentMonth() === month ? new Date().getDate() : null;

  return (
    <section className="overflow-hidden rounded-2xl border border-[#EAECF0] bg-white">
      <div className="flex items-center gap-4 bg-[#F2F4F7] px-5 py-5">
        <button type="button" onClick={() => setMonth(shiftMonth(month, -1))} aria-label="Previous month">
          <ArrowLeft2 size="18" variant="Outline" color="#475467" />
        </button>
        <button type="button" onClick={() => setMonth(shiftMonth(month, 1))} aria-label="Next month">
          <ArrowRight2 size="18" variant="Outline" color="#475467" />
        </button>
        <h2 className="text-xl font-semibold text-[#475467]">{monthLabel}</h2>
      </div>

      <div className={cn("grid gap-3 p-3 xl:grid-cols-[minmax(0,1fr)_256px]", isFetching && "opacity-60")}>
        <div className="overflow-x-auto">
          <div className="min-w-[720px]">
            <div className="grid grid-cols-7 py-3 text-center text-lg text-[#475467]">
              {WEEKDAYS.map((weekday) => (
                <span key={weekday}>{weekday}</span>
              ))}
            </div>

            <div className="grid grid-cols-7 overflow-hidden rounded-lg border-l border-t border-[#EAECF0]">
              {buildCalendarDays(month, sessions).map((cell, index) => (
                <div key={index} className="min-h-40 border-b border-r border-[#EAECF0] p-0.5">
                  {cell.day !== null && (
                    <>
                      <p
                        className={cn(
                          "px-0.5 py-1 text-[10px]",
                          cell.day === today ? "font-bold text-[#101828]" : "text-[#98A2B3]",
                        )}
                      >
                        {String(cell.day).padStart(2, "0")}
                      </p>
                      <div className="flex flex-col gap-1.5">
                        {cell.sessions.slice(0, SESSIONS_PER_DAY).map((session) => (
                          <CalendarSessionBlock key={session.id} session={session} />
                        ))}
                      </div>
                      {cell.sessions.length > SESSIONS_PER_DAY && (
                        <p className="px-0.5 pt-1 text-[7px] text-[#98A2B3]">
                          +{cell.sessions.length - SESSIONS_PER_DAY} more
                        </p>
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <CalendarSidebar monthLabel={monthLabel} sessions={sessions} />
      </div>
    </section>
  );
}
