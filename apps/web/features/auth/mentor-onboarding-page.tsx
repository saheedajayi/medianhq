"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { mentorsService } from "@/services/mentors";
import type { ApiError } from "@/services/api-client";

function getErrorMessage(error: unknown, fallback: string) {
  const apiError = error as Partial<ApiError>;
  return typeof apiError.message === "string" && apiError.message.trim()
    ? apiError.message
    : fallback;
}
import { Button } from "@/components/ui/base/button";
import { Input } from "@/components/ui/base/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/base/select";
import { CreatableCombobox } from "@/components/ui/custom/creatable-combobox";
import { useQuery, useMutation } from "@tanstack/react-query";
import { taxonomyService } from "@/services/taxonomy";

// Industries are now imported from constants
const experienceYears = [
  "1-3 years",
  "3-5 years",
  "5-10 years",
  "10+ years",
];

export function MentorOnboardingPage() {
  const router = useRouter();
  const [currentRole, setCurrentRole] = useState("");
  const [company, setCompany] = useState("");
  const [industry, setIndustry] = useState("");
  const [experience, setExperience] = useState("");
  const [location, setLocation] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: taxonomyData, refetch: refetchTaxonomy } = useQuery({
    queryKey: ["taxonomy"],
    queryFn: taxonomyService.getIndustries,
  });

  const createRoleMutation = useMutation({
    mutationFn: (roleName: string) => taxonomyService.createRole(industry, roleName),
    onSuccess: () => {
      refetchTaxonomy();
    }
  });

  const INDUSTRIES = taxonomyData ? Object.keys(taxonomyData) : [];
  const INDUSTRY_ROLES = taxonomyData || {};

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);

    mentorsService
      .apply({
        currentRole,
        company,
        industry,
        experience,
        location,
      })
      .then(() => {
        router.push("/mentor-submitted");
      })
      .catch((error) => {
        toast.error("Unable to submit application", {
          description: getErrorMessage(error, "Please check your details."),
        });
      })
      .finally(() => setIsSubmitting(false));
  }

  return (
    <>
      <header className="mb-10 text-center">
        <h1 className="text-2xl font-bold tracking-[-0.02em] text-[#4b100d]">
          Apply to mentor
        </h1>
        <p className="mt-2 text-base text-[#344054]">
          Tell us your professional background.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="grid gap-6">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-[#111827]">
            Industry
          </label>
          <CreatableCombobox
            options={INDUSTRIES}
            value={industry}
            onValueChange={(val) => {
              setIndustry(val);
              setCurrentRole(""); // Reset role when industry changes
            }}
            placeholder="Select an industry..."
            emptyText="No industry found."
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-[#111827]">
            Current role
          </label>
          <CreatableCombobox
            options={industry && INDUSTRY_ROLES[industry] ? INDUSTRY_ROLES[industry] : []}
            value={currentRole}
            onValueChange={setCurrentRole}
            onCreate={(val) => {
              setCurrentRole(val);
              createRoleMutation.mutate(val);
            }}
            placeholder="Select a role..."
            emptyText={industry ? "No role found." : "Please select an industry first."}
            disabled={!industry}
            disabledMessage="Select an industry first"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-[#111827]">
            Company
          </label>
          <Input
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            placeholder="e.g. Google"
            className="h-[46px] rounded-xl text-[15px] px-3.5 border-[#e2e8f0] bg-transparent shadow-none placeholder:text-[#94a3b8]"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-[#111827]">
            Years of experience
          </label>
          <Select value={experience} onValueChange={setExperience}>
            <SelectTrigger className="h-[46px] rounded-xl text-[15px] px-3.5 border-[#e2e8f0] bg-transparent shadow-none data-[placeholder]:text-[#94a3b8]">
              <SelectValue placeholder="e.g 5" />
            </SelectTrigger>
            <SelectContent>
              {experienceYears.map((exp) => (
                <SelectItem key={exp} value={exp}>
                  {exp}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-[#111827]">
            Where are you based? *
          </label>
          <Input
            required
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Enter your location"
            className="h-[46px] rounded-xl text-[15px] px-3.5 border-[#e2e8f0] bg-transparent shadow-none placeholder:text-[#94a3b8]"
          />
        </div>

        <div className="mt-2">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="h-12 w-full rounded-full bg-primary text-base font-medium text-white hover:bg-primary/90 shadow-none"
          >
            Continue
          </Button>
        </div>
      </form>
    </>
  );
}
