export type DeleteAccountDto = {
  /** The "I understand this action is permanent" tick */
  acknowledged?: boolean;
  /** Re-entered to prove it's really them; not needed for Google or LinkedIn accounts */
  password?: string;
};

/** How long someone has to change their mind after asking to delete their account */
export const DELETION_GRACE_DAYS = 14;
