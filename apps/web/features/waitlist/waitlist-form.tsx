"use client";

import {
  type FormEvent,
  type ReactNode,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Check } from "lucide-react";
import { toast } from "sonner";
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
import { CountrySelect } from "@/components/ui/custom/country-select";
import { useWaitlistStore } from "@/features/waitlist/store";
import { waitlistQueryKeys } from "@/services/waitlist/queries/query-keys";
import { useCreateWaitlistEntry } from "@/services/waitlist/queries/waitlist.queries";
import type { WaitlistAudienceTab } from "@/services/waitlist";
import { AudienceSwitch } from "./audience-switch";

const waitlistContent: Record<
  WaitlistAudienceTab,
  {
    benefits: string[];
  }
> = {
  mentees: {
    benefits: [
      "Live sessions",
      "AI powered mentor matching",
      "Unlimited chat with mentors",
      "Global community",
    ],
  },
  mentors: {
    benefits: [
      "Earn from sessions",
      "Smart booking calendar",
      "Featured mentor placement",
      "Manage mentee roster",
    ],
  },
};

const emptyStringToUndefined = (value: unknown) =>
  typeof value === "string" && value.trim().length === 0 ? undefined : value;

const waitlistSchema = z
  .object({
    firstName: z.string().trim().min(1, "First name is required."),
    lastName: z.string().trim().min(1, "Last name is required."),
    email: z.string().trim().email("Enter a valid email address."),
    audience: z.enum(["MENTEE", "MENTOR"], {
      message: "Choose whether you're joining as a mentor or mentee.",
    }),
    location: z.preprocess(
      emptyStringToUndefined,
      z.string().trim().optional(),
    ),
    expertise: z.preprocess(
      emptyStringToUndefined,
      z.string().trim().optional(),
    ),
    currentRole: z.string().trim().min(1, "Current role is required."),
    company: z.preprocess(emptyStringToUndefined, z.string().trim().optional()),
    levelOfExperience: z.preprocess(
      emptyStringToUndefined,
      z.string().trim().optional(),
    ),
  })
  .superRefine((data, ctx) => {
    if (data.audience === "MENTOR") {
      if (!data.expertise) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["expertise"],
          message: "Area of expertise is required.",
        });
      }

      if (!data.company) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["company"],
          message: "Company is required.",
        });
      }
    }

    if (data.audience === "MENTEE" && !data.levelOfExperience) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["levelOfExperience"],
        message: "Level of experience is required.",
      });
    }
  });

const selectClassName =
  "h-11 border-text-200 bg-white px-4 text-text-500 focus-visible:border-primary focus-visible:ring-primary/15";
const inputClassName =
  "h-11 border-text-200 bg-white px-4 text-text-900 placeholder:text-text-400 focus-visible:border-primary focus-visible:ring-primary/15";

const contentMotion = {
  initial: { opacity: 0, y: 10, filter: "blur(3px)" },
  animate: { opacity: 1, y: 0, filter: "blur(0px)" },
  exit: { opacity: 0, y: -8, filter: "blur(3px)" },
  transition: { duration: 0.22, ease: "easeOut" },
} as const;

function OptionalStringSelectField({
  id,
  name,
  label,
  placeholder,
  error,
  required = false,
  options,
}: {
  id: string;
  name: string;
  label: string;
  placeholder: string;
  error?: string;
  required?: boolean;
  options: Array<{ label: string; value: string }>;
}) {
  return (
    <Field id={id} label={label} error={error}>
      <Select name={name} required={required}>
        <SelectTrigger
          id={id}
          aria-describedby={error ? `${id}-error` : undefined}
          aria-invalid={Boolean(error)}
          className={selectClassName}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </Field>
  );
}

function SearchableLocationField({ error }: { error?: string }) {
  return (
    <Field id="location" label="Location" error={error}>
      <CountrySelect
        id="location"
        name="location"
        error={error}
        placeholder="Search for a location..."
      />
    </Field>
  );
}

const expertiseOptions = [
  { value: "technology", label: "Technology" },
  { value: "finance", label: "Finance" },
  { value: "business", label: "Business" },
  { value: "consulting", label: "Consulting" },
];

const levelOfExperienceOptions = [
  { value: "student", label: "Student" },
  { value: "entry-level", label: "Entry Level" },
  { value: "mid-level", label: "Mid Level" },
  { value: "senior", label: "Senior" },
  { value: "founder", label: "Founder" },
];

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

