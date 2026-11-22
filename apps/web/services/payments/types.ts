export interface InitializePaymentResponse {
  success: boolean;
  authorizationUrl?: string;
  reference?: string;
  amount?: number;
  currency?: string;
  isFree?: boolean;
  status?: string;
}

export interface PaymentQuote {
  amount: number;
  currency: string;
  provider: "PAYSTACK" | "FLUTTERWAVE";
}

export interface VerifyPaymentResponse {
  success: boolean;
  verified: boolean;
  booking: any;
}
