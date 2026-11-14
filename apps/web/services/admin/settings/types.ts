export type AdminAuditEntry = {
  id: string;
  at: string;
  adminName: string;
  action: string;
  /** Who it was done to, and any reason given */
  details: string;
};
