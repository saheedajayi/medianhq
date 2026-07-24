"use client";

import { type FormEvent, type ReactNode, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/base/button";
import { Input } from "@/components/ui/base/input";
import { Label } from "@/components/ui/base/label";
import { authService } from "@/services/auth";
import type { ApiError } from "@/services/api-client";

const inputClassName =
  "h-11 border-text-200 bg-white px-4 text-text-900 placeholder:text-text-400 focus-visible:border-primary focus-visible:ring-primary/15";
const signupInputClassName =
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
  compact = false,
  children,
}: {
  id: string;
  label: string;
  compact?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="grid gap-2">
      <Label
        htmlFor={id}
        className={
          compact
            ? "text-sm font-normal text-[#141c2e]"
            : "text-base font-semibold text-text-700"
        }
      >
        {label}
      </Label>
      {children}
    </div>
  );
}

export function SignupPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");
    const confirmPassword = String(formData.get("confirmPassword") ?? "");

    if (password !== confirmPassword) {
      toast.error("Passwords do not match", {
        description: "Please re-enter your password confirmation.",
      });
      return;
    }

    setIsSubmitting(true);

    authService
      .register({
        firstName: String(formData.get("firstName") ?? ""),
        lastName: String(formData.get("lastName") ?? ""),
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
          <Field id="firstName" label="First name">
            <Input
              id="firstName"
              name="firstName"
              autoComplete="given-name"
              required
              className={inputClassName}
              placeholder="Amara"
            />
          </Field>
          <Field id="lastName" label="Last name">
            <Input
              id="lastName"
              name="lastName"
              autoComplete="family-name"
              required
              className={inputClassName}
              placeholder="Okafor"
            />
          </Field>
        </div>

        <Field id="signupEmail" label="Email address" compact>
          <Input
            id="signupEmail"
            name="email"
            type="email"
            autoComplete="email"
            required
            className={signupInputClassName}
            placeholder="name@gmail.com"
          />
        </Field>

        <div className="grid gap-3 sm:grid-cols-2">
          <Field id="signupPassword" label="Password" compact>
            <Input
              id="signupPassword"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              className={signupInputClassName}
              placeholder="Enter password"
            />
          </Field>
          <Field id="confirmPassword" label="Confirm password" compact>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              className={signupInputClassName}
              placeholder="Confirm password"
            />
          </Field>
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
            className="font-medium text-[#FF5514] hover:underline"
          >
            Log in
          </Link>
        </p>
      </form>
    </>
  );
}
