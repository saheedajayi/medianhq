"use client";

import { useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { FileText, X, Loader2 } from "lucide-react";
import { mentorsService } from "@/services/mentors";
import { uploadsService } from "@/services/uploads";
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

import { INDUSTRY_ROLES as DEFAULT_INDUSTRY_ROLES } from "@/constants/industries";

const ALLOWED_INDUSTRIES = ["Finance", "Technology", "Business", "Consulting"];

const experienceYears = [
  "1-3 years",
  "3-5 years",
  "5-10 years",
  "10+ years",
];

export function MentorOnboardingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const stepParam = searchParams.get("step");
  const currentSubStep = stepParam === "2" ? 2 : 1;

  const [currentRole, setCurrentRole] = useState("");
  const [company, setCompany] = useState("");
  const [industry, setIndustry] = useState("");
  const [experience, setExperience] = useState("");
  const [location, setLocation] = useState("");
  const [bio, setBio] = useState("");
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [cvFileName, setCvFileName] = useState("");
  const [cvUrl, setCvUrl] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: taxonomyData, refetch: refetchTaxonomy } = useQuery({
    queryKey: ["taxonomy"],
    queryFn: taxonomyService.getIndustries,
  });

  const createRoleMutation = useMutation({
    mutationFn: (roleName: string) =>
      taxonomyService.createRole(industry, roleName),
    onSuccess: () => {
      refetchTaxonomy();
    },
  });

  const INDUSTRIES = ALLOWED_INDUSTRIES;
  const INDUSTRY_ROLES: Record<string, string[]> = {
    ...DEFAULT_INDUSTRY_ROLES,
    ...(taxonomyData || {}),
  };

  function handleFileSelect(file: File) {
    try {
      uploadsService.validateCv(file);
    } catch (err: any) {
      toast.error("Invalid file", {
        description: err.message || "Please upload a valid CV document.",
      });
      return;
    }

    setCvFile(file);
    setCvFileName(file.name);
  }

  function handleSubStep1Submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!industry || !currentRole || !location) {
      toast.error("Missing information", {
        description: "Please complete all required fields.",
      });
      return;
    }
    router.push("/mentor-onboarding?step=2");
  }

  async function handleSubStep2Submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!bio.trim()) {
      toast.error("Missing information", {
        description: "Please share why you want to mentor.",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      let finalCvUrl = cvUrl;

      if (cvFile) {
        toast.info("Uploading CV...", {
          description: "Please wait while your document is being uploaded.",
        });
        const uploadRes: any = await uploadsService.uploadCv(cvFile);
        finalCvUrl =
          uploadRes?.url || uploadRes?.data?.url || uploadRes?.publicId || "";
        setCvUrl(finalCvUrl);
      }

      await mentorsService.apply({
        currentRole,
        company,
        industry,
        experience,
        location,
        bio,
        cvUrl: finalCvUrl || undefined,
      });

      toast.success("Welcome to Median!", {
        description: "Your application has been submitted.",
      });
      router.push("/mentor-submitted");
    } catch (error) {
      toast.error("Unable to submit application", {
        description: getErrorMessage(error, "Please check your details."),
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <header className="mb-8 text-center">
        <h1 className="text-2xl font-bold tracking-[-0.02em] text-[#4b100d]">
          Apply to mentor
        </h1>
        <p className="mt-2 text-base text-[#344054]">
          {currentSubStep === 1
            ? "Tell us your professional background."
            : "What drives you to mentor on Median"}
        </p>

        <div className="mt-3.5 flex items-center justify-center gap-2">
          <span
            className={`h-1.5 rounded-full transition-all duration-300 ${
              currentSubStep === 1 ? "w-6 bg-primary" : "w-1.5 bg-[#FFDCD2]"
            }`}
          />
          <span
            className={`h-1.5 rounded-full transition-all duration-300 ${
              currentSubStep === 2 ? "w-6 bg-primary" : "w-1.5 bg-[#FFDCD2]"
            }`}
          />
        </div>
      </header>

      {currentSubStep === 1 ? (
        <form onSubmit={handleSubStep1Submit} className="grid gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-[#111827]">
              Industry
            </label>
            <CreatableCombobox
              options={INDUSTRIES}
              value={industry}
              onValueChange={(val) => {
                setIndustry(val);
                setCurrentRole("");
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
              options={
                industry && INDUSTRY_ROLES[industry]
                  ? INDUSTRY_ROLES[industry]
                  : []
              }
              value={currentRole}
              onValueChange={setCurrentRole}
              onCreate={(val) => {
                setCurrentRole(val);
                createRoleMutation.mutate(val);
              }}
              placeholder="Select a role..."
              emptyText={
                industry
                  ? "No role found."
                  : "Please select an industry first."
              }
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
              className="h-[46px] rounded-xl border-[#e2e8f0] bg-transparent px-3.5 text-[15px] shadow-none placeholder:text-[#94a3b8]"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-[#111827]">
              Years of experience
            </label>
            <Select value={experience} onValueChange={setExperience}>
              <SelectTrigger className="h-[46px] rounded-xl border-[#e2e8f0] bg-transparent px-3.5 text-[15px] shadow-none data-[placeholder]:text-[#94a3b8]">
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
              className="h-[46px] rounded-xl border-[#e2e8f0] bg-transparent px-3.5 text-[15px] shadow-none placeholder:text-[#94a3b8]"
            />
          </div>

          <div className="mt-2">
            <Button
              type="submit"
              className="h-12 w-full rounded-full bg-primary text-base font-medium text-white shadow-none hover:bg-primary/90"
            >
              Continue
            </Button>
          </div>
        </form>
      ) : (
        <form onSubmit={handleSubStep2Submit} className="grid w-full max-w-full min-w-0 gap-6 overflow-hidden">
          <div className="flex w-full max-w-full min-w-0 flex-col gap-2 overflow-hidden">
            <label className="text-sm font-medium text-[#111827]">
              Upload CV*
            </label>
            <div
              onDragOver={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsDragging(true);
              }}
              onDragLeave={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsDragging(false);
              }}
              onDrop={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsDragging(false);
                const file = e.dataTransfer.files?.[0];
                if (file) handleFileSelect(file);
              }}
              className={`relative flex min-h-[110px] w-full max-w-full min-w-0 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed px-3 py-4 sm:p-6 text-center transition-all overflow-hidden ${
                isDragging
                  ? "border-primary bg-[#FFF5F2] ring-2 ring-primary/20"
                  : cvFileName
                    ? "border-primary/50 bg-[#FFF5F2]/40"
                    : "border-[#cbd5e1] bg-slate-50/50 hover:border-primary"
              }`}
            >
              <input
                type="file"
                accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                className="sr-only"
                id="cv-file-input"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileSelect(file);
                }}
              />

              {cvFileName ? (
                <div className="flex w-full max-w-full min-w-0 items-center justify-between gap-2 text-sm font-medium text-primary overflow-hidden">
                  <div className="flex items-center gap-2 min-w-0 flex-1 overflow-hidden">
                    <FileText className="size-4 shrink-0 text-primary" />
                    <span className="truncate text-primary min-w-0 flex-1 text-left block">
                      {cvFileName}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setCvFile(null);
                      setCvFileName("");
                      setCvUrl("");
                    }}
                    className="ml-1 shrink-0 rounded-full p-1 text-primary hover:bg-primary/10 transition-colors"
                  >
                    <X className="size-4" />
                  </button>
                </div>
              ) : (
                <label htmlFor="cv-file-input" className="cursor-pointer max-w-full overflow-hidden">
                  <p className="text-sm font-medium text-[#344054]">
                    <span className="font-semibold text-primary">
                      Click to upload
                    </span>{" "}
                    or drag and drop
                  </p>
                  <p className="mt-1 text-xs text-[#94a3b8]">
                    PDF, DOC, or DOCX (max. 10MB)
                  </p>
                </label>
              )}
            </div>
          </div>

          <div className="flex w-full max-w-full min-w-0 flex-col gap-2 overflow-hidden">
            <label className="text-sm font-medium text-[#111827]">
              Why do you want to mentor? *
            </label>
            <textarea
              required
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell us here..."
              rows={4}
              className="w-full max-w-full min-w-0 rounded-xl border border-[#e2e8f0] p-3.5 text-[15px] outline-none transition-colors focus:border-primary placeholder:text-[#94a3b8] resize-none"
            />
          </div>

          <div className="mt-2 w-full max-w-full min-w-0 overflow-hidden">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="h-12 w-full rounded-full bg-primary text-base font-medium text-white shadow-none hover:bg-primary/90"
            >
              {isSubmitting ? "Submitting..." : "Submit Application"}
            </Button>
          </div>
        </form>
      )}
    </>
  );
}
