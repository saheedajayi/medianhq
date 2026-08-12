"use client";

import { type FormEvent, type ReactNode, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/base/button";
import { Input } from "@/components/ui/base/input";
import { Label } from "@/components/ui/base/label";
import { FormField, formInputClassName } from "@/components/ui/custom/form-field";
import { PasswordInput } from "@/components/ui/custom/password-input";
import { passwordSchema } from "@/lib/validations";
import { authService } from "@/services/auth";

import type { ApiError } from "@/services/api-client";

const signupSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  password: passwordSchema,
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
  const searchParams = useSearchParams();
  const defaultEmail = searchParams.get("email") ?? "";

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[] | undefined>>({});

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

    setErrors({});

    if (!result.success) {
      setErrors(result.error.flatten().fieldErrors);
      toast.error("Validation error", {
        description: "Please check the highlighted fields.",
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
      })
      .then((response) => {
        toast.success("Account created", {
          description: "Please check your email to verify your account.",
        });

        const retryParam = response.data.emailSent === false ? "&retryEmail=true" : "";
        router.push(`/email-verification?email=${encodeURIComponent(email)}${retryParam}`);
      })
      .catch((error) => {
        toast.error("Unable to create account", {
          description: getErrorMessage(error, "Please check your details."),
        });
      })
      .finally(() => setIsSubmitting(false));
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

      <form onSubmit={handleSubmit} noValidate className="grid gap-4">
        <a
          href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1'}/auth/linkedin`}
          className="flex h-12 items-center justify-center rounded-lg border border-[#cbd5e1] bg-white text-base font-medium text-[#26344d] shadow-xs transition-colors hover:bg-slate-50"
        >
          Continue with LinkedIn
        </a>
        <a
          href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1'}/auth/google`}
          className="flex h-12 items-center justify-center rounded-lg border border-[#cbd5e1] bg-white text-base font-medium text-[#26344d] shadow-xs transition-colors hover:bg-slate-50"
        >
          Continue with Google
        </a>

        <div className="flex items-center gap-3 py-1 text-sm text-[#b5bdcc]">
          <span className="h-px flex-1 bg-[#e1e5eb]" />
          Or
          <span className="h-px flex-1 bg-[#e1e5eb]" />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <FormField id="firstName" label="First name" compact={false} error={errors.firstName?.[0]}>
            <Input
              id="firstName"
              name="firstName"
              autoComplete="given-name"
              required
              className={formInputClassName}
              placeholder="Amara"
              aria-invalid={!!errors.firstName}
            />
          </FormField>
          <FormField id="lastName" label="Last name" compact={false} error={errors.lastName?.[0]}>
            <Input
              id="lastName"
              name="lastName"
              autoComplete="family-name"
              required
              className={formInputClassName}
              placeholder="Okafor"
              aria-invalid={!!errors.lastName}
            />
          </FormField>
        </div>

        <FormField id="signupEmail" label="Email address" error={errors.email?.[0]}>
          <Input
            id="signupEmail"
            name="email"
            type="email"
            autoComplete="email"
            required
            defaultValue={defaultEmail}
            className={formInputClassName}
            placeholder="name@gmail.com"
            aria-invalid={!!errors.email}
          />
        </FormField>

        <div className="grid gap-3 sm:grid-cols-2">
          <FormField id="signupPassword" label="Password" error={errors.password?.[0]}>
            <PasswordInput
              id="signupPassword"
              name="password"
              autoComplete="new-password"
              required
              showCriteriaTooltip
              className={formInputClassName}
              placeholder="Enter password"
              aria-invalid={!!errors.password}
            />
          </FormField>
          <FormField id="confirmPassword" label="Confirm password" error={errors.confirmPassword?.[0]}>
            <PasswordInput
              id="confirmPassword"
              name="confirmPassword"
              autoComplete="new-password"
              required
              className={formInputClassName}
              placeholder="Confirm password"
              aria-invalid={!!errors.confirmPassword}
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

        <p className="text-center text-sm text-[#141c2e]">
          Already have an account?{" "}
          <Link
            href="/signin"
            className="font-medium hover:underline"
            style={{ color: '#ff5514' }}
          >
            Log in
          </Link>
        </p>
      </form>
    </>
  );
}
