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
