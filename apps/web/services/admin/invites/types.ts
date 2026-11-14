export type AdminRoleValue =
  | "SUPER_ADMIN"
  | "OPERATIONS_ADMIN"
  | "MODERATION_ADMIN"
  | "FINANCE_ADMIN"
  | "SUPPORT_AGENT";

export type AdminInvite = {
  id: string;
  email: string;
  role: AdminRoleValue;
  /** An expired invite can still be resent */
  status: "PENDING" | "EXPIRED";
  invitedBy: string | null;
  sentAt: string;
  expiresAt: string;
};

export type CreateAdminInvitePayload = { email: string; role: AdminRoleValue };

/** What the invited person sees before accepting */
export type AdminInvitePreview = {
  email: string;
  role: AdminRoleValue;
  roleLabel: string;
  expiresAt: string;
};

export type AcceptAdminInvitePayload = { firstName: string; lastName: string; password: string };
