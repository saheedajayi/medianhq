export const paymentsQueryKeys = {
  all: ["payments"] as const,
  initialize: () => [...paymentsQueryKeys.all, "initialize"] as const,
  verify: () => [...paymentsQueryKeys.all, "verify"] as const,
};
