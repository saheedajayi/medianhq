import { apiClient, API_URL } from "@/services/api-client";
import type {
  AuthResponse,
  AuthUser,
  LoginPayload,
  RegisterPayload,
  VerifyEmailPayload,
  ResendVerificationPayload,
  ForgotPasswordPayload,
  ResetPasswordPayload,
  ChangePasswordPayload,
  SecurityEvent,
  RevokeSessionsResponse,
} from "./types";

const AUTH_PATH = "/auth";

export const authService = {
  getOAuthUrl(provider: "google" | "linkedin") {
    return `${API_URL}${AUTH_PATH}/${provider}`;
  },

  register(payload: RegisterPayload) {
    return apiClient.post<AuthResponse>(`${AUTH_PATH}/register`, payload);
  },

  login(payload: LoginPayload) {
    return apiClient.post<AuthResponse>(`${AUTH_PATH}/login`, payload);
  },

  me() {
    return apiClient.get<AuthUser>(`${AUTH_PATH}/me`);
  },

  refresh() {
    return apiClient.post<{ user: AuthUser }>(`${AUTH_PATH}/refresh`);
  },

  logout() {
    return apiClient.post<{ message?: string }>(`${AUTH_PATH}/logout`);
  },

  verifyEmail(payload: VerifyEmailPayload) {
    return apiClient.post<AuthResponse>(`${AUTH_PATH}/verify-email`, payload);
  },

  resendVerification(payload: ResendVerificationPayload) {
    return apiClient.post<{ message: string }>(
      `${AUTH_PATH}/resend-verification`,
      payload,
    );
  },

  forgotPassword(payload: ForgotPasswordPayload) {
    return apiClient.post<{ message: string }>(
      `${AUTH_PATH}/forgot-password`,
      payload,
    );
  },

  resetPassword(payload: ResetPasswordPayload) {
    return apiClient.post<{ message: string }>(
      `${AUTH_PATH}/reset-password`,
      payload,
    );
  },

  changePassword(payload: ChangePasswordPayload) {
    return apiClient.post<{ message: string }>(
      `${AUTH_PATH}/change-password`,
      payload,
    );
  },

  validateResetToken(token: string) {
    return apiClient.get<{ valid: boolean }>(
      `${AUTH_PATH}/reset-password/validate`,
      {
        params: { token },
      },
    );
  },

  revokeOtherSessions() {
    return apiClient.post<RevokeSessionsResponse>(
      `${AUTH_PATH}/revoke-other-sessions`,
    );
  },

  getSecurityEvents() {
    return apiClient.get<SecurityEvent[]>(`${AUTH_PATH}/security-events`);
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
  ChangePasswordPayload,
  SecurityEvent,
  RevokeSessionsResponse,
} from "./types";
