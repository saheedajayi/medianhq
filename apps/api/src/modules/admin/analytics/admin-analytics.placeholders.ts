/**
 * PLACEHOLDER DATA. Searches, filter use and site visits are not tracked, so
 * nothing here is measured. It stands in for those parts of the analytics page
 * until tracking exists. Replace with a real source and delete this file.
 */
import type { VisitorPeriod } from './dto/admin-analytics.dto';

/** Roughly how many mentees who set a goal go on to search; a stand-in until searches are logged */
export const placeholderFirstSearches = (goalSetups: number) =>
  Math.round(goalSetups * 0.87);

export const placeholderSearchAnalytics = () => ({
  totalSearches: { value: 12000, changePct: 23 },
  filterUsers: { value: 7083, changePct: 18 },
  bookingRatePct: { value: 15.4, changePct: 2.5 },
  topQueries: [
    { query: 'Career Guidance', searches: 600, pctOfTotal: 70 },
    { query: 'Product Design', searches: 520, pctOfTotal: 55 },
    { query: 'Financial Mentor', searches: 400, pctOfTotal: 45 },
    { query: 'Data Analysis', searches: 370, pctOfTotal: 42 },
    { query: 'Interview Prep', searches: 200, pctOfTotal: 28 },
  ],
  filterUsage: [
    { filter: 'Location', usage: 6346, pctOfTotal: 28.3 },
    { filter: 'Gender', usage: 6300, pctOfTotal: 22.3 },
    { filter: 'Language', usage: 6300, pctOfTotal: 22.3 },
    { filter: 'Expertise', usage: 5986, pctOfTotal: 21.9 },
    { filter: 'Availability', usage: 4000, pctOfTotal: 19.5 },
  ],
  /** One figure per day, oldest first */
  dailyBookingRatePct: [14, 16, 19, 19, 22, 27, 30],
  dailySearches: [1500, 1500, 1500, 1500, 2400, 1500, 3000],
  funnel: [
    { step: 'Searches', count: 12649, pct: 100 },
    { step: 'Profile views', count: 8297, pct: 65.6 },
    { step: 'Booking clicks', count: 2972, pct: 23.5 },
    { step: 'Completed booking', count: 1568, pct: 12.4 },
  ],
});

const VISITOR_POINTS: Record<
  VisitorPeriod,
  { count: number; label: (index: number) => string }
> = {
  daily: { count: 31, label: (index) => `Oct ${index + 1}` },
  weekly: { count: 12, label: (index) => `Wk${index + 1}` },
  monthly: {
    count: 12,
    label: (index) =>
      [
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'Jun',
        'Jul',
        'Aug',
        'Sep',
        'Oct',
        'Nov',
        'Dec',
      ][index],
  },
  yearly: { count: 5, label: (index) => String(2022 + index) },
};

const VISITOR_SCALE: Record<VisitorPeriod, number> = {
  daily: 1,
  weekly: 7,
  monthly: 30,
  yearly: 365,
};

export const placeholderVisitors = (period: VisitorPeriod) => {
  const { count, label } = VISITOR_POINTS[period];
  return {
    period,
    stats: {
      daily: { value: 8475, changePct: 16 },
      weekly: { value: 52475, changePct: 16 },
      monthly: { value: 223494, changePct: 14 },
      yearly: { value: 2460000, changePct: 17 },
    },
    // A gentle upward drift with a repeating wobble, so the line has some shape
    series: Array.from({ length: count }, (_, index) => ({
      label: label(index),
      visitors:
        Math.round(
          900 + index * 14 + [0, 30, 50, 80, 110, -30, 60][index % 7],
        ) * VISITOR_SCALE[period],
    })),
  };
};
