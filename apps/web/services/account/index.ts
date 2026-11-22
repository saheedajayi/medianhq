import { apiClient } from "@/services/api-client";

const ACCOUNT_PATH = "/account";

export interface DeleteAccountPayload {
  acknowledged: boolean;
  /** Left out for accounts that only sign in with Google or LinkedIn */
  password?: string;
}

export interface DeletionSchedule {
  /** ISO time the account will be erased unless the person signs back in */
  scheduledFor: string;
  graceDays: number;
}

export const accountService = {
  deactivate() {
    return apiClient.post(`${ACCOUNT_PATH}/deactivate`);
  },
  scheduleDeletion(payload: DeleteAccountPayload) {
    return apiClient.post<DeletionSchedule>(`${ACCOUNT_PATH}/delete`, payload);
  },
  confirmDeletion() {
    return apiClient.post(`${ACCOUNT_PATH}/delete/confirm`);
  },
  cancelDeletion() {
    return apiClient.post(`${ACCOUNT_PATH}/delete/cancel`);
  },
};
