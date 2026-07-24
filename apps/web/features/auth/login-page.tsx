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
  action,
}: {
  id: string;
  label: string;
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={id} className="text-sm font-normal text-[#141c2e]">
        {label}
      </Label>
      {children}
      {action && <div className="text-right">{action}</div>}
    </div>
  );
}

export function LoginPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");

    setIsSubmitting(true);

    authService
      .login({
        email,
        password,
      })
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
        <Field id="loginEmail" label="Email address">
          <Input
            id="loginEmail"
            name="email"
            type="email"
            autoComplete="email"
            required
            className={inputClassName}
            placeholder="name@gmail.com"
          />
        </Field>

        <Field
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
            className={inputClassName}
            placeholder="Enter password"
          />
        </Field>

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
