import type { CalendarSession, NoShowRisk } from "@/services/admin/sessions";

export const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export const RISK: Record<NoShowRisk, { label: string; color: string }> = {
  HIGH: { label: "High risk", color: "#D92D20" },
  MEDIUM: { label: "Medium risk", color: "#E88A0C" },
  LOW: { label: "Low risk", color: "#12B76A" },
};

/** The current month in Lagos, as YYYY-MM */
export const currentMonth = () =>
  new Date().toLocaleDateString("en-CA", { timeZone: "Africa/Lagos" }).slice(0, 7);

/** Moves a YYYY-MM month forwards or backwards */
export function shiftMonth(month: string, by: number) {
  const [year, monthNumber] = month.split("-").map(Number) as [number, number];
  return new Date(Date.UTC(year, monthNumber - 1 + by, 1)).toISOString().slice(0, 7);
}

/** "October 2025" */
export const formatMonth = (month: string) =>
  new Date(`${month}-01T12:00:00Z`).toLocaleDateString("en-US", { month: "long", year: "numeric", timeZone: "UTC" });

/** "Oct 1", in Lagos time */
export const formatMonthDay = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", { timeZone: "Africa/Lagos", month: "short", day: "numeric" });

export interface CalendarDay {
  /** The day of the month, or null for a blank cell before the 1st */
  day: number | null;
  sessions: CalendarSession[];
}

/** The month laid out for a Sunday-first grid, with blanks before the 1st */
export function buildCalendarDays(month: string, sessions: CalendarSession[]): CalendarDay[] {
  const [year, monthNumber] = month.split("-").map(Number) as [number, number];
  const daysInMonth = new Date(Date.UTC(year, monthNumber, 0)).getUTCDate();
  const blanksBefore = new Date(Date.UTC(year, monthNumber - 1, 1)).getUTCDay();

  const byDay = new Map<number, CalendarSession[]>();
  for (const session of sessions) {
    // en-CA gives YYYY-MM-DD, so the last two characters are the Lagos day
    const day = Number(new Date(session.startsAt).toLocaleDateString("en-CA", { timeZone: "Africa/Lagos" }).slice(-2));
    byDay.set(day, [...(byDay.get(day) ?? []), session]);
  }

  return [
    ...Array.from({ length: blanksBefore }, () => ({ day: null, sessions: [] })),
    ...Array.from({ length: daysInMonth }, (_, index) => ({ day: index + 1, sessions: byDay.get(index + 1) ?? [] })),
  ];
}
