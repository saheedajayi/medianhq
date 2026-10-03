"use client";

import { type FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

const newPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number")
      .regex(
        /[^A-Za-z0-9]/,
        "Password must contain at least one special character",
      ),
    confirmPassword: z
      .string()
      .min(8, "Password must be at least 8 characters"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

import { Button } from "@/components/ui/base/button";
import {
  FormField,
  formInputClassName,
} from "@/components/ui/custom/form-field";
import { PasswordInput } from "@/components/ui/custom/password-input";
import { authService } from "@/services/auth";
import type { ApiError } from "@/services/api-client";

function getErrorMessage(error: unknown, fallback: string) {
  const apiError = error as Partial<ApiError>;

  return typeof apiError.message === "string" && apiError.message.trim()
    ? apiError.message
    : fallback;
}

export function NewPasswordPage({ token }: { token: string }) {
  const router = useRouter();
  const [isValidating, setIsValidating] = useState(true);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[] | undefined>>(
    {},
  );

  useEffect(() => {
    if (!token || !token.trim()) {
      setIsValidating(false);
      setValidationError("Missing or invalid password reset token.");
      return;
    }

    authService
      .validateResetToken(token)
      .then(() => {
        setIsValidating(false);
      })
      .catch((error) => {
        setIsValidating(false);
        setValidationError(
          getErrorMessage(
            error,
            "This password reset link is invalid or has expired.",
          ),
        );
      });
  }, [token]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    const result = newPasswordSchema.safeParse({
      password: String(formData.get("password") ?? ""),
      confirmPassword: String(formData.get("confirmPassword") ?? ""),
    });

    setErrors({});

    if (!result.success) {
      setErrors(result.error.flatten().fieldErrors);
      toast.error("Validation error", {
        description: "Please check the highlighted fields.",
      });
      return;
    }

    const { password } = result.data;

    setIsSubmitting(true);

    authService
      .resetPassword({ token, password })
      .then(() => {
        toast.success("Password reset successfully", {
          description: "You can now log in with your new password.",
        });
        router.push("/signin");
      })
      .catch((error) => {
        const message = getErrorMessage(
          error,
          "Please try again later. The link may have expired.",
        );

        if (
          message ===
            "Your new password must be different from your current password." ||
          message ===
            "Choose a password that has not appeared in a data breach."
        ) {
          setErrors({ password: [message] });
        }

        toast.error("Unable to reset password", {
          description: message,
        });
      })
      .finally(() => setIsSubmitting(false));
  }

  if (isValidating) {
    return (
      <div className="py-12 text-center">
        <div className="mx-auto mb-4 size-8 animate-spin rounded-full border-2 border-[#FF5514] border-t-transparent" />
        <p className="text-sm text-[#667085]">Verifying reset link...</p>
      </div>
    );
  }

  if (validationError) {
    return (
      <div className="text-center">
        <header className="mb-6">
          <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-red-50 text-red-600">
            <AlertCircle className="size-6" />
          </div>
          <h1 className="text-2xl font-semibold tracking-[-0.02em] text-[#4b100d]">
            Reset Link Invalid or Expired
          </h1>
          <p className="mt-2 text-sm text-[#667085]">{validationError}</p>
        </header>

        <div className="grid gap-3 pt-2">
          <Link
            href="/reset-password"
            className="flex h-12 w-full items-center justify-center rounded-full bg-[#FF5514] text-base font-medium text-white shadow-xs transition-all hover:bg-[#E84D12]"
          >
            Request a new link
          </Link>

          <Link
            href="/signin"
            className="inline-flex items-center justify-center gap-2 py-2 text-sm font-semibold text-[#344054] hover:underline"
          >
            <ArrowLeft className="size-4" />
            Back to log in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <header className="mb-10 text-center">
        <h1 className="text-2xl font-semibold tracking-[-0.02em] text-[#4b100d]">
          Set New Password
        </h1>
        <p className="mt-2 text-base text-[#344054]">
          Please enter your new password below.
        </p>
      </header>

      <form onSubmit={handleSubmit} noValidate className="grid gap-4">
        <FormField
          id="password"
          label="New Password"
          error={errors.password?.[0]}
        >
          <PasswordInput
            id="password"
            name="password"
            autoComplete="new-password"
            required
            showCriteriaTooltip
            className={formInputClassName}
            placeholder="Min 8 characters"
            aria-invalid={!!errors.password}
          />
        </FormField>
        <p className="-mt-2 text-xs text-[#667085]">
          Choose a password different from your current password.
        </p>

        <FormField
          id="confirmPassword"
          label="Confirm Password"
          error={errors.confirmPassword?.[0]}
        >
          <PasswordInput
            id="confirmPassword"
            name="confirmPassword"
            autoComplete="new-password"
            required
            className={formInputClassName}
            placeholder="Re-enter new password"
            aria-invalid={!!errors.confirmPassword}
          />
        </FormField>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="mt-6 h-12 rounded-full text-base font-medium text-white"
        >
          {isSubmitting ? "Saving..." : "Save password"}
        </Button>

        <div className="mt-2 text-center">
          <Link
            href="/signin"
            className="inline-flex items-center justify-center gap-2 text-sm font-semibold text-[#FF5514] hover:underline"
          >
            <ArrowLeft className="size-4" />
            Back to log in
          </Link>
        </div>
      </form>
    </>
  );
}
