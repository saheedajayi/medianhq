export const settingsQueryKeys = {
  all: ["settings"] as const,
  mine: () => [...settingsQueryKeys.all, "mine"] as const,
  career: () => [...settingsQueryKeys.all, "career"] as const,
  socials: () => [...settingsQueryKeys.all, "socials"] as const,
};
