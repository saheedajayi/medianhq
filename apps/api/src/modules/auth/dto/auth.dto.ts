import type { UserRole } from '@prisma/client';

export type RegisterDto = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: UserRole;
};

export type LoginDto = {
  email: string;
  password: string;
};

export type AuthUser = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role?: UserRole;
  isEmailVerified: boolean;
  hasMenteeProfile: boolean;
  hasMentorProfile: boolean;
  mentorStatus?: string;
};

export type VerifyEmailDto = {
  email: string;
  code: string;
};

export type ResendVerificationDto = {
  email: string;
};

export type ForgotPasswordDto = {
  email: string;
};

export type ResetPasswordDto = {
  token: string;
  password: string;
};
