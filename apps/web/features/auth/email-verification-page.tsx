"use client";

import { type FormEvent, useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { authService } from "@/services/auth";
import type { ApiError } from "@/services/api-client";

function getErrorMessage(error: unknown, fallback: string) {
  const apiError = error as Partial<ApiError>;
  return typeof apiError.message === "string" && apiError.message.trim()
    ? apiError.message
    : fallback;
}

import { Button } from "@/components/ui/base/button";
import { Label } from "@/components/ui/base/label";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/base/input-otp";

export function EmailVerificationPage({ email, retryEmail }: { email: string; retryEmail?: boolean }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const hasRetried = useRef(false);

  useEffect(() => {
    if (retryEmail && !hasRetried.current) {
      hasRetried.current = true;
      authService.resendVerification({ email })
        .then(() => {
          // Silent success for seamless UX
        })
        .catch(() => {
          toast.error("We hit a snag sending your code.", {
            description: "Once your internet connection is stable, click 'Resend Code' to try again.",
            duration: 8000,
          });
        });
    }
  }, [retryEmail, email]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const code = String(formData.get("verificationCode"));

    authService
      .verifyEmail({ email, code })
      .then((response) => {
        toast.success("Email verified successfully");
        if (!response.data.user.hasMenteeProfile && !response.data.user.hasMentorProfile) {
          router.push("/role-selection");
        } else if (response.data.user.hasMentorProfile && response.data.user.mentorStatus !== "APPROVED") {
          router.push("/mentor-submitted");
        } else {
          router.push("/dashboard");
        }
      })
      .catch((error) => {
        toast.error("Verification failed", {
          description: getErrorMessage(error, "Invalid or expired code."),
        });
      })
      .finally(() => setIsSubmitting(false));
  }

  function handleResend() {
    toast.promise(authService.resendVerification({ email }), {
      loading: "Sending new code...",
      success: "A new verification code has been sent.",
      error: (error) => getErrorMessage(error, "Failed to send code."),
    });
  }

  return (
    <>
      <header className="text-center">
        <h1 className="text-2xl font-semibold tracking-[-0.02em] text-[#4b100d]">
          Check your email
        </h1>
        <p className="mt-2 text-base leading-6 text-[#344054]">
          Enter the verification code we sent to
          <strong className="block font-semibold">{email}</strong>
        </p>
      </header>

      <form onSubmit={handleSubmit} className="mt-14 grid gap-8">
        <div className="grid gap-2">
          <Label
            htmlFor="verificationCode"
            className="text-sm font-normal text-[#141c2e]"
          >
            Code
          </Label>
          <InputOTP maxLength={6} name="verificationCode" id="verificationCode" containerClassName="mt-2 w-full flex justify-between">
            <InputOTPGroup className="flex w-full justify-between gap-2 sm:gap-3">
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>
        </div>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="h-12 rounded-full bg-primary text-base font-medium text-white hover:bg-primary/90"
        >
          {isSubmitting ? "Checking code..." : "Continue"}
        </Button>

        <button
          type="button"
          onClick={handleResend}
          className="justify-self-center text-base font-medium text-primary hover:underline"
        >
          Resend Code
        </button>
      </form>
    </>
  );
}
