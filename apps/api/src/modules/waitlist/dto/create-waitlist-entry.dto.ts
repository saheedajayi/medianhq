export type CreateWaitlistEntryDto = {
  firstName: string;
  lastName: string;
  email: string;
  audience: 'MENTEE' | 'MENTOR';
  location?: string;
  expertise?: string;
  currentRole: string;
  company?: string;
  levelOfExperience?: string;
};
