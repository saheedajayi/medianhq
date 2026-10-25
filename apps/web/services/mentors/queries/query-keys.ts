import type { ExploreMentorsParams } from "../types";

export const mentorsQueryKeys = {
  all: ["mentors"] as const,
  explore: (params?: ExploreMentorsParams) =>
    [...mentorsQueryKeys.all, "explore", params ?? {}] as const,
  featured: (limit: number) =>
    [...mentorsQueryKeys.all, "featured", limit] as const,
  matches: () => [...mentorsQueryKeys.all, "matches"] as const,
  detail: (id: string) => [...mentorsQueryKeys.all, "detail", id] as const,
  apply: () => [...mentorsQueryKeys.all, "apply"] as const,
  updateProfile: () => [...mentorsQueryKeys.all, "update-profile"] as const,
};
