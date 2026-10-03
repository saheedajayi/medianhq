"use client";

import { useEffect, useState, useCallback } from "react";
import { format } from "date-fns";
import {
  ShieldCheck,
  ShieldAlert,
  KeyRound,
  RotateCw,
  LogOut,
  RefreshCw,
  Clock,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/base/card";
import { Button } from "@/components/ui/base/button";
import { authService, type SecurityEvent } from "@/services/auth";

function formatAction(action: string) {
  switch (action) {
    case "PASSWORD_CHANGE":
      return {
        label: "Password Changed",
        icon: <KeyRound className="h-4 w-4 text-[#344054]" />,
      };
    case "PASSWORD_RESET":
      return {
        label: "Password Reset Completed",
        icon: <RotateCw className="h-4 w-4 text-[#027A48]" />,
      };
    case "RECOVERY_REQUEST":
      return {
        label: "Password Reset Requested",
        icon: <Clock className="h-4 w-4 text-[#B54708]" />,
      };
    case "FAILED_RECOVERY":
      return {
        label: "Failed Recovery Attempt",
        icon: <ShieldAlert className="h-4 w-4 text-[#B42318]" />,
      };
    case "SESSIONS_REVOKED":
      return {
        label: "Other Sessions Revoked",
        icon: <LogOut className="h-4 w-4 text-[#6941C6]" />,
      };
    default:
      return {
        label: action.replace(/_/g, " "),
        icon: <ShieldCheck className="h-4 w-4 text-[#344054]" />,
      };
  }
}

export function SecurityAuditTrail({ refreshKey }: { refreshKey?: number }) {
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authService.getSecurityEvents();
      setEvents(response.data);
    } catch {
      setError("Unable to load security events. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents, refreshKey]);

  return (
    <Card className="border-[#EAECF0] shadow-xs">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div>
          <CardTitle className="text-lg text-[#101828]">
            Security Audit Trail
          </CardTitle>
          <CardDescription className="text-sm text-[#667085]">
            Review recent security-relevant events on your account (retained for 90 days).
          </CardDescription>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={fetchEvents}
          disabled={isLoading}
          className="h-8 px-2.5 text-xs text-[#344054]"
        >
          <RefreshCw
            className={`mr-1.5 h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`}
          />
          Refresh
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading && events.length === 0 ? (
          <div className="py-8 text-center text-sm text-[#667085]">
            Loading security events...
          </div>
        ) : error ? (
          <div className="py-6 text-center text-sm text-[#B42318]">{error}</div>
        ) : events.length === 0 ? (
          <div className="py-8 text-center text-sm text-[#667085]">
            No recent security events recorded.
          </div>
        ) : (
          <div className="divide-y divide-[#EAECF0]">
            {events.map((event) => {
              const meta = formatAction(event.action);
              const isSuccess = event.status === "SUCCESS";
              const formattedDate = format(
                new Date(event.createdAt),
                "MMM d, yyyy 'at' h:mm a",
              );

              return (
                <div
                  key={event.id}
                  className="flex items-center justify-between py-3 text-sm first:pt-0 last:pb-0"
                >
                  <div className="flex items-center space-x-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F2F4F7]">
                      {meta.icon}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <p className="font-medium text-[#101828]">{meta.label}</p>
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${
                            isSuccess
                              ? "bg-[#ECFDF3] text-[#027A48]"
                              : "bg-[#FEF3F2] text-[#B42318]"
                          }`}
                        >
                          {isSuccess ? "Success" : "Failed"}
                        </span>
                      </div>
                      <p className="text-xs text-[#667085]">
                        {event.ipAddress ? `IP: ${event.ipAddress}` : "IP unavailable"}
                        {event.userAgent ? ` • ${event.userAgent.slice(0, 45)}...` : ""}
                      </p>
                    </div>
                  </div>
                  <div className="text-right text-xs text-[#667085]">
                    {formattedDate}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
