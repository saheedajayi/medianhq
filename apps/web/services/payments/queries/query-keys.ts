export const paymentsQueryKeys = {
  all: ["payments"] as const,
  initialize: () => [...paymentsQueryKeys.all, "initialize"] as const,
  quote: (bookingId: string, currency: string) => [...paymentsQueryKeys.all, "quote", bookingId, currency] as const,
  verify: () => [...paymentsQueryKeys.all, "verify"] as const,
};
