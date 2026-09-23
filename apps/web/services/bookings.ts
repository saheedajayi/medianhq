import { apiClient } from "./api-client";

const BOOKINGS_PATH = "/bookings";

export interface CreateBookingPayload {
  mentorId: string;
  startsAt: string;
  durationMinutes: number;
  title?: string;
  price?: number;
  notes?: string;
  goals?: string[];
}

export interface BookingResponse {
  id: string;
  title: string;
  mentorName: string;
  mentorRole: string;
  mentorAvatar: string;
  linkedinUrl?: string;
  timeFormatted: string;
  relativeDate: string;
  fullDateTime: string;
  duration: string;
  durationMinutes: number;
  price: string;
  status: string;
  tab: "upcoming" | "pending" | "past" | "cancelled";
  note?: string;
  meetingUrl?: string;
  isReadyToJoin?: boolean;
  rating?: number;
  review?: string;
  hasMenteeReviewed?: boolean;
  payment?: {
    id: string;
    amount: number;
    currency: string;
    status: string;
  };
  isMentee?: boolean;
}

export const bookingsService = {
  create(payload: CreateBookingPayload) {
    return apiClient
      .post<{ success: boolean; booking: any }>(BOOKINGS_PATH, payload)
      .then((r) => r.data);
  },
  getMine() {
    return apiClient
      .get<BookingResponse[]>(`${BOOKINGS_PATH}/me`)
      .then((r) => r.data);
  },
  getById(id: string) {
    return apiClient.get<any>(`${BOOKINGS_PATH}/${id}`).then((r) => r.data);
  },
  cancel(id: string, reason?: string) {
    return apiClient
      .patch<{ success: boolean; booking: any }>(`${BOOKINGS_PATH}/${id}/cancel`, { reason })
      .then((r) => r.data);
  },
  reschedule(id: string, startsAt: string) {
    return apiClient
      .patch<{ success: boolean; booking: any }>(`${BOOKINGS_PATH}/${id}/reschedule`, { startsAt })
      .then((r) => r.data);
  },
};
