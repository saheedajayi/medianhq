export type CreateMenteeProfilePayload = {
  gender?: string;
  location?: string;
  bio?: string;
  avatarUrl?: string;
  goals?: string[];
  goalDescription?: string;
  currentRole?: string;
  industry?: string;
  timeframe?: string;
};

export type MenteeProfileResponse = {
  profile: any;
};

/** GET /mentees/:id — a mentee's profile as shown to a mentor they have booked */
export type MenteePublicProfile = {
  id: string;
  name: string;
  avatarUrl: string | null;
  role: string | null;
  company: string | null;
  location: string | null;
  bio: string | null;
  expertise: string[];
  sessionCount: number;
  rating: number;
  reviewCount: number;
  workExperiences: Array<{
    id: string;
    role: string;
    company: string;
    contribution: string | null;
    skills: string[];
    startMonth: number;
    startYear: number;
    endMonth: number | null;
    endYear: number | null;
    isCurrent: boolean;
  }>;
  socialLinks: Array<{ id: string; kind: string; title: string | null; url: string }>;
  reviews: Array<{
    id: string;
    rating: number;
    comment: string | null;
    authorName: string;
    authorAvatar: string;
    createdAt: string;
  }>;
};
