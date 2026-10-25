export const taxonomyQueryKeys = {
  all: ["taxonomy"] as const,
  industries: () => [...taxonomyQueryKeys.all, "industries"] as const,
  createRole: () => [...taxonomyQueryKeys.all, "create-role"] as const,
};
