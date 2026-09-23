"use client";

import {
  type FormEvent,
  type ReactNode,
  useEffect,
  useState,
  useTransition,
} from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
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
import { cn } from "@/lib/utils";
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
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get("redirect");
  const [isNavigatingToReset, startTransition] = useTransition();
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
        const stage = response.data.accountStage;
        if (
          (stage === "READY" || stage === "MENTOR_PENDING") &&
          redirectParam &&
          redirectParam.startsWith("/")
        ) {
          router.replace(redirectParam);
          return;
        }
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
  }, [redirectParam, router]);

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
        const stage = response.data.user.accountStage;
        if (
          (stage === "READY" || stage === "MENTOR_PENDING") &&
          redirectParam &&
          redirectParam.startsWith("/")
        ) {
          router.replace(redirectParam);
          return;
        }
        router.replace(
          getAuthDestination(response.data.user, {
            retryEmail: response.data.emailSent === false,
          }),
        );
      })
      .catch((error: unknown) => {
        const submittedEmail = result.data.email;
        const emailQuery = submittedEmail
          ? `?email=${encodeURIComponent(submittedEmail)}`
          : "";

        const status = (error as Partial<ApiError>)?.status;
        const rawMessage = ((error as Partial<ApiError>)?.message ?? "").toLowerCase();
        const isNetworkError =
          status === 0 ||
          rawMessage.includes("network") ||
          rawMessage.includes("timeout") ||
          rawMessage.includes("failed to fetch") ||
          (error as { code?: string })?.code === "ERR_NETWORK";
        const isServerError = typeof status === "number" && status >= 500;

        if (isNetworkError) {
          toast.error("Network Error", {
            description: "Unable to connect to the server. Please check your internet connection and try again.",
          });
          return;
        }

        if (isServerError) {
          toast.error("Server Error", {
            description: "Our services are temporarily unavailable. Please try again in a few moments.",
          });
          return;
        }

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
          href={authService.getOAuthUrl("linkedin")}
          className="flex h-11 cursor-pointer items-center justify-center rounded-full border border-[#D0D5DD] bg-white text-sm font-medium text-[#344054] shadow-xs transition-all hover:border-[#98A2B3] hover:bg-slate-50 active:scale-[0.99]"
        >
          Log in with LinkedIn
        </a>
        <a
          href={authService.getOAuthUrl("google")}
          className="flex h-11 cursor-pointer items-center justify-center rounded-full border border-[#D0D5DD] bg-white text-sm font-medium text-[#344054] shadow-xs transition-all hover:border-[#98A2B3] hover:bg-slate-50 active:scale-[0.99]"
        >
          Log in with Google
        </a>

        <div className="flex items-center gap-3 py-1 text-sm text-[#98A2B3]">
          <span className="h-px flex-1 bg-[#EAECF0]" />
          Or
          <span className="h-px flex-1 bg-[#EAECF0]" />
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
              onClick={(e) => {
                if (
                  !e.defaultPrevented &&
                  e.button === 0 &&
                  !e.metaKey &&
                  !e.ctrlKey &&
                  !e.altKey &&
                  !e.shiftKey
                ) {
                  e.preventDefault();
                  startTransition(() => {
                    router.push("/reset-password");
                  });
                }
              }}
              aria-disabled={isNavigatingToReset}
              className={cn(
                "text-sm font-medium text-[#141c2e] transition-opacity hover:underline",
                isNavigatingToReset && "pointer-events-none opacity-50",
              )}
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
