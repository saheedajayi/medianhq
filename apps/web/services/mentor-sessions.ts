import { apiClient } from "./api-client";

export type MentorSessionDto = { id: string; title: string; description: string; durationMinutes: number; price: number; type: "ONE_ON_ONE" | "GROUP"; isLive: boolean; maxCapacity?: number | null; };
export type MentorSessionInput = { title: string; description: string; durationMinutes: number; price?: number; type?: "ONE_ON_ONE" | "GROUP"; maxCapacity?: number; flyerUrl?: string; };
export type AvailabilityInput = { dayOfWeek: number; startTime: string; endTime: string; isActive?: boolean };
export const mentorSessionsService = {
  list() { return apiClient.get<MentorSessionDto[]>("/sessions/mentor"); },
  create(payload: MentorSessionInput) { return apiClient.post<MentorSessionDto>("/sessions/mentor", payload); },
  update(id: string, payload: Partial<MentorSessionInput> & { isLive?: boolean }) { return apiClient.patch<MentorSessionDto>(`/sessions/mentor/${id}`, payload); },
  remove(id: string) { return apiClient.delete<{ id: string; deleted: boolean }>(`/sessions/mentor/${id}`); },
  getAvailability() { return apiClient.get<AvailabilityInput[]>("/sessions/mentor/availability"); },
  saveAvailability(payload: AvailabilityInput[]) { return apiClient.put<AvailabilityInput[]>("/sessions/mentor/availability", payload); },
};
