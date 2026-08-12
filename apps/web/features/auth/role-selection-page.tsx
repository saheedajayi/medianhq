"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { toast } from "sonner";
import { usersService } from "@/services/users";
import type { ApiError } from "@/services/api-client";

function getErrorMessage(error: unknown, fallback: string) {
  const apiError = error as Partial<ApiError>;
  return typeof apiError.message === "string" && apiError.message.trim()
    ? apiError.message
    : fallback;
}

import { Button } from "@/components/ui/base/button";
import { useOnboarding, type OnboardingRole } from "./onboarding-context";

type Role = OnboardingRole;

const roles = [
  {
    value: "MENTEE" as Role,
    title: "Find a Mentor",
    description:
      "Get 1:1 guidance, career advice, and expert feedback from vetted professionals.",
    image: "/auth/mentor-design.svg",
    imageAlt: "Orange geometric pattern",
  },
  {
    value: "MENTOR" as Role,
    title: "Share my Expertise",
    description:
      "Give career advice and guidance to the next generation of experts.",
    image: "/auth/mentee-design.svg",
    imageAlt: "Dark red geometric pattern",
  },
] satisfies ReadonlyArray<{
  value: Role;
  title: string;
  description: string;
  image: string;
  imageAlt: string;
}>;

export function RoleSelectionPage() {
  const router = useRouter();
  const { role, setRole } = useOnboarding();

  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);

    usersService
      .updateRole({ role })
      .then(() => {
        router.push(role === "MENTEE" ? "/mentee-onboarding" : "/mentor-onboarding");
      })
      .catch((error) => {
        toast.error("Unable to update role", {
          description: getErrorMessage(error, "Please try again later."),
        });
      })
      .finally(() => setIsSubmitting(false));
  }

  return (
    <>
      <header className="mb-10 text-center">
        <h1 className="text-2xl font-semibold tracking-[-0.02em] text-[#4b100d]">
          I am here to...
        </h1>
        <p className="mt-2 text-base text-[#344054]">
          Let&apos;s personalise your experience.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="sm:-mx-3">
        <fieldset className="grid gap-4">
          <legend className="sr-only">Choose how you want to use Median</legend>

          {roles.map((option) => {
            const isSelected = role === option.value;

            return (
              <label
                key={option.value}
                className={`relative grid min-h-[180px] cursor-pointer grid-cols-[1fr_90px] overflow-hidden rounded-xl border transition-colors ${
                  isSelected
                    ? "border-[#ff8e62] bg-[#FDF9F6]"
                    : "border-[#cbd5e1] bg-white hover:border-[#ff8e62]"
                }`}
              >
                <input
                  type="radio"
                  name="role"
                  value={option.value}
                  checked={isSelected}
                  onChange={() => setRole(option.value)}
                  className="sr-only"
                />

                <span className="flex flex-col justify-center px-6 py-5">
                  <span
                    aria-hidden="true"
                    className={`mb-5 grid size-5 place-items-center rounded-full border-2 ${
                      isSelected
                        ? "border-primary"
                        : "border-[#141c2e]"
                    }`}
                  >
                    {isSelected && (
                      <span className="size-2.5 rounded-full bg-primary" />
                    )}
                  </span>

                  <span className="text-base font-semibold text-[#141c2e]">
                    {option.title}
                  </span>
                  <span className="mt-2 max-w-[220px] text-sm leading-5 text-[#667085] sm:max-w-[250px]">
                    {option.description}
                  </span>
                </span>

                <Image
                  src={option.image}
                  alt={option.imageAlt}
                  width={90}
                  height={180}
                  className="h-full w-[90px] object-cover"
                />
              </label>
            );
          })}
        </fieldset>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="mt-8 h-12 w-full rounded-full bg-primary text-base font-medium text-white hover:bg-primary/90"
        >
          {isSubmitting ? "Saving..." : "Continue"}
        </Button>
      </form>
    </>
  );
}
