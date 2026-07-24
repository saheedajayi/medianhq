"use client";

import { type FormEvent, type ReactNode, useState } from "react";
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
import { FormField, formInputClassName } from "@/components/ui/custom/form-field";
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
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    
    const result = loginSchema.safeParse({
      email: String(formData.get("email") ?? ""),
      password: String(formData.get("password") ?? ""),
    });

    if (!result.success) {
      toast.error("Validation error", {
        description: result.error.errors[0]?.message ?? "Please check your details.",
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
        router.push("/dashboard");
      })
      .catch((error) => {
        toast.error("Unable to log in", {
          description: getErrorMessage(error, "Please check your details."),
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
        <p className="mt-2 text-base text-[#344054]">
          Log in to Median
        </p>
      </header>

      <form onSubmit={handleSubmit} className="grid gap-4">
        <FormField id="loginEmail" label="Email address">
          <Input
            id="loginEmail"
            name="email"
            type="email"
            autoComplete="email"
            required
            className={formInputClassName}
            placeholder="name@gmail.com"
          />
        </FormField>

        <FormField
          id="loginPassword"
          label="Password"
          action={
            <Link
              href="/reset-password"
              className="text-sm font-medium text-[#141c2e] hover:underline"
            >
              Forgot password?
            </Link>
          }
        >
          <Input
            id="loginPassword"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className={formInputClassName}
            placeholder="Enter password"
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
            className="text-primary hover:underline"
          >
            Create account
          </Link>
        </p>
      </form>
    </>
  );
}
