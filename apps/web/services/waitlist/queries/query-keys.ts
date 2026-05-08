export const waitlistQueryKeys = {
  all: ["waitlist"] as const,
  create: () => [...waitlistQueryKeys.all, "create"] as const,
  stats: () => [...waitlistQueryKeys.all, "stats"] as const,
};
