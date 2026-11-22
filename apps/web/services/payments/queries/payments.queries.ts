"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { ApiError } from "@/services/api-client";
import { bookingsQueryKeys } from "@/services/bookings/queries/query-keys";
import {
  paymentsService,
  type InitializePaymentResponse,
  type PaymentQuote,
  type VerifyPaymentResponse,
} from "@/services/payments";
import { paymentsQueryKeys } from "./query-keys";

/** What a booking will charge in a currency other than naira; naira needs no quote */
export const usePaymentQuote = (bookingId: string | undefined, currency: string) => {
  return useQuery<PaymentQuote, ApiError>({
    queryKey: paymentsQueryKeys.quote(bookingId ?? "", currency),
    queryFn: async () => (await paymentsService.quote(bookingId as string, currency)).data,
    enabled: !!bookingId && currency !== "NGN",
    retry: false,
  });
};

export const useInitializePayment = () => {
  return useMutation<InitializePaymentResponse, ApiError, { bookingId: string; currency: string }>({
    mutationKey: paymentsQueryKeys.initialize(),
    mutationFn: async ({ bookingId, currency }) => {
      const response = await paymentsService.initialize(bookingId, currency);
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
