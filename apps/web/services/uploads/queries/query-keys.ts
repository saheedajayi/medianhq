export const uploadsQueryKeys = {
  all: ["uploads"] as const,
  signedUrl: (publicIdOrUrl: string) =>
    [...uploadsQueryKeys.all, "signed-url", publicIdOrUrl] as const,
  avatar: () => [...uploadsQueryKeys.all, "avatar"] as const,
  cv: () => [...uploadsQueryKeys.all, "cv"] as const,
};
