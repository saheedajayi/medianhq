const PAYSTACK_API = 'https://api.paystack.co';

export type TransferStatus =
  | 'success'
  | 'pending'
  | 'otp'
  | 'failed'
  | 'reversed'
  | 'abandoned'
  | 'blocked'
  | 'rejected'
  | 'received';

type PaystackResponse<T> = { status: boolean; message?: string; data?: T };

export class PaystackError extends Error {
  constructor(
    message: string,
    readonly statusCode?: number,
  ) {
    super(message);
  }
}

/** Thin wrapper over the Paystack Transfers API; amounts are in naira and sent as kobo */
export class PaystackTransfers {
  constructor(private readonly secretKey: string) {}

  /** Who the money goes to: a Nigerian bank account */
  async createRecipient(input: {
    name: string;
    accountNumber: string;
    bankCode: string;
  }) {
    const data = await this.request<{ recipient_code: string }>(
      '/transferrecipient',
      {
        method: 'POST',
        body: {
          type: 'nuban',
          name: input.name,
          account_number: input.accountNumber,
          bank_code: input.bankCode,
          currency: 'NGN',
        },
      },
    );
    return data.recipient_code;
  }

  async initiateTransfer(input: {
    amount: number;
    recipientCode: string;
    reference: string;
    reason: string;
  }) {
    return this.request<{ status: TransferStatus; transfer_code: string }>(
      '/transfer',
      {
        method: 'POST',
        body: {
          source: 'balance',
          amount: input.amount * 100,
          recipient: input.recipientCode,
          reference: input.reference,
          reason: input.reason,
        },
      },
    );
  }

  async verifyTransfer(reference: string) {
    return this.request<{ status: TransferStatus; transfer_code: string }>(
      `/transfer/verify/${encodeURIComponent(reference)}`,
    );
  }

  async listBanks() {
    return this.request<{ name: string; code: string }[]>(
      '/bank?country=nigeria&perPage=100',
    );
  }

  /** The name the bank holds for an account, so a mentor can confirm it is theirs */
  async resolveAccount(input: { accountNumber: string; bankCode: string }) {
    const query = new URLSearchParams({
      account_number: input.accountNumber,
      bank_code: input.bankCode,
    });
    const data = await this.request<{ account_name: string }>(
      `/bank/resolve?${query.toString()}`,
    );
    return data.account_name;
  }

  private async request<T>(
    path: string,
    options: { method?: string; body?: unknown } = {},
  ): Promise<T> {
    const response = await fetch(`${PAYSTACK_API}${path}`, {
      method: options.method ?? 'GET',
      headers: {
        Authorization: `Bearer ${this.secretKey}`,
        'Content-Type': 'application/json',
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
    });
    const payload = (await response.json()) as PaystackResponse<T>;
    if (!response.ok || !payload.status || !payload.data) {
      throw new PaystackError(
        payload.message || `Paystack request failed with ${response.status}`,
        response.status,
      );
    }
    return payload.data;
  }
}

/** What a Paystack transfer status means for the payout */
export function payoutStatusFor(status: TransferStatus) {
  if (status === 'success') return 'PROCESSED' as const;
  if (
    ['failed', 'reversed', 'abandoned', 'blocked', 'rejected'].includes(status)
  ) {
    return 'FAILED' as const;
  }
  // pending, received and otp are still in flight
  return 'PROCESSING' as const;
}
