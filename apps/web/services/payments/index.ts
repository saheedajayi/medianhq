import { apiClient } from "@/services/api-client";
import type { InitializePaymentResponse, PaymentQuote, VerifyPaymentResponse } from "./types";

const PAYMENTS_PATH = "/payments";

export const paymentsService = {
  quote(bookingId: string, currency: string) {
    return apiClient.get<PaymentQuote>(`${PAYMENTS_PATH}/quote/${bookingId}`, { params: { currency } });
  },
  initialize(bookingId: string, currency = "NGN") {
    return apiClient.post<InitializePaymentResponse>(`${PAYMENTS_PATH}/initialize/${bookingId}`, { currency });
  },
  verify(reference: string) {
    return apiClient.get<VerifyPaymentResponse>(`${PAYMENTS_PATH}/verify/${reference}`);
  },
};

export type { InitializePaymentResponse, PaymentQuote, VerifyPaymentResponse } from "./types";
