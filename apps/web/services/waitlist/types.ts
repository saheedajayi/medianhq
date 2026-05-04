export type WaitlistAudience = "MENTEE" | "MENTOR";
export type WaitlistAudienceTab = "mentees" | "mentors";
export type WaitlistSubmitState = "idle" | "submitting" | "success" | "error";

export type WaitlistPayload = {
  firstName: string;
  lastName: string;
  email: string;
  audience: WaitlistAudience;
  location?: string;
  expertise: string;
  currentRole: string;
  company: string;
};

export type WaitlistFieldErrors = Partial<
  Record<keyof WaitlistPayload, string>
>;

export type WaitlistResponse = {
  status: "ok";
  entry: {
    id: string;
    email: string;
    audience: WaitlistAudience;
  };
};
