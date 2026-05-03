export type CreateMentorProfileDto = {
  headline: string;
  bio: string;
  industry: string;
  yearsOfExperience: number;
  company?: string;
  jobTitle?: string;
  linkedinUrl?: string;
  pricePerSession: number;
};
