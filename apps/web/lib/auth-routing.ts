import type { AuthUser } from "@/services/auth";

type AuthDestinationOptions = {
  retryEmail?: boolean;
};

export function getAuthDestination(
  user: AuthUser,
  options: AuthDestinationOptions = {},
) {
  switch (user.accountStage) {
    case "EMAIL_VERIFICATION": {
      const params = new URLSearchParams({ email: user.email });

      if (options.retryEmail) {
        params.set("retryEmail", "true");
      }

      return `/email-verification?${params.toString()}`;
    }
    case "ROLE_SELECTION":
      return "/role-selection";
    case "MENTEE_ONBOARDING":
      return "/mentee-onboarding";
    case "MENTOR_ONBOARDING":
      return "/mentor-onboarding";
    case "MENTOR_PENDING":
      return "/mentor-submitted";
    case "READY":
      return "/dashboard";
  }
}

export function getAuthDestinationPath(user: AuthUser) {
  return getAuthDestination(user).split("?")[0];
}
