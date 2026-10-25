/**
 * Turns a mentor's weekly availability into concrete bookable start times.
 *
 * Availability is saved as wall-clock times ("9:00 AM") with no time zone.
 * Median's mentors are in Nigeria, so those times are read as West Africa Time
 * (UTC+1, no daylight saving) until mentors can pick their own time zone.
 */

export const MENTOR_UTC_OFFSET_MINUTES = 60;
export const SLOT_STEP_MINUTES = 30;

export type WeeklyWindow = {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isActive: boolean;
};

export type BusyRange = { startsAt: Date; endsAt: Date };

export type AvailableDay = {
  /** Mentor-local date, e.g. "2026-10-27" */
  date: string;
  dayOfWeek: number;
  /** ISO timestamps of each bookable start time */
  slots: string[];
};

const DAY_MS = 24 * 60 * 60 * 1000;
const MINUTE_MS = 60 * 1000;

/** "9:00 AM", "2:00 pm", "14:30" -> minutes after midnight; null when unreadable */
export function parseTimeOfDay(value: string): number | null {
  const match = value.trim().match(/^(\d{1,2}):(\d{2})\s*(am|pm)?$/i);
  if (!match) return null;
  let hours = Number(match[1]);
  const minutes = Number(match[2]);
  const period = match[3]?.toLowerCase();
  if (period === 'pm' && hours !== 12) hours += 12;
  if (period === 'am' && hours === 12) hours = 0;
  if (hours > 23 || minutes > 59) return null;
  return hours * 60 + minutes;
}

/** Midnight at the start of a mentor-local day, as a UTC instant */
function mentorDayStart(instant: Date) {
  const local = instant.getTime() + MENTOR_UTC_OFFSET_MINUTES * MINUTE_MS;
  const localMidnight = Math.floor(local / DAY_MS) * DAY_MS;
  return new Date(localMidnight - MENTOR_UTC_OFFSET_MINUTES * MINUTE_MS);
}

function toLocalDateString(dayStart: Date) {
  return new Date(dayStart.getTime() + MENTOR_UTC_OFFSET_MINUTES * MINUTE_MS)
    .toISOString()
    .slice(0, 10);
}

function overlaps(start: number, end: number, busy: BusyRange[]) {
  return busy.some(
    (range) => start < range.endsAt.getTime() && end > range.startsAt.getTime(),
  );
}

export function buildAvailableDays(params: {
  windows: WeeklyWindow[];
  busy: BusyRange[];
  durationMinutes: number;
  from: Date;
  days: number;
  earliestStart: Date;
}): AvailableDay[] {
  const { windows, busy, durationMinutes, from, days, earliestStart } = params;
  const firstDay = mentorDayStart(from);
  const result: AvailableDay[] = [];

  for (let offset = 0; offset < days; offset += 1) {
    const dayStart = new Date(firstDay.getTime() + offset * DAY_MS);
    const localDay = new Date(
      dayStart.getTime() + MENTOR_UTC_OFFSET_MINUTES * MINUTE_MS,
    );
    const dayOfWeek = localDay.getUTCDay();
    const window = windows.find((w) => w.dayOfWeek === dayOfWeek && w.isActive);
    const open = window ? parseTimeOfDay(window.startTime) : null;
    const close = window ? parseTimeOfDay(window.endTime) : null;

    const slots: string[] = [];
    if (open !== null && close !== null && close > open) {
      for (
        let minute = open;
        minute + durationMinutes <= close;
        minute += SLOT_STEP_MINUTES
      ) {
        const start = dayStart.getTime() + minute * MINUTE_MS;
        const end = start + durationMinutes * MINUTE_MS;
        if (start < earliestStart.getTime() || overlaps(start, end, busy))
          continue;
        slots.push(new Date(start).toISOString());
      }
    }

    result.push({ date: toLocalDateString(dayStart), dayOfWeek, slots });
  }

  return result;
}
