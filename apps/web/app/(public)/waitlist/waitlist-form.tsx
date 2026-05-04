"use client";

import { type FormEvent, type ReactNode } from "react";
import { ArrowRight, Check, CheckCircle2 } from "lucide-react";
import { z } from "zod";

import { Button } from "@/components/ui/base/button";
import { Input } from "@/components/ui/base/input";
import { Label } from "@/components/ui/base/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/base/select";
import { useWaitlistStore } from "@/features/waitlist/store";
import { useCreateWaitlistEntry } from "@/services/waitlist/queries/waitlist.queries";
import { AudienceSwitch } from "./audience-switch";

const waitlistSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required."),
  lastName: z.string().trim().min(1, "Last name is required."),
  email: z.string().trim().email("Enter a valid email address."),
  audience: z.enum(["MENTEE", "MENTOR"], {
    message: "Choose whether you're joining as a mentor or mentee.",
  }),
  location: z.preprocess(
    (value) =>
      typeof value === "string" && value.trim().length === 0
        ? undefined
        : value,
    z.string().trim().optional(),
  ),
  expertise: z.string().trim().min(1, "Area of expertise is required."),
  currentRole: z.string().trim().min(1, "Current role is required."),
  company: z.string().trim().min(1, "Company is required."),
});

function Field({
  id,
  label,
  children,
  error,
}: {
  id: string;
  label: string;
  children: ReactNode;
  error?: string;
}) {
  return (
    <div className="grid min-w-0 gap-2 text-left">
      <Label htmlFor={id} className="text-base font-semibold text-text-700">
        {label}
      </Label>
      {children}
      {error ? (
        <p id={`${id}-error`} className="text-sm font-semibold text-red-600">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function WaitlistForm({ benefits }: { benefits: string[] }) {
  const audience = useWaitlistStore((state) => state.audience);
  const submitState = useWaitlistStore((state) => state.submitState);
  const message = useWaitlistStore((state) => state.message);
  const errors = useWaitlistStore((state) => state.errors);
  const setAudience = useWaitlistStore((state) => state.setAudience);
  const setSubmitState = useWaitlistStore((state) => state.setSubmitState);
  const setMessage = useWaitlistStore((state) => state.setMessage);
  const setErrors = useWaitlistStore((state) => state.setErrors);
  const resetFeedback = useWaitlistStore((state) => state.resetFeedback);
  const waitlistMutation = useCreateWaitlistEntry();
  const createWaitlistEntry = waitlistMutation.mutate;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = event.currentTarget;
    const formData = new FormData(form);
    const result = waitlistSchema.safeParse({
      firstName: String(formData.get("firstName") ?? ""),
      lastName: String(formData.get("lastName") ?? ""),
      email: String(formData.get("email") ?? ""),
      audience: audience === "mentors" ? "MENTOR" : "MENTEE",
      location: String(formData.get("location") ?? ""),
      expertise: String(formData.get("expertise") ?? ""),
      currentRole: String(formData.get("role") ?? ""),
      company: String(formData.get("company") ?? ""),
    });

    resetFeedback();

    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;

      setSubmitState("error");
      setErrors({
        firstName: fieldErrors.firstName?.[0],
        lastName: fieldErrors.lastName?.[0],
        email: fieldErrors.email?.[0],
        audience: fieldErrors.audience?.[0],
        location: fieldErrors.location?.[0],
        expertise: fieldErrors.expertise?.[0],
        currentRole: fieldErrors.currentRole?.[0],
        company: fieldErrors.company?.[0],
      });
      setMessage("Please fix the highlighted fields.");
      return;
    }

    setSubmitState("submitting");

    createWaitlistEntry(result.data, {
      onSuccess: () => {
        form.reset();
        setSubmitState("success");
        setErrors({});
        setMessage("You're on the waitlist. We'll be in touch soon.");
      },
      onError: () => {
        setSubmitState("error");
        setMessage("We couldn't save your details. Please try again.");
      },
    });
  }

  const isSubmitting = submitState === "submitting" || waitlistMutation.isPending;

  return (
    <>
      <AudienceSwitch value={audience} onValueChange={setAudience} />

      <div
        className="mt-8 flex max-w-2xl flex-wrap justify-center gap-4"
        style={{ maxWidth: "calc(100vw - 40px)" }}
      >
        {benefits.map((benefit) => (
          <div
            key={benefit}
            className="inline-flex min-h-9 items-center gap-2 rounded-full border border-accent-150 bg-[#fffaf5] px-6 text-sm font-semibold text-text-700"
          >
            <Check className="size-4 text-primary" strokeWidth={3} />
            {benefit}
          </div>
        ))}
      </div>

      <form
        id="waitlist-form"
        noValidate
        onSubmit={handleSubmit}
        className="mt-8 grid min-w-0 gap-5 rounded-lg border border-text-200 bg-white p-6 text-left shadow-xs sm:p-8"
        style={{ width: "100%", maxWidth: "min(700px, calc(100vw - 40px))" }}
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <Field id="firstName" label="First name *" error={errors.firstName}>
            <Input
              id="firstName"
              name="firstName"
              aria-describedby={
                errors.firstName ? "firstName-error" : undefined
              }
              aria-invalid={Boolean(errors.firstName)}
              placeholder="Amara"
              required
              className="h-11 border-text-200 bg-white px-4 text-text-900 placeholder:text-text-400 focus-visible:border-primary focus-visible:ring-primary/15"
            />
          </Field>
          <Field id="lastName" label="Last name *" error={errors.lastName}>
            <Input
              id="lastName"
              name="lastName"
              aria-describedby={errors.lastName ? "lastName-error" : undefined}
              aria-invalid={Boolean(errors.lastName)}
              placeholder="Okafor"
              required
              className="h-11 border-text-200 bg-white px-4 text-text-900 placeholder:text-text-400 focus-visible:border-primary focus-visible:ring-primary/15"
            />
          </Field>
        </div>
        <Field id="email" label="Email *" error={errors.email}>
          <Input
            id="email"
            name="email"
            type="email"
            aria-describedby={errors.email ? "email-error" : undefined}
            aria-invalid={Boolean(errors.email)}
            placeholder="you@gmail.com"
            required
            className="h-11 border-text-200 bg-white px-4 text-text-900 placeholder:text-text-400 focus-visible:border-primary focus-visible:ring-primary/15"
          />
        </Field>
        <Field id="location" label="Location" error={errors.location}>
          <Select name="location">
            <SelectTrigger
              id="location"
              aria-describedby={errors.location ? "location-error" : undefined}
              aria-invalid={Boolean(errors.location)}
              className="h-11 border-text-200 bg-white px-4 text-text-500 focus-visible:border-primary focus-visible:ring-primary/15"
            >
              <SelectValue placeholder="Select location..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="nigeria">Nigeria</SelectItem>
              <SelectItem value="ghana">Ghana</SelectItem>
              <SelectItem value="kenya">Kenya</SelectItem>
              <SelectItem value="south-africa">South Africa</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        <Field
          id="expertise"
          label="Area of expertise *"
          error={errors.expertise}
        >
          <Select name="expertise" required>
            <SelectTrigger
              id="expertise"
              aria-describedby={
                errors.expertise ? "expertise-error" : undefined
              }
              aria-invalid={Boolean(errors.expertise)}
              className="h-11 border-text-200 bg-white px-4 text-text-500 focus-visible:border-primary focus-visible:ring-primary/15"
            >
              <SelectValue placeholder="Select area..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="finance">Finance</SelectItem>
              <SelectItem value="technology">Technology</SelectItem>
              <SelectItem value="business">Business</SelectItem>
              <SelectItem value="consulting">Consulting</SelectItem>
              <SelectItem value="creative">Creative</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        <Field id="role" label="Current role *" error={errors.currentRole}>
          <Select name="role" required>
            <SelectTrigger
              id="role"
              aria-describedby={errors.currentRole ? "role-error" : undefined}
              aria-invalid={Boolean(errors.currentRole)}
              className="h-11 border-text-200 bg-white px-4 text-text-500 focus-visible:border-primary focus-visible:ring-primary/15"
            >
              <SelectValue placeholder="Select role..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="founder">Founder</SelectItem>
              <SelectItem value="executive">Executive</SelectItem>
              <SelectItem value="manager">Manager</SelectItem>
              <SelectItem value="specialist">Specialist</SelectItem>
              <SelectItem value="student">Student</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        <Field
          id="company"
          label="Company you work at *"
          error={errors.company}
        >
          <Input
            id="company"
            name="company"
            aria-describedby={errors.company ? "company-error" : undefined}
            aria-invalid={Boolean(errors.company)}
            placeholder="Company name"
            required
            className="h-11 border-text-200 bg-white px-4 text-text-900 placeholder:text-text-400 focus-visible:border-primary focus-visible:ring-primary/15"
          />
        </Field>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="mt-2 h-12 gap-3 px-5 text-base font-bold text-white"
        >
          {isSubmitting ? "Joining..." : "Join the waitlist"}
          <ArrowRight className="size-5" />
        </Button>
        {message ? (
          <p
            className={
              submitState === "success"
                ? "flex items-center justify-center gap-2 text-center text-sm font-semibold text-green-700"
                : "text-center text-sm font-semibold text-red-600"
            }
            role="status"
          >
            {submitState === "success" ? (
              <CheckCircle2 className="size-4" />
            ) : null}
            {message}
          </p>
        ) : (
          <p className="text-center text-sm text-text-700">
            No spam. Unsubscribe anytime. Your data is safe.
          </p>
        )}
      </form>
    </>
  );
}
