"use client";

import { Calendar } from "iconsax-react";
import { cardClass, cardTitleClass } from "./shared";

const CALENDARS = ["Google calendar", "Outlook calendar"];

/** Calendar connections have no backend yet, so these can't be switched on */
export function CalendarTab() {
  return (
    <section className={cardClass}>
      <h2 className={cardTitleClass}>Connected Calendars</h2>
      <ul className="mt-2">
        {CALENDARS.map((name) => (
          <li
            key={name}
            className="flex items-center justify-between gap-3 border-b border-[#EAECF0] py-4 last:border-0 last:pb-0"
          >
            <div className="flex items-center gap-3">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#F7F8FB]">
                <Calendar size="16" variant="Outline" color="#475467" />
              </span>
              <div>
                <p className="text-sm text-[#101828]">{name}</p>
                <p className="mt-0.5 text-xs text-[#667085]">Not connected</p>
              </div>
            </div>
            <button
              type="button"
              disabled
              className="shrink-0 cursor-not-allowed rounded-full bg-[#F2F4F7] px-3.5 py-2 text-sm font-medium text-[#98A2B3]"
            >
              Coming soon
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
