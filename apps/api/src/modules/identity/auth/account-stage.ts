import { MentorStatus, UserRole } from '@prisma/client';

export type AccountStage =
  | 'EMAIL_VERIFICATION'
  | 'ROLE_SELECTION'
  | 'MENTEE_ONBOARDING'
  | 'MENTOR_ONBOARDING'
  | 'MENTOR_PENDING'
  | 'READY';

type AccountStageUser = {
  emailVerifiedAt: Date | null;
  role: UserRole | null;
  menteeProfile?: unknown | null;
  mentorProfile?: { status: MentorStatus } | null;
};

export function getAccountStage(user: AccountStageUser): AccountStage {
  if (!user.emailVerifiedAt) {
    return 'EMAIL_VERIFICATION';
  }

  if (!user.role) {
    return 'ROLE_SELECTION';
  }

  if (user.role === UserRole.MENTEE) {
    return user.menteeProfile ? 'READY' : 'MENTEE_ONBOARDING';
  }

  if (user.role === UserRole.MENTOR) {
    if (!user.mentorProfile) {
      return 'MENTOR_ONBOARDING';
    }

    return user.mentorProfile.status === MentorStatus.APPROVED
      ? 'READY'
      : 'MENTOR_PENDING';
  }

  return 'READY';
}
