"use client";

import { type FormEvent, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
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
      "2 free sessions/month",
      "AI-powered mentor matching",
      "Async Q&A threads",
      "Community Forums",
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
    location: z.preprocess(emptyStringToUndefined, z.string().trim().optional()),
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

const countryCodes =
  "AF AX AL DZ AS AD AO AI AQ AG AR AM AW AU AT AZ BS BH BD BB BY BE BZ BJ BM BT BO BQ BA BW BV BR IO BN BG BF BI CV KH CM CA KY CF TD CL CN CX CC CO KM CG CD CK CR CI HR CU CW CY CZ DK DJ DM DO EC EG SV GQ ER EE SZ ET FK FO FJ FI FR GF PF TF GA GM GE DE GH GI GR GL GD GP GU GT GG GN GW GY HT HM VA HN HK HU IS IN ID IR IQ IE IM IL IT JM JP JE JO KZ KE KI KP KR KW KG LA LV LB LS LR LY LI LT LU MO MG MW MY MV ML MT MH MQ MR MU YT MX FM MD MC MN ME MS MA MZ MM NA NR NP NL NC NZ NI NE NG NU NF MK MP NO OM PK PW PS PA PG PY PE PH PN PL PT PR QA RE RO RU RW BL SH KN LC MF PM VC WS SM ST SA SN RS SC SL SG SX SK SI SB SO ZA GS SS ES LK SD SR SJ SE CH SY TW TJ TZ TH TL TG TK TO TT TN TR TM TC TV UG UA AE GB US UM UY UZ VU VE VN VG VI WF EH YE ZM ZW".split(
    " ",
  );

const regionNames = new Intl.DisplayNames(["en"], { type: "region" });

const locationOptions = [
  ...countryCodes
    .map((region) => ({
      value: region.toLowerCase(),
      label: regionNames.of(region) ?? region,
    }))
    .sort((a, b) => a.label.localeCompare(b.label)),
  { value: "other", label: "Other" },
] satisfies Array<{ label: string; value: string }>;

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
  const message = useWaitlistStore((state) => state.message);
  const errors = useWaitlistStore((state) => state.errors);
  const setAudience = useWaitlistStore((state) => state.setAudience);
  const setSubmitState = useWaitlistStore((state) => state.setSubmitState);
  const setMessage = useWaitlistStore((state) => state.setMessage);
  const setErrors = useWaitlistStore((state) => state.setErrors);
  const resetFeedback = useWaitlistStore((state) => state.resetFeedback);
  const resetFormState = useWaitlistStore((state) => state.resetFormState);
  const waitlistMutation = useCreateWaitlistEntry();
  const createWaitlistEntry = waitlistMutation.mutate;
  const content = waitlistContent[audience];
  const isMentor = audience === "mentors";

  function handleAudienceChange(nextAudience: WaitlistAudienceTab) {
    setAudience(nextAudience);
    resetFormState();
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
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={`fields-${audience}`}
            className="grid gap-5"
            layout
            {...contentMotion}
          >
            <OptionalStringSelectField
              id="location"
              name="location"
              label="Location"
              placeholder="Select location..."
              error={errors.location}
              options={locationOptions}
            />
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
            <Field id="role" label="Current role *" error={errors.currentRole}>
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
                  aria-describedby={errors.company ? "company-error" : undefined}
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
