import { MentorStatus, UserRole } from '@prisma/client';
import { getAccountStage } from './account-stage';

describe('getAccountStage', () => {
  const verifiedAt = new Date('2026-07-27T00:00:00.000Z');

  it.each([
    {
      name: 'unverified account',
      user: { emailVerifiedAt: null, role: null },
      expected: 'EMAIL_VERIFICATION',
    },
    {
      name: 'verified account without a role',
      user: { emailVerifiedAt: verifiedAt, role: null },
      expected: 'ROLE_SELECTION',
    },
    {
      name: 'mentee without a profile',
      user: { emailVerifiedAt: verifiedAt, role: UserRole.MENTEE },
      expected: 'MENTEE_ONBOARDING',
    },
    {
      name: 'mentee with a profile',
      user: {
        emailVerifiedAt: verifiedAt,
        role: UserRole.MENTEE,
        menteeProfile: { id: 'mentee-profile' },
      },
      expected: 'READY',
    },
    {
      name: 'mentor without a profile',
      user: { emailVerifiedAt: verifiedAt, role: UserRole.MENTOR },
      expected: 'MENTOR_ONBOARDING',
    },
    {
      name: 'mentor awaiting review',
      user: {
        emailVerifiedAt: verifiedAt,
        role: UserRole.MENTOR,
        mentorProfile: { status: MentorStatus.PENDING_REVIEW },
      },
      expected: 'MENTOR_PENDING',
    },
    {
      name: 'approved mentor',
      user: {
        emailVerifiedAt: verifiedAt,
        role: UserRole.MENTOR,
        mentorProfile: { status: MentorStatus.APPROVED },
      },
      expected: 'READY',
    },
    {
      name: 'admin',
      user: { emailVerifiedAt: verifiedAt, role: UserRole.ADMIN },
      expected: 'READY',
    },
  ])('returns the correct stage for $name', ({ user, expected }) => {
    expect(getAccountStage(user)).toBe(expected);
  });
});
