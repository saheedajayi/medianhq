export const VISITOR_PERIODS = [
  'daily',
  'weekly',
  'monthly',
  'yearly',
] as const;
export type VisitorPeriod = (typeof VISITOR_PERIODS)[number];

/** Query string for the visitors tab, as it arrives */
export interface VisitorsQueryDto {
  period?: string;
}

/** A count with its change on the 7 days before; null when there is nothing to compare with */
export interface AnalyticsStat {
  value: number;
  changePct: number | null;
}
