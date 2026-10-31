"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { API_URL } from "@/services/api-client";
import { authService } from "@/services/auth";
import { bookingsQueryKeys } from "@/services/bookings/queries/query-keys";
import { earningsQueryKeys } from "@/services/earnings/queries/query-keys";

const RECONNECT_AFTER_REJECTION_MS = 30_000;

/**
 * Refetches booking data when the server says it changed. The stream closes while
 * the tab is hidden: browsers allow about 6 connections per site on HTTP/1.1, so
 * several open tabs would otherwise hold them all and stall every other request.
 */
export function useBookingEvents() {
  const queryClient = useQueryClient();

  useEffect(() => {
    let source: EventSource | null = null;
    let retryTimer: ReturnType<typeof setTimeout> | undefined;

    const refetch = () => {
      queryClient.invalidateQueries({ queryKey: bookingsQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: earningsQueryKeys.all });
    };

    const disconnect = () => {
      clearTimeout(retryTimer);
      source?.close();
      source = null;
    };

    const connect = () => {
      disconnect();
      source = new EventSource(`${API_URL}/bookings/events`, { withCredentials: true });
      source.addEventListener("bookings-changed", refetch);
      source.onerror = () => {
        // The browser retries dropped connections itself, but gives up on a rejected one,
        // usually an expired session. Checking the session refreshes it before trying again.
        if (source?.readyState !== EventSource.CLOSED) return;
        retryTimer = setTimeout(() => {
          authService.me().then(connect).catch(() => undefined);
        }, RECONNECT_AFTER_REJECTION_MS);
      };
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        disconnect();
      } else {
        // Anything that changed while hidden wasn't heard, so catch up
        refetch();
        connect();
      }
    };

    if (!document.hidden) connect();
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      disconnect();
    };
  }, [queryClient]);
}
