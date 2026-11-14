const LAGOS = "Africa/Lagos";
const LOCALE = "en-NG";

const lagosDay = (date: Date) => date.toLocaleDateString("en-CA", { timeZone: LAGOS });

export const formatCount = (value: number) => value.toLocaleString(LOCALE);

export const formatMoney = (amount: number, currency = "NGN") =>
  currency === "NGN" ? `₦${formatCount(amount)}` : `${currency} ${formatCount(amount)}`;

/** "12 Feb 2026", or "12 February 2026" with a long month */
export const formatDay = (iso: string, month: "short" | "long" = "short") =>
  new Date(iso)
    .toLocaleDateString("en-GB", { timeZone: LAGOS, day: "2-digit", month, year: "numeric" })
    // en-GB shortens September to "Sept"; every other month is three letters
    .replace("Sept ", "Sep ");

/** "14:22", in Lagos time */
export const formatTime = (iso: string) =>
  new Date(iso).toLocaleTimeString("en-GB", { timeZone: LAGOS, hour: "2-digit", minute: "2-digit" });

/** "Today, 10:18" or "06 Oct, 17:32", in Lagos time */
export function formatMoment(iso: string) {
  const date = new Date(iso);
  const day =
    lagosDay(date) === lagosDay(new Date())
      ? "Today"
      : formatDay(iso).slice(0, -5);
  return `${day}, ${formatTime(iso)}`;
}

/** "01 Oct 2026 · 14:22 WAT" */
export const formatDateTime = (iso: string) => `${formatDay(iso)} · ${formatTime(iso)} WAT`;

/** "01–07 Oct 2026", or "28 Sep–04 Oct 2026" when the range crosses a month */
export function formatDayRange(fromIso: string, toIso: string) {
  const to = formatDay(toIso);
  const [day, month, year] = formatDay(fromIso).split(" ");
  const start = to.endsWith(`${month} ${year}`) ? day : to.endsWith(`${year}`) ? `${day} ${month}` : formatDay(fromIso);
  return `${start}–${to}`;
}

/** "09:30 AM", in Lagos time */
export const formatClock = (iso: string) =>
  new Date(iso).toLocaleTimeString("en-US", { timeZone: LAGOS, hour: "2-digit", minute: "2-digit" });

/** "Oct 6, 2025", in Lagos time */
export const formatLongDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", { timeZone: LAGOS, month: "short", day: "numeric", year: "numeric" });
