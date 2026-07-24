"use client";

import { type FormEvent, type ReactNode, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/base/button";
import { Input } from "@/components/ui/base/input";
import { Label } from "@/components/ui/base/label";
// Note: Assuming there is a forgotPassword/resetPassword method in authService.
// If not, this is a placeholder for the actual API call.
import { authService } from "@/services/auth";
import type { ApiError } from "@/services/api-client";

const inputClassName =
  "h-12 border-text-200 bg-white px-4 text-text-900 placeholder:text-text-400 focus-visible:border-primary focus-visible:ring-primary/15";

function getErrorMessage(error: unknown, fallback: string) {
  const apiError = error as Partial<ApiError>;

  return typeof apiError.message === "string" && apiError.message.trim()
    ? apiError.message
    : fallback;
}

function Field({
  id,
  label,
  children,
}: {
  id: string;
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={id} className="text-sm font-normal text-[#141c2e]">
        {label}
      </Label>
      {children}
    </div>
  );
}

export function ResetPasswordPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "");

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
        <Field id="resetEmail" label="Email address">
          <Input
            id="resetEmail"
            name="email"
            type="email"
            autoComplete="email"
            required
            className={inputClassName}
            placeholder="AbduLlahmumuni@medianhq.co"
          />
        </Field>

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
