export type AuthRole = "MENTEE" | "MENTOR" | "ADMIN";

export type AccountStage =
  | "EMAIL_VERIFICATION"
  | "ROLE_SELECTION"
  | "MENTEE_ONBOARDING"
  | "MENTOR_ONBOARDING"
  | "MENTOR_PENDING"
  | "READY";

export type AuthUser = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: AuthRole | null;
  isEmailVerified: boolean;
  hasMenteeProfile: boolean;
  hasMentorProfile: boolean;
  mentorStatus?: string;
  accountStage: AccountStage;
  createdAt?: string;
  isProfileComplete?: boolean;
  menteeProfile?: {
    gender?: string | null;
    location?: string | null;
    bio?: string | null;
    avatarUrl?: string | null;
  } | null;
};

export type AuthResponse = {
  user: AuthUser;
  emailSent?: boolean;
  message?: string;
};

export type RegisterPayload = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: Exclude<AuthRole, "ADMIN">;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type VerifyEmailPayload = {
  email: string;
  code: string;
};

export type ResendVerificationPayload = {
  email: string;
};

export type ForgotPasswordPayload = {
  email: string;
};

export type ResetPasswordPayload = {
  token: string;
  password: string;
};
