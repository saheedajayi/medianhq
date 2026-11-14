export const REVENUE_PERIODS = [
  'daily',
  'weekly',
  'monthly',
  'quarterly',
  'annually',
] as const;
export type RevenuePeriod = (typeof REVENUE_PERIODS)[number];

export type PayoutStatus = 'PAID' | 'PENDING' | 'FAILED';
export type RefundStatus = 'COMPLETED' | 'PENDING' | 'FAILED';

/** Query strings as they arrive */
export interface RevenueQueryDto {
  period?: string;
}

export interface PayoutsQueryDto {
  status?: string;
  search?: string;
  page?: number | string;
}

export interface ServiceReportQueryDto {
  search?: string;
  page?: number | string;
  /** "all" shows the expanded report */
  view?: string;
}

export interface RefundsQueryDto {
  search?: string;
  status?: string;
  range?: string;
  page?: number | string;
}

export interface RefundsFilters {
  search?: string;
  status?: RefundStatus;
  range?: '7d' | '30d' | '90d';
}
