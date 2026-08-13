import type { MentorStatus, UserRole } from '@prisma/client';
import type { AccountStage } from '../account-stage';

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
  role: UserRole | null;
  isEmailVerified: boolean;
  hasMenteeProfile: boolean;
  hasMentorProfile: boolean;
  mentorStatus?: MentorStatus;
  accountStage: AccountStage;
  createdAt: Date | string;
  isProfileComplete: boolean;
  menteeProfile?: {
    gender?: string | null;
    location?: string | null;
    bio?: string | null;
    avatarUrl?: string | null;
  } | null;
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
