"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { ApiError } from "@/services/api-client";
import { bookingsQueryKeys } from "@/services/bookings/queries/query-keys";
import {
  paymentsService,
  type InitializePaymentResponse,
  type VerifyPaymentResponse,
} from "@/services/payments";
import { paymentsQueryKeys } from "./query-keys";

export const useInitializePayment = () => {
  return useMutation<InitializePaymentResponse, ApiError, string>({
    mutationKey: paymentsQueryKeys.initialize(),
    mutationFn: async (bookingId) => {
      const response = await paymentsService.initialize(bookingId);
      return response.data;
    },
  });
};

// Verification confirms a booking server-side, so it runs once as a mutation, not a cached query
export const useVerifyPayment = () => {
  const queryClient = useQueryClient();

  return useMutation<VerifyPaymentResponse, ApiError, string>({
    mutationKey: paymentsQueryKeys.verify(),
    mutationFn: async (reference) => {
      const response = await paymentsService.verify(reference);
      return response.data;
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: bookingsQueryKeys.all });
    },
  });
};
