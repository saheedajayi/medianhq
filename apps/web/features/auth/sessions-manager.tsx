"use client";

import { useState } from "react";
import { toast } from "sonner";
import { ShieldAlert, Laptop, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/base/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/base/card";
import { authService } from "@/services/auth";
import type { ApiError } from "@/services/api-client";

function getErrorMessage(error: unknown, fallback: string) {
  const apiError = error as Partial<ApiError>;
  return typeof apiError.message === "string" && apiError.message.trim()
    ? apiError.message
    : fallback;
}

export function SessionsManager({
  onRevoked,
}: {
  onRevoked?: () => void;
}) {
  const [isRevoking, setIsRevoking] = useState(false);
  const [revokedSuccess, setRevokedSuccess] = useState(false);

  async function handleRevokeOtherSessions() {
    setIsRevoking(true);
    setRevokedSuccess(false);

    try {
      const response = await authService.revokeOtherSessions();
      toast.success("Other sessions revoked", {
        description: response.data.message || "All other sessions have been signed out.",
      });
      setRevokedSuccess(true);
      onRevoked?.();
    } catch (error) {
      toast.error(
        getErrorMessage(
          error,
          "Failed to revoke other sessions. Please try again.",
        ),
      );
    } finally {
      setIsRevoking(false);
    }
  }

  return (
    <Card className="border-[#EAECF0] shadow-xs">
      <CardHeader>
        <CardTitle className="text-lg text-[#101828]">Active Sessions</CardTitle>
        <CardDescription className="text-sm text-[#667085]">
          Manage devices and browsers currently signed in to your account.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between rounded-lg border border-[#EAECF0] p-4">
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F2F4F7] text-[#344054]">
              <Laptop className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <p className="text-sm font-medium text-[#101828]">Current Session</p>
                <span className="inline-flex items-center rounded-full bg-[#ECFDF3] px-2 py-0.5 text-xs font-medium text-[#027A48]">
                  Active Now
                </span>
              </div>
              <p className="text-xs text-[#667085]">
                This browser window is protected by session versioning.
              </p>
            </div>
          </div>
        </div>

        {revokedSuccess && (
          <div className="flex items-center space-x-2 rounded-lg bg-[#ECFDF3] p-3 text-sm text-[#027A48]">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>All other active sessions have been successfully invalidated.</span>
          </div>
        )}

        <div className="pt-2">
          <Button
            type="button"
            variant="outline"
            disabled={isRevoking}
            onClick={handleRevokeOtherSessions}
            className="w-full text-[#B42318] hover:bg-[#FEF3F2] hover:text-[#B42318] sm:w-auto"
          >
            <ShieldAlert className="mr-2 h-4 w-4" />
            {isRevoking ? "Revoking sessions..." : "Sign out of all other sessions"}
          </Button>
          <p className="mt-2 text-xs text-[#667085]">
            If you suspect unauthorized access, click above to revoke all other devices and update your password.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
