"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/base/select";
import { CONTACT_SUBJECTS } from "@/services/contact";
import { useSendContactMessage } from "@/services/contact/queries/contact.queries";
import { cn } from "@/lib/utils";
import { contactInputClass, contactSchema, type ContactFieldErrors } from "./contact-utils";

interface FieldProps {
  id: string;
  label: string;
  error?: string;
  children: ReactNode;
}

function Field({ id, label, error, children }: FieldProps) {
  return (
    <div className="grid min-w-0 gap-1.5">
      <label htmlFor={id} className="text-xs font-medium text-[#101828]">
        {label}
      </label>
      {children}
      {error && (
        <p id={`${id}-error`} className="text-xs font-medium text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}

export function ContactForm() {
  const [errors, setErrors] = useState<ContactFieldErrors>({});
  const [subject, setSubject] = useState("");
  const sendMutation = useSendContactMessage();

  const fieldProps = (name: keyof ContactFieldErrors) => ({
    id: `contact-${name}`,
    name,
    "aria-invalid": Boolean(errors[name]),
    "aria-describedby": errors[name] ? `contact-${name}-error` : undefined,
  });

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const result = contactSchema.safeParse({
      firstName: String(formData.get("firstName") ?? ""),
      lastName: String(formData.get("lastName") ?? ""),
      email: String(formData.get("email") ?? ""),
      subject,
      message: String(formData.get("message") ?? ""),
    });

    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      setErrors({
        firstName: fieldErrors.firstName?.[0],
        lastName: fieldErrors.lastName?.[0],
        email: fieldErrors.email?.[0],
        subject: fieldErrors.subject?.[0],
        message: fieldErrors.message?.[0],
      });
      return;
    }

    setErrors({});
    sendMutation.mutate(result.data, {
      onSuccess: (response) => {
        form.reset();
        setSubject("");
        toast.success("Message sent", { description: response.message });
      },
      onError: (error) => {
        toast.error("We couldn't send your message", { description: error.message });
      },
    });
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="contact-firstName" label="First name" error={errors.firstName}>
          <input {...fieldProps("firstName")} autoComplete="given-name" placeholder="Amara" className={contactInputClass} />
        </Field>
        <Field id="contact-lastName" label="Last name" error={errors.lastName}>
          <input {...fieldProps("lastName")} autoComplete="family-name" placeholder="Okafor" className={contactInputClass} />
        </Field>
      </div>

      <Field id="contact-email" label="Email address" error={errors.email}>
        <input
          {...fieldProps("email")}
          type="email"
          autoComplete="email"
          placeholder="name@gmail.com"
          className={contactInputClass}
        />
      </Field>

      <Field id="contact-subject" label="Subject" error={errors.subject}>
        <Select value={subject} onValueChange={setSubject}>
          <SelectTrigger
            id="contact-subject"
            aria-invalid={Boolean(errors.subject)}
            aria-describedby={errors.subject ? "contact-subject-error" : undefined}
            className={cn(contactInputClass, "data-[placeholder]:text-[#98A2B3]")}
          >
            <SelectValue placeholder="Purpose" />
          </SelectTrigger>
          <SelectContent>
            {CONTACT_SUBJECTS.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>

      <Field id="contact-message" label="Message" error={errors.message}>
        <textarea
          {...fieldProps("message")}
          rows={3}
          placeholder="Write your message here"
          className={cn(contactInputClass, "h-auto min-h-[84px] resize-y py-2.5")}
        />
      </Field>

      <button
        type="submit"
        disabled={sendMutation.isPending}
        className="mt-4 inline-flex h-11 w-full items-center justify-center rounded-full bg-[#FF5514] text-sm font-semibold text-white transition-colors hover:bg-[#E84D12] disabled:opacity-60"
      >
        {sendMutation.isPending ? "Sending..." : "Submit"}
      </button>
    </form>
  );
}
