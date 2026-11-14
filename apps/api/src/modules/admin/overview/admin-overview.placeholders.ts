/**
 * PLACEHOLDER DATA. Nothing here is measured: these stand in for parts of the
 * admin overview that have no data source yet (churn tracking, service
 * monitoring, content reports, payout failures). Replace each with a real
 * source and delete this file.
 */

const MINUTE_MS = 60 * 1000;

/** A stable made-up churn count for a YYYY-MM-DD day */
export const placeholderChurnedUsers = (dayKey: string) =>
  18 + ((Number(dayKey.slice(-2)) * 7) % 9);

export const placeholderSystemHealth = (now: Date) => ({
  status: 'DEGRADED' as const,
  checkedAt: new Date(now.getTime() - MINUTE_MS),
  note: '30-day uptime',
  items: [
    {
      label: 'API uptime',
      value: '99.98%',
      status: 'OPERATIONAL' as const,
      statusLabel: 'Operational',
    },
    {
      label: 'Video-room latency',
      value: '218 ms',
      status: 'OPERATIONAL' as const,
      statusLabel: 'p95 · Operational',
    },
    {
      label: 'Payment gateways',
      value: 'Paystack operational',
      status: 'DEGRADED' as const,
      statusLabel: 'Flutterwave transfers delayed',
    },
  ],
});

export const placeholderAlerts = (now: Date) => [
  {
    id: 'placeholder:content-flagged',
    kind: 'CONTENT_FLAGGED' as const,
    severity: 'NEEDS_REVIEW' as const,
    title: 'Community content flagged',
    detail: 'RPT-0284 · 2 reports · career advice thread',
    occurredAt: new Date(now.getTime() - 14 * MINUTE_MS),
  },
  {
    id: 'placeholder:payouts-failed',
    kind: 'PAYOUT_FAILED' as const,
    severity: 'URGENT' as const,
    title: 'Two mentor payouts failed',
    detail: 'PAY-0841, PAY-0842 · Flutterwave transfer',
    occurredAt: new Date(now.getTime() - 22 * MINUTE_MS),
  },
];
