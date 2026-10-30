import { apiClient } from "@/services/api-client";
import type {
  CareerInfo,
  Education,
  EducationPayload,
  MySettings,
  SocialLink,
  SocialLinksPayload,
  UpdateProfilePayload,
  UpdateSettingsPayload,
  WorkExperience,
  WorkExperiencePayload,
} from "./types";

const SETTINGS_PATH = "/settings";

export const settingsService = {
  getMine() {
    return apiClient.get<MySettings>(`${SETTINGS_PATH}/me`);
  },
  update(payload: UpdateSettingsPayload) {
    return apiClient.patch(`${SETTINGS_PATH}/me`, payload);
  },
  updateProfile(payload: UpdateProfilePayload) {
    return apiClient.patch(`${SETTINGS_PATH}/profile`, payload);
  },
  getCareer() {
    return apiClient.get<CareerInfo>(`${SETTINGS_PATH}/career`);
  },
  saveExperience(payload: WorkExperiencePayload, id?: string) {
    return id
      ? apiClient.patch<WorkExperience>(`${SETTINGS_PATH}/experiences/${id}`, payload)
      : apiClient.post<WorkExperience>(`${SETTINGS_PATH}/experiences`, payload);
  },
  deleteExperience(id: string) {
    return apiClient.delete(`${SETTINGS_PATH}/experiences/${id}`);
  },
  saveEducation(payload: EducationPayload, id?: string) {
    return id
      ? apiClient.patch<Education>(`${SETTINGS_PATH}/educations/${id}`, payload)
      : apiClient.post<Education>(`${SETTINGS_PATH}/educations`, payload);
  },
  deleteEducation(id: string) {
    return apiClient.delete(`${SETTINGS_PATH}/educations/${id}`);
  },
  getSocials() {
    return apiClient.get<SocialLink[]>(`${SETTINGS_PATH}/socials`);
  },
  saveSocials(payload: SocialLinksPayload) {
    return apiClient.put<SocialLink[]>(`${SETTINGS_PATH}/socials`, payload);
  },
};

export * from "./types";