export function WaitlistForm() {
  const audience = useWaitlistStore((state) => state.audience);
  const submitState = useWaitlistStore((state) => state.submitState);
  const errors = useWaitlistStore((state) => state.errors);
  const setAudience = useWaitlistStore((state) => state.setAudience);
  const setSubmitState = useWaitlistStore((state) => state.setSubmitState);
  const setMessage = useWaitlistStore((state) => state.setMessage);
  const setErrors = useWaitlistStore((state) => state.setErrors);
  const resetFeedback = useWaitlistStore((state) => state.resetFeedback);
  const resetFormState = useWaitlistStore((state) => state.resetFormState);
  const queryClient = useQueryClient();
  const waitlistMutation = useCreateWaitlistEntry();
  const createWaitlistEntry = waitlistMutation.mutate;
  const content = waitlistContent[audience];
  const isMentor = audience === "mentors";

  function handleAudienceChange(nextAudience: WaitlistAudienceTab) {
    setAudience(nextAudience);

    if (submitState !== "success") {
      resetFormState();
    }
  }

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
      levelOfExperience: String(formData.get("levelOfExperience") ?? ""),
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
        levelOfExperience: fieldErrors.levelOfExperience?.[0],
      });
      setMessage("Please fix the highlighted fields.");
      return;
    }

    setSubmitState("submitting");

    createWaitlistEntry(result.data, {
      onSuccess: (response) => {
        void queryClient.invalidateQueries({
          queryKey: waitlistQueryKeys.stats(),
        });
        const successMessage =
          response.message ?? "You're on the waitlist. We'll be in touch soon.";

        form.reset();
        setSubmitState("success");
        setErrors({});
        setMessage(successMessage);
        toast.success("You're on the waitlist", {
          description: successMessage,
        });
      },
      onError: (error) => {
        setSubmitState("error");

        if (error.status === 409) {
          setErrors({
            email: error.message,
          });
          setMessage(error.message);
          toast.error("Email already registered", {
            description: error.message,
          });
          return;
        }

        setMessage("We couldn't save your details. Please try again.");
        toast.error("We couldn't save your details", {
          description: "Please check your connection and try again.",
        });
      },
    });
  }

  const isSubmitting =
    submitState === "submitting" || waitlistMutation.isPending;

  return (
    <>
      <AudienceSwitch value={audience} onValueChange={handleAudienceChange} />

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={`benefits-${audience}`}
          className="mt-8 flex max-w-2xl flex-wrap justify-center gap-4"
          style={{ maxWidth: "calc(100vw - 40px)" }}
          {...contentMotion}
        >
          {content.benefits.map((benefit, index) => (
            <motion.div
              key={benefit}
              className="inline-flex min-h-9 items-center gap-2 rounded-full border border-accent-150 bg-[#fffaf5] px-6 text-sm font-semibold text-text-700"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04, duration: 0.2 }}
            >
              <Check className="size-4 text-primary" strokeWidth={3} />
              {benefit}
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>

      {submitState === "success" ? (
        <motion.div
          id="waitlist-form"
          className="mt-8 grid scroll-mt-8 place-items-center rounded-lg border border-text-200 bg-white px-6 py-8 text-center shadow-xs sm:scroll-mt-12 sm:px-10"
          style={{ width: "100%", maxWidth: "min(360px, calc(100vw - 40px))" }}
          {...contentMotion}
        >
          <p className="max-w-64 text-lg font-semibold leading-8 text-text-700">
            You&apos;re in! once we go live, you&apos;ll be the first to know.
          </p>
        </motion.div>
      ) : (
        <form
          id="waitlist-form"
          noValidate
          onSubmit={handleSubmit}
          className="mt-8 grid scroll-mt-8 min-w-0 gap-5 rounded-lg border border-text-200 bg-white p-6 text-left shadow-xs sm:scroll-mt-12 sm:p-8"
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
                aria-describedby={
                  errors.lastName ? "lastName-error" : undefined
                }
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
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={`fields-${audience}`}
              className="grid gap-5"
              layout
              {...contentMotion}
            >
              <SearchableLocationField error={errors.location} />
              {isMentor ? (
                <OptionalStringSelectField
                  id="expertise"
                  name="expertise"
                  label="Area of expertise *"
                  placeholder="Select area..."
                  error={errors.expertise}
                  required
                  options={expertiseOptions}
                />
              ) : null}
              <Field
                id="role"
                label="Current role *"
                error={errors.currentRole}
              >
                <Input
                  id="role"
                  name="role"
                  aria-describedby={
                    errors.currentRole ? "role-error" : undefined
                  }
                  aria-invalid={Boolean(errors.currentRole)}
                  placeholder="Product manager"
                  required
                  className={inputClassName}
                />
              </Field>
              {isMentor ? (
                <Field
                  id="company"
                  label="Company you work at *"
                  error={errors.company}
                >
                  <Input
                    id="company"
                    name="company"
                    aria-describedby={
                      errors.company ? "company-error" : undefined
                    }
                    aria-invalid={Boolean(errors.company)}
                    placeholder="Company name"
                    required
                    className={inputClassName}
                  />
                </Field>
              ) : (
                <OptionalStringSelectField
                  id="levelOfExperience"
                  name="levelOfExperience"
                  label="Level of experience *"
                  placeholder="Select level..."
                  error={errors.levelOfExperience}
                  required
                  options={levelOfExperienceOptions}
                />
              )}
            </motion.div>
          </AnimatePresence>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="mt-2 h-12 gap-3 px-5 text-base font-bold text-white"
          >
            {isSubmitting ? "Joining..." : "Join the waitlist"}
            <ArrowRight className="size-5" />
          </Button>
          <p className="text-center text-sm text-text-700">
            No spam. Unsubscribe anytime. Your data is safe.
          </p>
        </form>
      )}
    </>
  );
}
