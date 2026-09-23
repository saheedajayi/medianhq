import { apiClient } from "./api-client";

const PAYMENTS_PATH = "/payments";

export interface InitializePaymentResponse {
  success: boolean;
  authorizationUrl?: string;
  reference?: string;
  amount?: number;
  currency?: string;
  isFree?: boolean;
  status?: string;
}

export const paymentsService = {
  initialize(bookingId: string) {
    return apiClient
      .post<InitializePaymentResponse>(`${PAYMENTS_PATH}/initialize/${bookingId}`, {})
      .then((r) => r.data);
  },
  verify(reference: string) {
    return apiClient
      .get<{ success: boolean; verified: boolean; booking: any }>(
        `${PAYMENTS_PATH}/verify/${reference}`
      )
      .then((r) => r.data);
  },
};
