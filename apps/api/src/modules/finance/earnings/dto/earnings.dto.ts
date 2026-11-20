export const EARNING_STATUSES = [
  'PENDING',
  'PAID_OUT',
  'DISPUTED',
  'REFUNDED',
] as const;
export type EarningStatus = (typeof EARNING_STATUSES)[number];

/** How a mentor sees a payout: the admin's review steps all read as "processing" */
export const MENTOR_PAYOUT_STATUSES = [
  'PROCESSING',
  'COMPLETED',
  'FAILED',
] as const;
export type MentorPayoutStatus = (typeof MENTOR_PAYOUT_STATUSES)[number];

/** Query strings as they arrive */
export interface EarningsQueryDto {
  page?: number | string;
  /** "all" shows the longer list */
  view?: string;
}

export interface PayoutsQueryDto {
  page?: number | string;
}

export interface PayoutAccountDto {
  bankCode?: string;
  accountNumber?: string;
}

export interface RequestPayoutDto {
  password?: string;
}
