export const waitlistQueryKeys = {
  all: ["waitlist"] as const,
  create: () => [...waitlistQueryKeys.all, "create"] as const,
};
