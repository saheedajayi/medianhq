const DAY_MS = 24 * 60 * 60 * 1000;
// Africa/Lagos is UTC+1 all year
const LAGOS_OFFSET_MS = 60 * 60 * 1000;

/** Whole days since the epoch for the Lagos calendar day a moment falls on */
const lagosDayNumber = (date: Date) =>
  Math.floor((date.getTime() + LAGOS_OFFSET_MS) / DAY_MS);

// Day 0 (1 Jan 1970) was a Thursday
const isWeekend = (dayNumber: number) => {
  const weekday = (dayNumber + 4) % 7;
  return weekday === 0 || weekday === 6;
};

/** Weekdays that have started since the day of `from`, up to the day of `to` */
export function businessDaysBetween(from: Date, to: Date) {
  let count = 0;
  for (let day = lagosDayNumber(from) + 1; day <= lagosDayNumber(to); day++) {
    if (!isWeekend(day)) count += 1;
  }
  return count;
}

/** The same time of day, the given number of weekdays later */
export function addBusinessDays(from: Date, days: number) {
  let day = lagosDayNumber(from);
  let remaining = days;
  while (remaining > 0) {
    day += 1;
    if (!isWeekend(day)) remaining -= 1;
  }
  return new Date(from.getTime() + (day - lagosDayNumber(from)) * DAY_MS);
}
