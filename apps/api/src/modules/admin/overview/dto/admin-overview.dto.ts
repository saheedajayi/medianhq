export type OverviewRangeDays = 7 | 30;

export interface OverviewAlert {
  id: string;
  kind:
    | 'MENTOR_NO_SHOW'
    | 'REFUND_FAILED'
    | 'APPLICATIONS_WAITING'
    | 'CONTENT_FLAGGED'
    | 'PAYOUT_FAILED';
  severity: 'URGENT' | 'NEEDS_REVIEW';
  title: string;
  detail: string;
  occurredAt: Date;
}
