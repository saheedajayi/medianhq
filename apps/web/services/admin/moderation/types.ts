export type FlagContentType = "FORUM_POST" | "MESSAGE" | "PROFILE_TEXT";
export type FlagStatus = "PENDING" | "FLAGGED" | "REVIEWED" | "ESCALATED" | "REMOVED";
export type ReviewerAction = "APPROVE" | "REMOVE" | "ESCALATE" | "WARN_USER";

export type FlagPerson = {
  id: string;
  name: string;
  avatarUrl: string | null;
  role: "Mentor" | "Mentee";
  joinedAt: string;
  country: string;
  accountStatus: string;
};

export type ContentFlag = {
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
  flaggedAt: string;
  status: FlagStatus;
  auditTrail: { at: string; label: string; detail: string }[];
};

export type ModerationFlagsFilters = {
  type?: FlagContentType;
  search?: string;
  status?: FlagStatus;
  flaggedOver?: "24h" | "7d" | "30d";
};

export type ModerationFlagsPage = {
  items: ContentFlag[];
  total: number;
  page: number;
  pageSize: number;
  counts: { all: number; forumPost: number; message: number; profileText: number };
  updatedAt: string;
};

export type ModerationHistoryEntry = {
  id: string;
  at: string;
  contentType: FlagContentType;
  content: string;
  authorName: string;
  /** The flag's status after the action */
  outcome: FlagStatus;
  reviewer: { name: string; role: string; avatarUrl: string | null };
  reason: string;
};

export type ModerationHistoryPage = {
  items: ModerationHistoryEntry[];
  total: number;
  page: number;
  pageSize: number;
};
