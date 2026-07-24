import { apiClient } from "@/services/api-client";
import type {
  AuthResponse,
  AuthUser,
  LoginPayload,
  RegisterPayload,
} from "./types";

const AUTH_PATH = "/auth";

export const authService = {
  register(payload: RegisterPayload) {
    return apiClient.post<AuthResponse>(`${AUTH_PATH}/register`, payload);
  },

  login(payload: LoginPayload) {
    return apiClient.post<AuthResponse>(`${AUTH_PATH}/login`, payload);
  },

  me() {
    return apiClient.get<AuthUser>(`${AUTH_PATH}/me`);
  },

  logout() {
    return apiClient.post<{ message?: string }>(`${AUTH_PATH}/logout`);
  },
};

export type {
  AuthResponse,
  AuthRole,
  AuthUser,
  LoginPayload,
  RegisterPayload,
} from "./types";
