export type AdminUserRole = "MENTOR" | "MENTEE";
export type AdminUserStatus = "ACTIVE" | "UNDER_REVIEW" | "SUSPENDED" | "INACTIVE";

export type AdminUsersFilters = {
  role?: AdminUserRole;
  search?: string;
  status?: AdminUserStatus;
  joined?: "7d" | "30d" | "90d" | "year";
  country?: string;
  trust?: "85+" | "70-84" | "<70";
};

export type AdminUserRow = {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  role: AdminUserRole;
  status: AdminUserStatus;
  /** An admin marked the account for review */
  isFlagged: boolean;
  country: string | null;
  joinedAt: string;
  /** Mentors only, and null until they have a review or booking */
  trustScore: number | null;
  lastActiveAt: string | null;
};

export type AdminUsersPage = {
  items: AdminUserRow[];
  total: number;
  page: number;
  pageSize: number;
  /** Active users in the selected role, whatever the other filters */
  activeCount: number;
  countries: string[];
};

export type AdminUserSession = {
  id: string;
  title: string;
  status: string;
  startsAt: string;
  durationMinutes: number;
  withName: string;
  amount: number;
  currency: string;
};

export type AdminUserNote = {
  rating: number;
  comment: string | null;
  bookingId: string;
  createdAt: string;
  fromName: string;
  toName: string;
};

export type AdminUserDetail = AdminUserRow & {
  city: string | null;
  location: string | null;
  headline: string | null;
  bio: string | null;
  suspendedAt: string | null;
  suspensionReason: string | null;
  rating: { average: number | null; count: number };
  trustScoreDetail: {
    score: number;
    weighted: number;
    label: string;
    components: { key: "reviews" | "attendance" | "responseRate"; weight: number; value: number | null }[];
  } | null;
  sessions: { completed: number; upcoming: number; items: AdminUserSession[] };
  reviews: {
    receivedCount: number;
    givenCount: number;
    received: AdminUserNote | null;
    given: AdminUserNote | null;
  };
  activity: { id: string; at: string; text: string; reference: string | null }[];
};
