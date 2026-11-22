const FLUTTERWAVE_API = 'https://api.flutterwave.com/v3';

/**
 * Currencies Flutterwave takes payments in for us. Naira stays on Paystack.
 * From Flutterwave's coverage page (Oct 2026). CAD, INR, COP and SLE are on
 * older Flutterwave lists but not on the coverage page, so they are left out
 * until a test payment confirms them.
 */
export const FLUTTERWAVE_CURRENCIES = [
  'USD',
  'GBP',
  'EUR',
  'GHS',
  'KES',
  'ZAR',
  'EGP',
  'RWF',
  'TZS',
  'UGX',
  'ZMW',
  'XOF',
  'XAF',
] as const;
export type FlutterwaveCurrency = (typeof FLUTTERWAVE_CURRENCIES)[number];

export const isFlutterwaveCurrency = (
  currency: unknown,
): currency is FlutterwaveCurrency =>
  FLUTTERWAVE_CURRENCIES.includes(currency as FlutterwaveCurrency);

type FlutterwaveResponse<T> = {
  status?: string;
  message?: string;
  data?: T | null;
};

export type FlutterwaveTransaction = {
  id: number;
  tx_ref: string;
  status: string;
  amount: number | string;
  currency: string;
};

export type FlutterwaveRefund = {
  id: number;
  status: string;
  amount_refunded?: number | string;
};

export class FlutterwaveError extends Error {}

/** Thin wrapper over Flutterwave's v3 API; amounts are in whole currency units */
export class FlutterwaveClient {
  constructor(private readonly secretKey: string) {}

  /** A hosted checkout link the mentee is sent to */
  async createCheckout(input: {
    reference: string;
    amount: number;
    currency: FlutterwaveCurrency;
    redirectUrl: string;
    customer: { email: string; name: string };
    meta: Record<string, string>;
  }) {
    const data = await this.request<{ link: string }>('/payments', {
      method: 'POST',
      body: {
        tx_ref: input.reference,
        amount: input.amount,
        currency: input.currency,
        redirect_url: input.redirectUrl,
        customer: input.customer,
        customizations: { title: 'Median' },
        meta: input.meta,
      },
    });
    return data.link;
  }

  findTransaction(reference: string) {
    return this.request<FlutterwaveTransaction>(
      `/transactions/verify_by_reference?tx_ref=${encodeURIComponent(reference)}`,
    );
  }

  refund(transactionId: number, amount: number) {
    return this.request<FlutterwaveRefund>(
      `/transactions/${transactionId}/refund`,
      { method: 'POST', body: { amount } },
    );
  }

  findRefund(refundId: string) {
    return this.request<FlutterwaveRefund>(
      `/refunds/${encodeURIComponent(refundId)}`,
    );
  }

  private async request<T>(
    path: string,
    options: { method?: string; body?: unknown } = {},
  ): Promise<T> {
    const response = await fetch(`${FLUTTERWAVE_API}${path}`, {
      method: options.method ?? 'GET',
      headers: {
        Authorization: `Bearer ${this.secretKey}`,
        'Content-Type': 'application/json',
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
      signal: AbortSignal.timeout(15_000),
    });
    const payload = (await response
      .json()
      .catch(() => ({}))) as FlutterwaveResponse<T>;
    if (!response.ok || payload.status !== 'success' || !payload.data) {
      throw new FlutterwaveError(
        payload.message || `Flutterwave request failed with ${response.status}`,
      );
    }
    return payload.data;
  }
}

/** A charge counts only when Flutterwave reports it successful in the right currency and amount */
export function isPaidTransaction(
  transaction: FlutterwaveTransaction,
  expected: { reference: string; amount: number; currency: string },
) {
  return (
    transaction.status === 'successful' &&
    transaction.tx_ref === expected.reference &&
    transaction.currency === expected.currency &&
    Number(transaction.amount) >= expected.amount
  );
}

/**
 * Flutterwave's refund statuses: "completed…" ones are done on its side,
 * "pending…" and "processing" are still going. Anything else counts as failed.
 */
export function refundStatusFor(status: string) {
  if (status.startsWith('completed')) return 'PROCESSED' as const;
  if (status.startsWith('pending') || status === 'processing') {
    return 'PENDING' as const;
  }
  return 'FAILED' as const;
}
