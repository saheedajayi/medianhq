"use client";

import { type FormEvent, type ReactNode, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/base/button";
import { Input } from "@/components/ui/base/input";
import { Label } from "@/components/ui/base/label";
import { FormField, formInputClassName } from "@/components/ui/custom/form-field";
import { authService } from "@/services/auth";

import type { ApiError } from "@/services/api-client";

const signupSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(8, "Password must be at least 8 characters"),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

function getErrorMessage(error: unknown, fallback: string) {
  const apiError = error as Partial<ApiError>;

  return typeof apiError.message === "string" && apiError.message.trim()
    ? apiError.message
    : fallback;
}

export function SignupPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    
    const result = signupSchema.safeParse({
      firstName: String(formData.get("firstName") ?? ""),
      lastName: String(formData.get("lastName") ?? ""),
      email: String(formData.get("email") ?? ""),
      password: String(formData.get("password") ?? ""),
      confirmPassword: String(formData.get("confirmPassword") ?? ""),
    });

    if (!result.success) {
      toast.error("Validation error", {
        description: result.error.errors[0]?.message ?? "Please check your details.",
      });
      return;
    }

    setIsSubmitting(true);

    const { email, firstName, lastName, password } = result.data;

    authService
      .register({
        firstName,
        lastName,
        email,
        password,
        role: "MENTEE",
      })
      .then((response) => {
        toast.success("Account created", {
          description: `${response.data.user.firstName}, welcome to Median.`,
        });
        router.push(`/email-verification?email=${encodeURIComponent(email)}`);
      })
      .catch((error) => {
        toast.error("Unable to create account", {
          description: getErrorMessage(error, "Please check your details."),
        });
      })
      .finally(() => setIsSubmitting(false));
  }

  function showSocialNotice(provider: string) {
    toast.info(`${provider} sign up is coming soon`, {
      description: "Create your account with email for now.",
    });
  }

  return (
    <>
      <header className="mb-10 text-center">
        <h1 className="text-2xl font-semibold tracking-[-0.02em] text-[#4b100d]">
          Join Median
        </h1>
        <p className="mt-2 text-base text-[#344054]">
          Grow with clarity and confidence.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="grid gap-4">
        <button
          type="button"
          onClick={() => showSocialNotice("LinkedIn")}
          className="flex h-12 items-center justify-center rounded-lg border border-[#cbd5e1] bg-white text-base font-medium text-[#26344d] shadow-xs transition-colors hover:bg-slate-50"
        >
          Continue with LinkedIn
        </button>
        <button
          type="button"
          onClick={() => showSocialNotice("Google")}
          className="flex h-12 items-center justify-center rounded-lg border border-[#cbd5e1] bg-white text-base font-medium text-[#26344d] shadow-xs transition-colors hover:bg-slate-50"
        >
          Continue with Google
        </button>

        <div className="flex items-center gap-3 py-1 text-sm text-[#b5bdcc]">
          <span className="h-px flex-1 bg-[#e1e5eb]" />
          Or
          <span className="h-px flex-1 bg-[#e1e5eb]" />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <FormField id="firstName" label="First name" compact={false}>
            <Input
              id="firstName"
              name="firstName"
              autoComplete="given-name"
              required
              className={formInputClassName}
              placeholder="Amara"
            />
          </FormField>
          <FormField id="lastName" label="Last name" compact={false}>
            <Input
              id="lastName"
              name="lastName"
              autoComplete="family-name"
              required
              className={formInputClassName}
              placeholder="Okafor"
            />
          </FormField>
        </div>

        <FormField id="signupEmail" label="Email address">
          <Input
            id="signupEmail"
            name="email"
            type="email"
            autoComplete="email"
            required
            className={formInputClassName}
            placeholder="name@gmail.com"
          />
        </FormField>

        <div className="grid gap-3 sm:grid-cols-2">
          <FormField id="signupPassword" label="Password">
            <Input
              id="signupPassword"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              className={formInputClassName}
              placeholder="Enter password"
            />
          </FormField>
          <FormField id="confirmPassword" label="Confirm password">
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              className={formInputClassName}
              placeholder="Confirm password"
            />
          </FormField>
        </div>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="mt-2 h-12 rounded-full text-base font-medium text-white"
        >
          {isSubmitting ? "Creating account..." : "Create Account"}
        </Button>

        <p className="text-center text-base text-[#141c2e]">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-primary hover:underline"
          >
            Log in
          </Link>
        </p>
      </form>
    </>
  );
}
