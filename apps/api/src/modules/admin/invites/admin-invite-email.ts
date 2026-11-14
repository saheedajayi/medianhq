import { ADMIN_ROLE_LABELS } from './admin-roles';

/** The invite email, sent through the shared notification template */
export const adminInviteEmail = (
  role: keyof typeof ADMIN_ROLE_LABELS,
  invitedBy: string | null,
  token: string,
  expiryDays: number,
) => ({
  // The invitee has no account yet, so there is no name to greet them by
  firstName: 'there',
  subject: "You're invited to be a Median admin",
  paragraphs: [
    `${invitedBy ?? 'The Median team'} has invited you to join Median as a ${ADMIN_ROLE_LABELS[role]}.`,
    `Set your name and password to finish creating your admin account. This link works once and expires in ${expiryDays} days.`,
    "If you weren't expecting this invite, you can ignore this email.",
  ],
  details: [],
  ctaLabel: 'Accept invite',
  ctaPath: `/admin-invite/${token}`,
});
