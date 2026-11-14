export type AdminUserStatus =
  | 'ACTIVE'
  | 'UNDER_REVIEW'
  | 'SUSPENDED'
  | 'INACTIVE';

export type AdminUserRole = 'MENTOR' | 'MENTEE';

/** Query string for the user directory, as it arrives */
export interface AdminUsersQueryDto {
  role?: string;
  search?: string;
  status?: string;
  joined?: string;
  country?: string;
  trust?: string;
  page?: number | string;
}

/** The directory filters once checked */
export interface AdminUsersFilters {
  role?: AdminUserRole;
  search?: string;
  status?: AdminUserStatus;
  joined?: '7d' | '30d' | '90d' | 'year';
  country?: string;
  trust?: '85+' | '70-84' | '<70';
}

export interface AdminUserItem {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  role: AdminUserRole;
  status: AdminUserStatus;
  /** An admin marked the account for review */
  isFlagged: boolean;
  country: string | null;
  joinedAt: Date;
  /** Mentors only, and null until they have a review or booking */
  trustScore: number | null;
  lastActiveAt: Date | null;
}

export interface SuspendUserDto {
  reason?: string;
}

export interface FlagUserDto {
  flagged?: boolean;
}
