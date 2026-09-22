export type CreateMentorSessionDto = {
  title: string;
  description: string;
  durationMinutes: number;
  price?: number;
  type?: 'ONE_ON_ONE' | 'GROUP';
  maxCapacity?: number;
  flyerUrl?: string;
};
export type UpdateMentorSessionDto = Partial<CreateMentorSessionDto> & { isLive?: boolean };
export type AvailabilityDto = { dayOfWeek: number; startTime: string; endTime: string; isActive?: boolean };
