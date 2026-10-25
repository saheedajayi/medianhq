export type CreateMentorProfileDto = {
  currentRole?: string;
  company?: string;
  industry: string;
  experience: string;
  location?: string;
  /** Answer to "Why do you want to mentor?" (private, for application review) */
  motivation?: string;
  /** @deprecated older clients sent the motivation answer as `bio` */
  bio?: string;
  cvUrl?: string;
};

export type UpdateMentorProfileDto = {
  avatarUrl?: string;
  gender?: string;
  location?: string;
  bio?: string;
};
