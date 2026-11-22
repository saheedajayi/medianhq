import type { AdminRole, MentorStatus, UserRole } from '@prisma/client';
import type { AdminAccess } from '../admin-access';
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
  /** For admins: their type and the admin sections it opens */
  adminRole?: AdminRole | null;
  adminAccess?: AdminAccess;
  isEmailVerified: boolean;
  hasMenteeProfile: boolean;
  hasMentorProfile: boolean;
  mentorStatus?: MentorStatus;
  /** A mentee whose mentor application was rejected and who hasn't dismissed the notice yet */
  showMentorRejectionNotice: boolean;
  /** Whether a mentee has picked any career goals */
  hasMenteeGoals: boolean;
  /** False for accounts that only sign in with Google or LinkedIn */
  hasPassword: boolean;
  accountStage: AccountStage;
  createdAt: Date | string;
  isProfileComplete: boolean;
  menteeProfile?: {
    gender?: string | null;
    location?: string | null;
    bio?: string | null;
    avatarUrl?: string | null;
  } | null;
  mentorProfile?: {
    gender?: string | null;
    location?: string | null;
    bio?: string | null;
    avatarUrl?: string | null;
    skills?: string[];
    tools?: string[];
    certificates?: string[];
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

export type ChangePasswordDto = {
  currentPassword: string;
  password: string;
};
