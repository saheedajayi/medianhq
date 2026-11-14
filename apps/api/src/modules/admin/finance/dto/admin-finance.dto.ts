export const REVENUE_PERIODS = [
  'daily',
  'weekly',
  'monthly',
  'quarterly',
  'annually',
] as const;
export type RevenuePeriod = (typeof REVENUE_PERIODS)[number];

export const PAYOUT_STATUSES = [
  'PAID',
  'PROCESSING',
  'PENDING',
  'FAILED',
  'REJECTED',
] as const;
export type PayoutStatus = (typeof PAYOUT_STATUSES)[number];

export const REFUND_STATUSES = [
  'COMPLETED',
  'PENDING',
  'FAILED',
  'REJECTED',
] as const;
export type RefundStatus = (typeof REFUND_STATUSES)[number];

/** An optional note, for rejecting a payout or a refund */
export interface FinanceReasonDto {
  reason?: string;
}

export interface RefundNoteDto {
  note?: string;
}

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
