export const FLAG_CONTENT_TYPES = [
  'FORUM_POST',
  'MESSAGE',
  'PROFILE_TEXT',
] as const;
export type FlagContentType = (typeof FLAG_CONTENT_TYPES)[number];

export const FLAG_STATUSES = [
  'PENDING',
  'FLAGGED',
  'REVIEWED',
  'ESCALATED',
  'REMOVED',
] as const;
export type FlagStatus = (typeof FLAG_STATUSES)[number];

export const REVIEWER_ACTIONS = [
  'APPROVE',
  'REMOVE',
  'ESCALATE',
  'WARN_USER',
] as const;
export type ReviewerAction = (typeof REVIEWER_ACTIONS)[number];

export interface FlagPerson {
  id: string;
  name: string;
  avatarUrl: string | null;
  role: 'Mentor' | 'Mentee';
  joinedAt: Date;
  country: string;
  accountStatus: string;
}

export interface FlagAuditEntry {
  at: Date;
  /** "Flagged by System" or "Reviewed by you" */
  label: string;
  detail: string;
}

export interface ContentFlag {
  id: string;
  contentType: FlagContentType;
  content: string;
  /** Who wrote the content */
  author: FlagPerson;
  /** Who a message was sent to; null for posts and profile text */
  recipient: FlagPerson | null;
  /** Which part of a profile the text is from, such as "Bio" */
  profileField: string | null;
  reason: string;
  flaggedBy: string;
  flaggedAt: Date;
  status: FlagStatus;
  auditTrail: FlagAuditEntry[];
}

export interface ModerationHistoryEntry {
  id: string;
  at: Date;
  contentType: FlagContentType;
  content: string;
  authorName: string;
  /** The flag's status after the action */
  outcome: FlagStatus;
  reviewer: { name: string; role: string; avatarUrl: string | null };
  reason: string;
}

/** Query string for the moderation queue, as it arrives */
export interface ModerationFlagsQueryDto {
  type?: string;
  search?: string;
  status?: string;
  flaggedOver?: string;
  page?: number | string;
}

export interface ModerationFlagsFilters {
  type?: FlagContentType;
  search?: string;
  status?: FlagStatus;
  /** Only content flagged within this long */
  flaggedOver?: '24h' | '7d' | '30d';
}

export interface ModerationHistoryQueryDto {
  page?: number | string;
}

export interface TakeFlagActionDto {
  action?: string;
}

export interface AddBlockedTermDto {
  term?: string;
  reason?: string;
}

export interface BlockedTermItem {
  id: string;
  term: string;
  reason: string;
  createdAt: Date;
}
