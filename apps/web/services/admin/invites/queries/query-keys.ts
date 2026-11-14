export const adminInvitesQueryKeys = {
  all: ["admin", "invites"] as const,
  list: () => [...adminInvitesQueryKeys.all, "list"] as const,
  preview: (token: string) => [...adminInvitesQueryKeys.all, "preview", token] as const,
};
