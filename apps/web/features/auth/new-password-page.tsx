"use client";

import { type FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { z } from "zod";

const newPasswordSchema = z.object({
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
});

import { Button } from "@/components/ui/base/button";
import { FormField, formInputClassName } from "@/components/ui/custom/form-field";
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[] | undefined>>({});

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    
    const result = newPasswordSchema.safeParse({
      password: String(formData.get("password") ?? ""),
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
        router.push("/login");
      })
      .catch((error) => {
        toast.error("Unable to reset password", {
          description: getErrorMessage(error, "Please try again later. The link may have expired."),
        });
      })
      .finally(() => setIsSubmitting(false));
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
        <FormField id="password" label="New Password" error={errors.password?.[0]}>
          <PasswordInput
            id="password"
            name="password"
            autoComplete="new-password"
            required
            className={formInputClassName}
            placeholder="Min 8 characters"
            aria-invalid={!!errors.password}
          />
        </FormField>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="mt-6 h-12 rounded-full text-base font-medium text-white"
        >
          {isSubmitting ? "Saving..." : "Save password"}
        </Button>
      </form>
    </>
  );
}
