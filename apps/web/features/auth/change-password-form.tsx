"use client";

import { type FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/base/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/base/card";
import {
  FormField,
  formInputClassName,
} from "@/components/ui/custom/form-field";
import { PasswordInput } from "@/components/ui/custom/password-input";
import { authService } from "@/services/auth";
import type { ApiError } from "@/services/api-client";

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
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
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

function getErrorMessage(error: unknown, fallback: string) {
  const apiError = error as Partial<ApiError>;
  return typeof apiError.message === "string" && apiError.message.trim()
    ? apiError.message
    : fallback;
}

export function ChangePasswordForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[] | undefined>>(
    {},
  );

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const result = changePasswordSchema.safeParse({
      currentPassword: String(formData.get("currentPassword") ?? ""),
      password: String(formData.get("password") ?? ""),
      confirmPassword: String(formData.get("confirmPassword") ?? ""),
    });

    setErrors({});
    if (!result.success) {
      setErrors(result.error.flatten().fieldErrors);
      return;
    }

    setIsSubmitting(true);
    authService
      .changePassword({
        currentPassword: result.data.currentPassword,
        password: result.data.password,
      })
      .then(() => {
        toast.success("Password changed", {
          description: "Please sign in again with your new password.",
        });
        router.replace("/signin");
      })
      .catch((error) => {
        const message = getErrorMessage(
          error,
          "Unable to change password. Please try again.",
        );
        const field = message.includes("Current password")
          ? "currentPassword"
          : "password";
        setErrors({ [field]: [message] });
      })
      .finally(() => setIsSubmitting(false));
  }

  return (
    <Card className="max-w-xl">
      <CardHeader>
        <CardTitle>Change password</CardTitle>
        <CardDescription>
          Changing your password signs you out on all devices.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} noValidate className="grid gap-4">
          <FormField
            id="currentPassword"
            label="Current password"
            error={errors.currentPassword?.[0]}
          >
            <PasswordInput
              id="currentPassword"
              name="currentPassword"
              autoComplete="current-password"
              required
              className={formInputClassName}
              aria-invalid={!!errors.currentPassword}
            />
          </FormField>
          <FormField
            id="password"
            label="New password"
            error={errors.password?.[0]}
          >
            <PasswordInput
              id="password"
              name="password"
              autoComplete="new-password"
              required
              showCriteriaTooltip
              className={formInputClassName}
              aria-invalid={!!errors.password}
            />
          </FormField>
          <FormField
            id="confirmPassword"
            label="Confirm new password"
            error={errors.confirmPassword?.[0]}
          >
            <PasswordInput
              id="confirmPassword"
              name="confirmPassword"
              autoComplete="new-password"
              required
              className={formInputClassName}
              aria-invalid={!!errors.confirmPassword}
            />
          </FormField>
          <Button type="submit" disabled={isSubmitting} className="mt-2 w-fit">
            {isSubmitting ? "Changing password..." : "Change password"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
