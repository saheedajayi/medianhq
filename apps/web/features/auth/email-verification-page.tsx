"use client";

import { type FormEvent, useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { getAuthDestination } from "@/lib/auth-routing";
import { authService } from "@/services/auth";
import type { ApiError } from "@/services/api-client";

function getErrorMessage(error: unknown, fallback: string) {
  const apiError = error as Partial<ApiError>;
  return typeof apiError.message === "string" && apiError.message.trim()
    ? apiError.message
    : fallback;
}

import { Button } from "@/components/ui/base/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/base/input-otp";

const COOLDOWN_INITIAL_SECONDS = 60;

export function EmailVerificationPage({
  email,
  retryEmail,
}: {
  email: string;
  retryEmail?: boolean;
}) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cooldownSeconds, setCooldownSeconds] = useState(COOLDOWN_INITIAL_SECONDS);
  const hasRetried = useRef(false);

  useEffect(() => {
    if (cooldownSeconds <= 0) return;
    const timer = setInterval(() => {
      setCooldownSeconds((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldownSeconds]);

  useEffect(() => {
    if (retryEmail && !hasRetried.current) {
      hasRetried.current = true;
      authService
        .resendVerification({ email })
        .then(() => {
          setCooldownSeconds(COOLDOWN_INITIAL_SECONDS);
        })
        .catch(() => {
          toast.error("We hit a snag sending your code.", {
            description:
              "Once your internet connection is stable, click 'Resend Code' to try again.",
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
        const dest = getAuthDestination(response.data.user);
        if (response.data.user.accountStage === "READY") {
          toast.success("Welcome to Median!", {
            description: "Email verified successfully.",
          });
        } else {
          toast.success("Email verified successfully");
        }
        router.replace(dest);
      })
      .catch((error) => {
        toast.error("Verification failed", {
          description: getErrorMessage(error, "Invalid or expired code."),
        });
      })
      .finally(() => setIsSubmitting(false));
  }

  function handleResend() {
    if (cooldownSeconds > 0) return;

    toast.promise(authService.resendVerification({ email }), {
      loading: "Sending new code...",
      success: () => {
        setCooldownSeconds(COOLDOWN_INITIAL_SECONDS);
        return "A new verification code has been sent.";
      },
      error: (error) => getErrorMessage(error, "Failed to send code."),
    });
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <>
      <header className="text-center">
        <h1 className="text-2xl font-semibold tracking-[-0.02em] text-[#4b100d]">
          Check your email
        </h1>
        <p className="mt-2 text-base leading-6 text-[#344054]">
          Enter the verification code we sent to
          <strong className="block font-semibold text-[#141c2e] mt-0.5">{email}</strong>
        </p>
        <p className="mt-5 text-xs font-normal text-[#667085]">
          Code expires in <span className="font-semibold text-[#344054]">15 minutes</span>.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="mt-8 grid gap-8">
        <div className="grid gap-2">
          <InputOTP
            maxLength={6}
            name="verificationCode"
            id="verificationCode"
            containerClassName="w-full flex justify-between"
          >
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

        <div className="flex flex-col items-center gap-1.5 justify-self-center text-center">
          {cooldownSeconds > 0 ? (
            <span className="text-sm font-medium text-[#94a3b8] cursor-not-allowed select-none">
              Resend Code in {formatTime(cooldownSeconds)}
            </span>
          ) : (
            <>
              <button
                type="button"
                onClick={handleResend}
                className="text-base font-semibold text-primary hover:underline cursor-pointer transition-colors"
              >
                Resend Code
              </button>
              <span className="text-xs text-[#94a3b8]">
                Didn&apos;t receive the code? Click above to send a new one.
              </span>
            </>
          )}
        </div>
      </form>
    </>
  );
}
