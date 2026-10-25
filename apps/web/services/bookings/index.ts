import { apiClient } from "@/services/api-client";
import type {
  AvailableDay,
  BookingMutationResponse,
  BookingResponse,
  CreateBookingPayload,
  MenteeFeedbackPayload,
  RoomTokenResponse,
} from "./types";

const BOOKINGS_PATH = "/bookings";

export const bookingsService = {
  create(payload: CreateBookingPayload) {
    return apiClient.post<BookingMutationResponse>(BOOKINGS_PATH, payload);
  },
  getMine() {
    return apiClient.get<BookingResponse[]>(`${BOOKINGS_PATH}/me`);
  },
  getById(id: string) {
    return apiClient.get<any>(`${BOOKINGS_PATH}/${id}`);
  },
  cancel(id: string, reason?: string) {
    return apiClient.patch<BookingMutationResponse>(
      `${BOOKINGS_PATH}/${id}/cancel`,
      { reason }
    );
  },
  reschedule(id: string, startsAt: string, reason?: string) {
    return apiClient.patch<BookingMutationResponse>(
      `${BOOKINGS_PATH}/${id}/reschedule`,
      { startsAt, reason }
    );
  },
  accept(id: string) {
    return apiClient.patch<BookingMutationResponse>(`${BOOKINGS_PATH}/${id}/accept`);
  },
  decline(id: string, reason?: string) {
    return apiClient.patch<{ success: boolean; refundAmount: number }>(
      `${BOOKINGS_PATH}/${id}/decline`,
      { reason }
    );
  },
  submitFeedback({ bookingId, ...payload }: MenteeFeedbackPayload) {
    return apiClient.post<{ success: boolean }>(
      `${BOOKINGS_PATH}/${bookingId}/feedback`,
      payload
    );
  },
  /** Bookable start times for a mentor over the next two weeks */
  getAvailability(mentorId: string, durationMinutes?: number, excludeBookingId?: string) {
    return apiClient.get<AvailableDay[]>(`${BOOKINGS_PATH}/availability/${mentorId}`, {
      params: { duration: durationMinutes, excludeBookingId },
    });
  },
  getRoomToken(bookingId: string) {
    return apiClient.post<RoomTokenResponse>(
      `${BOOKINGS_PATH}/${bookingId}/room-token`
    );
  },
};

export type {
  AvailableDay,
  BookingActionItem,
  DeclineBookingPayload,
  MenteeFeedback,
  MenteeFeedbackPayload,
  BookingMutationResponse,
  BookingResponse,
  CancelBookingPayload,
  CreateBookingPayload,
  RescheduleBookingPayload,
  RoomTokenResponse,
} from "./types";
