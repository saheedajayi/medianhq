import { apiClient } from "@/services/api-client";
import type { InitializePaymentResponse, VerifyPaymentResponse } from "./types";

const PAYMENTS_PATH = "/payments";

export const paymentsService = {
  initialize(bookingId: string) {
    return apiClient.post<InitializePaymentResponse>(
      `${PAYMENTS_PATH}/initialize/${bookingId}`,
      {}
    );
  },
  verify(reference: string) {
    return apiClient.get<VerifyPaymentResponse>(`${PAYMENTS_PATH}/verify/${reference}`);
  },
};

export type { InitializePaymentResponse, VerifyPaymentResponse } from "./types";
