"use client";

import { type FormEvent, type ReactNode, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/base/button";
import { Input } from "@/components/ui/base/input";
import { Label } from "@/components/ui/base/label";
import { FormField, formInputClassName } from "@/components/ui/custom/form-field";
import { PasswordInput } from "@/components/ui/custom/password-input";
import { getAuthDestination } from "@/lib/auth-routing";
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

  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[] | undefined>>({});
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    let isCancelled = false;

    authService
      .me()
      .then((response) => {
        if (isCancelled) return;
        const destination = getAuthDestination(response.data);
        router.replace(destination);
      })
      .catch(() => {
        if (!isCancelled) {
          setIsCheckingAuth(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [router]);

  if (isCheckingAuth) {
    return (
      <p className="py-10 text-center text-sm text-[#667085]">
        Checking account...
      </p>
    );
  }


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
      <header className="mb-6 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-[#4E0703] sm:text-[26px]">
          Join Median
        </h1>
        <p className="mt-2 text-sm text-[#475467]">
          Grow with and clarity and confidence.
        </p>
      </header>

      <form onSubmit={handleSubmit} noValidate className="grid gap-3.5">
        <a
          href={authService.getOAuthUrl("linkedin")}
          className="flex h-11 cursor-pointer items-center justify-center rounded-full border border-[#D0D5DD] bg-white text-sm font-medium text-[#344054] shadow-xs transition-all hover:border-[#98A2B3] hover:bg-slate-50 active:scale-[0.99]"
        >
          Continue with LinkedIn
        </a>
        <a
          href={authService.getOAuthUrl("google")}
          className="flex h-11 cursor-pointer items-center justify-center rounded-full border border-[#D0D5DD] bg-white text-sm font-medium text-[#344054] shadow-xs transition-all hover:border-[#98A2B3] hover:bg-slate-50 active:scale-[0.99]"
        >
          Continue with Google
        </a>

        <div className="flex items-center gap-3 py-1 text-sm text-[#98A2B3]">
          <span className="h-px flex-1 bg-[#EAECF0]" />
          Or
          <span className="h-px flex-1 bg-[#EAECF0]" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <FormField id="firstName" label="First name" error={errors.firstName?.[0]}>
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
          <FormField id="lastName" label="Last name" error={errors.lastName?.[0]}>
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

        <div className="grid grid-cols-2 gap-3">
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
          className="mt-2 h-12 w-full cursor-pointer rounded-full bg-[#FF5514] text-base font-medium text-white shadow-xs transition-all hover:bg-[#E84D12] active:scale-[0.99]"
        >
          {isSubmitting ? "Creating account..." : "Create account"}
        </Button>

        <p className="mt-1 text-center text-sm font-medium text-[#101828]">
          Already have an account?{" "}
          <Link
            href="/signin"
            className="font-semibold !text-[#FF5514] hover:underline"
          >
            Log in
          </Link>
        </p>
      </form>

      {mounted && typeof document !== "undefined" && document.getElementById("auth-footer-slot")
        ? createPortal(
            <div className="mt-6 text-center text-sm text-[#475467] leading-relaxed">
              <p>By continuing, you agree to Median’s</p>
              <p>
                <Link
                  href="/terms"
                  className="font-medium !text-[#FF5514] underline decoration-[#FF5514]/40 underline-offset-2 transition-all hover:text-[#E84D12] hover:decoration-[#E84D12]"
                >
                  terms of service
                </Link>{" "}
                &amp;{" "}
                <Link
                  href="/privacy"
                  className="font-medium !text-[#FF5514] underline decoration-[#FF5514]/40 underline-offset-2 transition-all hover:text-[#E84D12] hover:decoration-[#E84D12]"
                >
                  privacy policy
                </Link>
              </p>
            </div>,
            document.getElementById("auth-footer-slot")!
          )
        : null}
    </>
  );
}
