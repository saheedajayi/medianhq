"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { ApiError } from "@/services/api-client";
import {
  bookingsService,
  type AvailableDay,
  type DeclineBookingPayload,
  type MenteeFeedbackPayload,
  type BookingMutationResponse,
  type BookingResponse,
  type CancelBookingPayload,
  type CreateBookingPayload,
  type RescheduleBookingPayload,
  type RoomTokenResponse,
} from "@/services/bookings";
import { bookingsQueryKeys } from "./query-keys";

export const useMyBookings = (options?: { enabled?: boolean }) => {
  return useQuery<BookingResponse[], ApiError>({
    queryKey: bookingsQueryKeys.mine(),
    queryFn: async () => {
      const response = await bookingsService.getMine();
      return response.data;
    },
    enabled: options?.enabled,
  });
};

// Any booking change affects every screen that lists the user's bookings
const useInvalidateBookings = () => {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: bookingsQueryKeys.all });
};

export const useCreateBooking = () => {
  const invalidateBookings = useInvalidateBookings();

  return useMutation<BookingMutationResponse, ApiError, CreateBookingPayload>({
    mutationKey: bookingsQueryKeys.create(),
    mutationFn: async (payload) => {
      const response = await bookingsService.create(payload);
      return response.data;
    },
    onSuccess: invalidateBookings,
  });
};

export const useCancelBooking = () => {
  const invalidateBookings = useInvalidateBookings();

  return useMutation<BookingMutationResponse, ApiError, CancelBookingPayload>({
    mutationKey: bookingsQueryKeys.cancel(),
    mutationFn: async ({ id, reason }) => {
      const response = await bookingsService.cancel(id, reason);
      return response.data;
    },
    onSuccess: invalidateBookings,
  });
};

export const useRescheduleBooking = () => {
  const invalidateBookings = useInvalidateBookings();

  return useMutation<BookingMutationResponse, ApiError, RescheduleBookingPayload>({
    mutationKey: bookingsQueryKeys.reschedule(),
    mutationFn: async ({ id, startsAt, reason }) => {
      const response = await bookingsService.reschedule(id, startsAt, reason);
      return response.data;
    },
    onSuccess: invalidateBookings,
  });
};

export const useBookingRoomToken = () => {
  return useMutation<RoomTokenResponse, ApiError, string>({
    mutationKey: bookingsQueryKeys.roomToken(),
    mutationFn: async (bookingId) => {
      const response = await bookingsService.getRoomToken(bookingId);
      return response.data;
    },
  });
};

export const useMentorAvailability = (
  mentorId: string | undefined,
  durationMinutes?: number,
  excludeBookingId?: string
) => {
  return useQuery<AvailableDay[], ApiError>({
    queryKey: bookingsQueryKeys.availability(mentorId ?? "", durationMinutes, excludeBookingId),
    queryFn: async () => {
      const response = await bookingsService.getAvailability(
        mentorId!,
        durationMinutes,
        excludeBookingId
      );
      return response.data;
    },
    enabled: !!mentorId,
  });
};

export const useAcceptBooking = () => {
  const invalidateBookings = useInvalidateBookings();

  return useMutation<BookingMutationResponse, ApiError, string>({
    mutationKey: bookingsQueryKeys.accept(),
    mutationFn: async (id) => {
      const response = await bookingsService.accept(id);
      return response.data;
    },
    onSuccess: invalidateBookings,
  });
};

export const useDeclineBooking = () => {
  const invalidateBookings = useInvalidateBookings();

  return useMutation<{ success: boolean; refundAmount: number }, ApiError, DeclineBookingPayload>({
    mutationKey: bookingsQueryKeys.decline(),
    mutationFn: async ({ id, reason }) => {
      const response = await bookingsService.decline(id, reason);
      return response.data;
    },
    onSuccess: invalidateBookings,
  });
};

export const useSubmitMenteeFeedback = () => {
  const invalidateBookings = useInvalidateBookings();

  return useMutation<{ success: boolean }, ApiError, MenteeFeedbackPayload>({
    mutationKey: bookingsQueryKeys.feedback(),
    mutationFn: async (payload) => {
      const response = await bookingsService.submitFeedback(payload);
      return response.data;
    },
    onSuccess: invalidateBookings,
  });
};
