export type MentorSessionDto = {
  id: string;
  title: string;
  description: string;
  durationMinutes: number;
  price: number;
  type: "ONE_ON_ONE" | "GROUP";
  isLive: boolean;
  maxCapacity?: number | null;
  flyerUrl?: string | null;
};

export type MentorSessionInput = {
  title: string;
  description: string;
  durationMinutes: number;
  price?: number;
  type?: "ONE_ON_ONE" | "GROUP";
  maxCapacity?: number;
  flyerUrl?: string;
};

export type UpdateMentorSessionPayload = {
  id: string;
  payload: Partial<MentorSessionInput> & { isLive?: boolean };
};

export type AvailabilityInput = {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isActive?: boolean;
};
