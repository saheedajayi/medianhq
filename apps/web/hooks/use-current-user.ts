"use client";

import { useQuery } from "@tanstack/react-query";
import { authService, AuthUser } from "@/services/auth";

export function useCurrentUser() {
  return useQuery<AuthUser | null>({
    queryKey: ["current-user"],
    queryFn: async () => {
      try {
        const response = await authService.me();
        return response.data;
      } catch {
        return null;
      }
    },
    staleTime: 10 * 1000, // 10 seconds for immediate reactivity
    refetchOnWindowFocus: true,
  });
}
