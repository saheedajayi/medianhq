export const contactQueryKeys = {
  all: ["contact"] as const,
  send: () => [...contactQueryKeys.all, "send"] as const,
};
