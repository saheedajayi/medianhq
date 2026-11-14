"use client";

import { useMutation } from "@tanstack/react-query";

import type { ApiError } from "@/services/api-client";
import { emailsService, type UnsubscribePayload, type UnsubscribeResponse } from "@/services/emails";
import { emailsQueryKeys } from "./query-keys";

export const useUnsubscribe = () => {
  return useMutation<UnsubscribeResponse, ApiError, UnsubscribePayload>({
    mutationKey: emailsQueryKeys.unsubscribe(),
    mutationFn: async (payload) => {
      const response = await emailsService.unsubscribe(payload);
      return response.data;
    },
  });
};
