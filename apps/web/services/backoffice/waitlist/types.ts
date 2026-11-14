export type WaitlistAudience = "MENTEE" | "MENTOR";

export type WaitlistEntry = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  audience: WaitlistAudience;
  location: string | null;
  expertise: string | null;
  currentRole: string;
  company: string | null;
  levelOfExperience: string | null;
  createdAt: string;
  updatedAt: string;
};

export type WaitlistPagination = {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

export type WaitlistDashboard = {
  summary: {
    total: number;
    mentees: number;
    mentors: number;
    latestSignupAt: string | null;
  };
  pagination: WaitlistPagination;
  entries: WaitlistEntry[];
};
