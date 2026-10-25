export type CreateMentorProfilePayload = {
  currentRole?: string;
  company?: string;
  industry: string;
  experience: string;
  /** Answer to "Why do you want to mentor?" (private, for application review) */
  motivation: string;
  cvUrl?: string;
};

export type UpdateMentorProfilePayload = {
  gender?: string;
  location?: string;
  bio?: string;
  avatarUrl?: string;
};

export type MentorProfileMutationResponse = {
  profile: any;
};

export type MentorMatch = {
  id: string | number;
  name: string;
  role: string;
  sessions: string;
  match: string;
  image: string;
};

export type ExploreMentorsParams = {
  search?: string;
  category?: string;
  priceType?: "all" | "free" | "paid";
  minRating?: number;
  location?: string;
  sortBy?: "relevance" | "rating" | "sessions" | "name";
  page?: number;
  limit?: number;
};
