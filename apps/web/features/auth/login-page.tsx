"use client";

import { type FormEvent, type ReactNode, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

import { Button } from "@/components/ui/base/button";
import { Input } from "@/components/ui/base/input";
import {
  FormField,
  formInputClassName,
} from "@/components/ui/custom/form-field";
import { PasswordInput } from "@/components/ui/custom/password-input";
import { getAuthDestination } from "@/lib/auth-routing";
import { authService } from "@/services/auth";
import type { ApiError } from "@/services/api-client";

function getErrorMessage(error: unknown, fallback: string) {
  const apiError = error as Partial<ApiError>;

  return typeof apiError.message === "string" && apiError.message.trim()
    ? apiError.message
    : fallback;
}

export function LoginPage() {
  const router = useRouter();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[] | undefined>>(
    {},
  );

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

    const result = loginSchema.safeParse({
      email: String(formData.get("email") ?? ""),
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

    setIsSubmitting(true);

    authService
      .login(result.data)
      .then((response) => {
        toast.success("Logged in", {
          description: `Welcome back.`,
        });
        router.replace(
          getAuthDestination(response.data.user, {
            retryEmail: response.data.emailSent === false,
          }),
        );
      })
      .catch(() => {
        const submittedEmail = result.data.email;
        const emailQuery = submittedEmail
          ? `?email=${encodeURIComponent(submittedEmail)}`
          : "";

        toast.error("Unable to log in", {
          description: (
            <span className="block leading-snug">
              <span>Invalid email or password.</span>
              <span className="mt-1 block">
                New to Median?{" "}
                <Link
                  href={`/signup${emailQuery}`}
                  className="font-medium underline hover:opacity-80"
                  style={{ color: "#ff5514" }}
                >
                  Create account
                </Link>
              </span>
            </span>
          ),
        });
      })
      .finally(() => setIsSubmitting(false));
  }

  return (
    <>
      <header className="mb-10 text-center">
        <h1 className="text-2xl font-semibold tracking-[-0.02em] text-[#4b100d]">
          Welcome Back
        </h1>
        <p className="mt-2 text-base text-[#344054]">Log in to Median</p>
      </header>

      <form onSubmit={handleSubmit} noValidate className="grid gap-4">
        <a
          href={`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1"}/auth/linkedin`}
          className="flex h-12 items-center justify-center rounded-lg border border-[#cbd5e1] bg-white text-base font-medium text-[#26344d] shadow-xs transition-colors hover:bg-slate-50"
        >
          Log in with LinkedIn
        </a>
        <a
          href={`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1"}/auth/google`}
          className="flex h-12 items-center justify-center rounded-lg border border-[#cbd5e1] bg-white text-base font-medium text-[#26344d] shadow-xs transition-colors hover:bg-slate-50"
        >
          Log in with Google
        </a>

        <div className="flex items-center gap-3 py-1 text-sm text-[#b5bdcc]">
          <span className="h-px flex-1 bg-[#e1e5eb]" />
          Or
          <span className="h-px flex-1 bg-[#e1e5eb]" />
        </div>
        <FormField
          id="loginEmail"
          label="Email address"
          error={errors.email?.[0]}
        >
          <Input
            id="loginEmail"
            name="email"
            type="email"
            autoComplete="email"
            required
            className={formInputClassName}
            placeholder="name@gmail.com"
            aria-invalid={!!errors.email}
          />
        </FormField>

        <FormField
          id="loginPassword"
          label="Password"
          error={errors.password?.[0]}
          action={
            <Link
              href="/reset-password"
              className="text-sm font-medium text-[#141c2e] hover:underline"
            >
              Forgot password?
            </Link>
          }
        >
          <PasswordInput
            id="loginPassword"
            name="password"
            autoComplete="current-password"
            required
            className={formInputClassName}
            placeholder="Enter password"
            aria-invalid={!!errors.password}
          />
        </FormField>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="mt-2 h-12 rounded-full text-base font-medium text-white"
        >
          {isSubmitting ? "Logging in..." : "Log in"}
        </Button>

        <p className="text-center text-sm font-medium text-[#141c2e]">
          Don't have an account?{" "}
          <Link
            href="/signup"
            className="hover:underline"
            style={{ color: "#ff5514" }}
          >
            Create account
          </Link>
        </p>
      </form>
    </>
  );
}
