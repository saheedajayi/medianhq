export type BucketPeriod =
  | 'daily'
  | 'weekly'
  | 'monthly'
  | 'quarterly'
  | 'annually';

const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;
// Africa/Lagos is UTC+1 all year, so its calendar is UTC shifted by an hour
const LAGOS_OFFSET_MS = HOUR_MS;

export type TimeBucket = {
  label: string;
  /** Start of the bucket, inclusive */
  from: Date;
  /** End of the bucket, exclusive */
  to: Date;
};

/** How many buckets a chart shows for each period */
const BUCKET_COUNT: Record<BucketPeriod, number> = {
  daily: 7,
  weekly: 7,
  monthly: 7,
  quarterly: 4,
  annually: 4,
};

/** A Lagos calendar date, as the UTC instant it begins */
const lagosDate = (year: number, month: number, day = 1) =>
  new Date(Date.UTC(year, month, day) - LAGOS_OFFSET_MS);

const monthName = (date: Date) =>
  new Date(date.getTime() + LAGOS_OFFSET_MS).toLocaleDateString('en-US', {
    month: 'short',
    timeZone: 'UTC',
  });

/**
 * The buckets a chart covers, oldest first and ending with the one
 * that contains `now`. One extra bucket is added at the front so the first
 * shown bucket has something to measure its growth against.
 */
export function buildTimeBuckets(
  period: BucketPeriod,
  now: Date,
): TimeBucket[] {
  const lagosNow = new Date(now.getTime() + LAGOS_OFFSET_MS);
  const year = lagosNow.getUTCFullYear();
  const month = lagosNow.getUTCMonth();
  const day = lagosNow.getUTCDate();
  const count = BUCKET_COUNT[period] + 1;

  return Array.from({ length: count }, (_, index) => {
    // 0 for the current bucket, counting up into the past
    const back = count - 1 - index;

    switch (period) {
      case 'daily': {
        const from = lagosDate(year, month, day - back);
        return {
          label: `${monthName(from)} ${new Date(from.getTime() + LAGOS_OFFSET_MS).getUTCDate()}`,
          from,
          to: new Date(from.getTime() + DAY_MS),
        };
      }
      case 'weekly': {
        // Seven-day blocks ending today, numbered from the oldest shown
        const to = lagosDate(year, month, day + 1 - back * 7);
        return {
          label: `Wk${index}`,
          from: new Date(to.getTime() - 7 * DAY_MS),
          to,
        };
      }
      case 'monthly': {
        const from = lagosDate(year, month - back);
        return {
          label: monthName(from),
          from,
          to: lagosDate(year, month - back + 1),
        };
      }
      case 'quarterly': {
        const quarterStart = Math.floor(month / 3) * 3 - back * 3;
        const from = lagosDate(year, quarterStart);
        return {
          label: monthName(from),
          from,
          to: lagosDate(year, quarterStart + 3),
        };
      }
      case 'annually':
        return {
          label: String(year - back),
          from: lagosDate(year - back, 0),
          to: lagosDate(year - back + 1, 0),
        };
    }
  });
}

/** Growth on the previous value as a whole percentage; null when there is nothing to compare with */
export const growthPct = (current: number, previous: number) =>
  previous > 0 ? Math.round(((current - previous) / previous) * 100) : null;
