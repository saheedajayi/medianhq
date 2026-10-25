import { apiClient } from "@/services/api-client";
import type {
  AvailabilityInput,
  MentorSessionDto,
  MentorSessionInput,
  UpdateMentorSessionPayload,
} from "./types";

const MENTOR_SESSIONS_PATH = "/sessions/mentor";

export const mentorSessionsService = {
  list() {
    return apiClient.get<MentorSessionDto[]>(MENTOR_SESSIONS_PATH);
  },
  create(payload: MentorSessionInput) {
    return apiClient.post<MentorSessionDto>(MENTOR_SESSIONS_PATH, payload);
  },
  update(id: string, payload: UpdateMentorSessionPayload["payload"]) {
    return apiClient.patch<MentorSessionDto>(`${MENTOR_SESSIONS_PATH}/${id}`, payload);
  },
  remove(id: string) {
    return apiClient.delete<{ id: string; deleted: boolean }>(
      `${MENTOR_SESSIONS_PATH}/${id}`
    );
  },
  getAvailability() {
    return apiClient.get<AvailabilityInput[]>(`${MENTOR_SESSIONS_PATH}/availability`);
  },
  saveAvailability(payload: AvailabilityInput[]) {
    return apiClient.put<AvailabilityInput[]>(
      `${MENTOR_SESSIONS_PATH}/availability`,
      payload
    );
  },
};

export type {
  AvailabilityInput,
  MentorSessionDto,
  MentorSessionInput,
  UpdateMentorSessionPayload,
} from "./types";
