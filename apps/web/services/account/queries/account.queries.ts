"use client";

import { useMutation } from "@tanstack/react-query";

import {
  accountService,
  type DeleteAccountPayload,
  type DeletionSchedule,
} from "@/services/account";
import type { ApiError } from "@/services/api-client";

export const useDeactivateAccount = () =>
  useMutation<unknown, ApiError, void>({ mutationFn: () => accountService.deactivate() });

export const useScheduleAccountDeletion = () =>
  useMutation<DeletionSchedule, ApiError, DeleteAccountPayload>({
    mutationFn: async (payload) => (await accountService.scheduleDeletion(payload)).data,
  });

export const useConfirmAccountDeletion = () =>
  useMutation<unknown, ApiError, void>({ mutationFn: () => accountService.confirmDeletion() });

export const useCancelAccountDeletion = () =>
  useMutation<unknown, ApiError, void>({ mutationFn: () => accountService.cancelDeletion() });
