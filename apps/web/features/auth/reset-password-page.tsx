"use client";

import { type FormEvent, type ReactNode, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { z } from "zod";

const resetPasswordSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email address"),
});

import { Button } from "@/components/ui/base/button";
import { Input } from "@/components/ui/base/input";
import { Label } from "@/components/ui/base/label";
import { FormField, formInputClassName } from "@/components/ui/custom/form-field";
import { authService } from "@/services/auth";
import type { ApiError } from "@/services/api-client";

function getErrorMessage(error: unknown, fallback: string) {
  const apiError = error as Partial<ApiError>;

  return typeof apiError.message === "string" && apiError.message.trim()
    ? apiError.message
    : fallback;
}

export function ResetPasswordPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    
    const result = resetPasswordSchema.safeParse({
      email: String(formData.get("email") ?? ""),
    });

    if (!result.success) {
      toast.error("Validation error", {
        description: result.error.errors[0]?.message ?? "Please check your email.",
      });
      return;
    }

    const { email } = result.data;

    setIsSubmitting(true);

    // Placeholder for reset password API call
    // authService.resetPassword({ email })
    // Mocking the API call for now if it doesn't exist
    new Promise((resolve) => setTimeout(resolve, 1000))
      .then(() => {
        toast.success("Reset link sent", {
          description: "Check your email for the reset link.",
        });
        // Optional: redirect to login or show success state
        // router.push("/login");
      })
      .catch((error) => {
        toast.error("Unable to send reset link", {
          description: getErrorMessage(error, "Please try again later."),
        });
      })
      .finally(() => setIsSubmitting(false));
  }

  return (
    <>
      <header className="mb-10 text-center">
        <h1 className="text-2xl font-semibold tracking-[-0.02em] text-[#4b100d]">
          Reset Password
        </h1>
        <p className="mt-2 text-base text-[#344054]">
          Enter the email associated with your account
          <br />
          and we'll send you a reset link.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="grid gap-4">
        <FormField id="resetEmail" label="Email address">
          <Input
            id="resetEmail"
            name="email"
            type="email"
            autoComplete="email"
            required
            className={formInputClassName}
            placeholder="AbduLlahmumuni@medianhq.co"
          />
        </FormField>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="mt-6 h-12 rounded-full text-base font-medium text-white"
        >
          {isSubmitting ? "Sending..." : "Send email"}
        </Button>
      </form>
    </>
  );
}
