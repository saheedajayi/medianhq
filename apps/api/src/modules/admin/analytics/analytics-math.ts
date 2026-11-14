import { growthPct } from '../common/time-buckets';
import type { AnalyticsStat } from './dto/admin-analytics.dto';

const DAY_MS = 24 * 60 * 60 * 1000;

export const countBetween = (dates: Date[], from: Date, to: Date) =>
  dates.filter((date) => date >= from && date < to).length;

/** How many fell in the last 7 days, against the 7 days before */
export function weekStat(dates: Date[], now: Date): AnalyticsStat {
  const weekAgo = new Date(now.getTime() - 7 * DAY_MS);
  const value = dates.filter((date) => date >= weekAgo && date <= now).length;
  const previous = countBetween(
    dates,
    new Date(now.getTime() - 14 * DAY_MS),
    weekAgo,
  );
  return { value, changePct: growthPct(value, previous) };
}

/** A share as a percentage to one decimal place */
export const percent = (part: number, total: number) =>
  total ? Math.round((part / total) * 1000) / 10 : 0;

export function median(values: number[]) {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2
    ? sorted[middle]
    : Math.round((sorted[middle - 1] + sorted[middle]) / 2);
}

/** The largest groups first, as [name, count] pairs */
export function topCounts(names: string[], take: number) {
  const counts = new Map<string, number>();
  for (const name of names) counts.set(name, (counts.get(name) ?? 0) + 1);
  return [...counts].sort((a, b) => b[1] - a[1]).slice(0, take);
}
