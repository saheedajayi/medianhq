"use client";

import { useMutation } from "@tanstack/react-query";

import type { ApiError } from "@/services/api-client";
import {
  contactService,
  type ContactMessagePayload,
  type ContactMessageResponse,
} from "@/services/contact";
import { contactQueryKeys } from "./query-keys";

export const useSendContactMessage = () => {
  return useMutation<ContactMessageResponse, ApiError, ContactMessagePayload>({
    mutationKey: contactQueryKeys.send(),
    mutationFn: async (payload) => {
      const response = await contactService.send(payload);
      return response.data;
    },
  });
};
