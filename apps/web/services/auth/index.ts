import { apiClient } from "@/services/api-client";
import type {
  AuthResponse,
  AuthUser,
  LoginPayload,
  RegisterPayload,
  VerifyEmailPayload,
  ResendVerificationPayload,
  ForgotPasswordPayload,
  ResetPasswordPayload,
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

  verifyEmail(payload: VerifyEmailPayload) {
    return apiClient.post<AuthResponse>(`${AUTH_PATH}/verify-email`, payload);
  },

  resendVerification(payload: ResendVerificationPayload) {
    return apiClient.post<{ message: string }>(`${AUTH_PATH}/resend-verification`, payload);
  },

  forgotPassword(payload: ForgotPasswordPayload) {
    return apiClient.post<{ message: string }>(`${AUTH_PATH}/forgot-password`, payload);
  },

  resetPassword(payload: ResetPasswordPayload) {
    return apiClient.post<{ message: string }>(`${AUTH_PATH}/reset-password`, payload);
  },
};

export type {
  AuthResponse,
  AuthRole,
  AuthUser,
  LoginPayload,
  RegisterPayload,
  VerifyEmailPayload,
  ResendVerificationPayload,
  ForgotPasswordPayload,
  ResetPasswordPayload,
} from "./types";
