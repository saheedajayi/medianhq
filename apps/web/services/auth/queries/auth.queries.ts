"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { ApiError } from "@/services/api-client";
import {
  authService,
  type AuthResponse,
  type AuthUser,
  type ChangePasswordPayload,
  type ForgotPasswordPayload,
  type LoginPayload,
  type RegisterPayload,
  type ResendVerificationPayload,
  type ResetPasswordPayload,
  type RevokeSessionsResponse,
  type SecurityEvent,
  type VerifyEmailPayload,
  type DeviceSession,
} from "@/services/auth";
import { authQueryKeys } from "./query-keys";

type MessageResponse = { message: string };

export const useCurrentUser = () => {
  return useQuery<AuthUser | null>({
    queryKey: authQueryKeys.me(),
    queryFn: async () => {
      try {
        const response = await authService.me();
        return response.data;
      } catch (error) {
        // Null means signed out; anything else is a failure callers can show and retry
        if ((error as Partial<ApiError>)?.status === 401) return null;
        throw error;
      }
    },
    staleTime: 10 * 1000, // 10 seconds for immediate reactivity
    refetchOnWindowFocus: true,
  });
};

export const useDeviceSessions = () => {
  return useQuery<DeviceSession[], ApiError>({
    queryKey: authQueryKeys.deviceSessions(),
    queryFn: async () => {
      const response = await authService.getDeviceSessions();
      return response.data;
    },
  });
};

export const useSecurityEvents = () => {
  return useQuery<SecurityEvent[], ApiError>({
    queryKey: authQueryKeys.securityEvents(),
    queryFn: async () => {
      const response = await authService.getSecurityEvents();
      return response.data;
    },
  });
};

export const useValidateResetToken = (token: string) => {
  return useQuery<{ valid: boolean }, ApiError>({
    queryKey: authQueryKeys.resetToken(token),
    queryFn: async () => {
      const response = await authService.validateResetToken(token);
      return response.data;
    },
    enabled: !!token,
    retry: false,
  });
};

// Anything that changes who is signed in, or their account stage, refreshes the current user
const useInvalidateCurrentUser = () => {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: authQueryKeys.me() });
};

export const useLogin = () => {
  const invalidateCurrentUser = useInvalidateCurrentUser();

  return useMutation<AuthResponse, ApiError, LoginPayload>({
    mutationKey: authQueryKeys.login(),
    mutationFn: async (payload) => {
      const response = await authService.login(payload);
      return response.data;
    },
    onSuccess: invalidateCurrentUser,
  });
};

export const useRegister = () => {
  const invalidateCurrentUser = useInvalidateCurrentUser();

  return useMutation<AuthResponse, ApiError, RegisterPayload>({
    mutationKey: authQueryKeys.register(),
    mutationFn: async (payload) => {
      const response = await authService.register(payload);
      return response.data;
    },
    onSuccess: invalidateCurrentUser,
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();

  return useMutation<{ message?: string }, ApiError, void>({
    mutationKey: authQueryKeys.logout(),
    mutationFn: async () => {
      const response = await authService.logout();
      return response.data;
    },
    onSettled: () => {
      // Drop every cached response so the next user never sees this one's data
      queryClient.clear();
    },
  });
};

export const useVerifyEmail = () => {
  const invalidateCurrentUser = useInvalidateCurrentUser();

  return useMutation<AuthResponse, ApiError, VerifyEmailPayload>({
    mutationKey: authQueryKeys.verifyEmail(),
    mutationFn: async (payload) => {
      const response = await authService.verifyEmail(payload);
      return response.data;
    },
    onSuccess: invalidateCurrentUser,
  });
};

export const useResendVerification = () => {
  return useMutation<MessageResponse, ApiError, ResendVerificationPayload>({
    mutationKey: authQueryKeys.resendVerification(),
    mutationFn: async (payload) => {
      const response = await authService.resendVerification(payload);
      return response.data;
    },
  });
};

export const useForgotPassword = () => {
  return useMutation<MessageResponse, ApiError, ForgotPasswordPayload>({
    mutationKey: authQueryKeys.forgotPassword(),
    mutationFn: async (payload) => {
      const response = await authService.forgotPassword(payload);
      return response.data;
    },
  });
};

export const useResetPassword = () => {
  return useMutation<MessageResponse, ApiError, ResetPasswordPayload>({
    mutationKey: authQueryKeys.resetPassword(),
    mutationFn: async (payload) => {
      const response = await authService.resetPassword(payload);
      return response.data;
    },
  });
};

export const useChangePassword = () => {
  const queryClient = useQueryClient();

  return useMutation<MessageResponse, ApiError, ChangePasswordPayload>({
    mutationKey: authQueryKeys.changePassword(),
    mutationFn: async (payload) => {
      const response = await authService.changePassword(payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: authQueryKeys.securityEvents() });
    },
  });
};

export const useRevokeOtherSessions = () => {
  const queryClient = useQueryClient();

  return useMutation<RevokeSessionsResponse, ApiError, void>({
    mutationKey: authQueryKeys.revokeOtherSessions(),
    mutationFn: async () => {
      const response = await authService.revokeOtherSessions();
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: authQueryKeys.deviceSessions() });
      queryClient.invalidateQueries({ queryKey: authQueryKeys.securityEvents() });
    },
  });
};
