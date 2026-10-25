import type { AvailableDateSlot } from "@/components/ui/custom/available-dates";
import type { AvailableDay } from "@/services/bookings";

// Slots are shown in the mentors' time zone, matching how they set availability (labelled WAT)
const TIME_ZONE = "Africa/Lagos";

/** "2026-10-27T14:00:00.000Z" -> "3:00PM" in WAT */
export function formatSlotTime(iso: string) {
  return new Date(iso)
    .toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", timeZone: TIME_ZONE })
    // Browsers often put a narrow no-break space before AM/PM; drop any whitespace
    .replace(/\s+/g, "");
}

/**
 * Converts the API's open slots into the date picker's shape. Days without
 * slots are dropped, and slotIsos keeps each time's exact start so the
 * booking sends the slot the mentee picked rather than a re-parsed time.
 */
export function toAvailableDateSlots(days: AvailableDay[] | undefined): AvailableDateSlot[] {
  return (days ?? [])
    .filter((day) => day.slots.length > 0)
    .map((day) => {
      // Noon UTC is the same calendar day in WAT, so it labels the date safely
      const labelDate = new Date(`${day.date}T12:00:00Z`);
      return {
        dateString: day.date,
        dayOfWeek: labelDate
          .toLocaleDateString("en-US", { weekday: "short", timeZone: "UTC" })
          .toUpperCase(),
        dayNumber: day.date.slice(8, 10),
        month: labelDate.toLocaleDateString("en-US", { month: "short", timeZone: "UTC" }),
        slotsCount: day.slots.length,
        times: day.slots.map(formatSlotTime),
        slotIsos: day.slots,
      };
    });
}

/** The exact start time for a picked date and time label */
export function getSlotIso(date: AvailableDateSlot, time: string) {
  const index = date.times.indexOf(time);
  return index >= 0 ? date.slotIsos?.[index] : undefined;
}
