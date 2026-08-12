"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useState, useRef } from "react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { menteesService } from "@/services/mentees";
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

const goals = [
  "Career switch",
  "Leadership",
  "Portfolio review",
  "Interview prep",
  "Job search",
  "Skills growth",
  "Fundraising",
  "Others",
];

const timeframes = [
  "1-3 months",
  "3-6 months",
  "6+ months",
];

export function MenteeOnboardingPage() {
  const router = useRouter();
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [otherGoalText, setOtherGoalText] = useState("");
  const [isEditingOther, setIsEditingOther] = useState(false);
  const [goalDescription, setGoalDescription] = useState("");
  const [currentRole, setCurrentRole] = useState("");
  const [industry, setIndustry] = useState("");
  const [timeframe, setTimeframe] = useState("");
  const otherInputRef = useRef<HTMLInputElement | null>(null);

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

  const INDUSTRIES = ALLOWED_INDUSTRIES;
  const INDUSTRY_ROLES: Record<string, string[]> = {
    ...DEFAULT_INDUSTRY_ROLES,
    ...(taxonomyData || {}),
  };

  function toggleGoal(goal: string) {
    setSelectedGoals((prev) =>
      prev.includes(goal) ? prev.filter((g) => g !== goal) : [...prev, goal]
    );
  }

  function handleOthersClick() {
    const isSelected = selectedGoals.includes("Others");
    if (!isSelected) {
      setSelectedGoals((prev) => [...prev, "Others"]);
      setIsEditingOther(true);
      setTimeout(() => otherInputRef.current?.focus(), 60);
    } else {
      if (!isEditingOther) {
        setIsEditingOther(true);
        setTimeout(() => otherInputRef.current?.focus(), 60);
      } else {
        setSelectedGoals((prev) => prev.filter((g) => g !== "Others"));
        setOtherGoalText("");
        setIsEditingOther(false);
      }
    }
  }

  function handleOtherInputBlur() {
    if (!otherGoalText.trim()) {
      setSelectedGoals((prev) => prev.filter((g) => g !== "Others"));
      setOtherGoalText("");
      setIsEditingOther(false);
    } else {
      setIsEditingOther(false);
    }
  }

  function handleOtherInputKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      handleOtherInputBlur();
    }
  }

  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);

    const finalGoals = selectedGoals.map((g) => {
      if (g === "Others" && otherGoalText.trim()) {
        return otherGoalText.trim();
      }
      return g;
    });

    menteesService
      .createProfile({
        goals: finalGoals,
        goalDescription,
        currentRole,
        industry,
        timeframe,
      })
      .then(() => {
        toast.success("Welcome to Median!", {
          description: "Your mentee profile preferences have been saved.",
        });
        router.push("/mentor-matches");
      })
      .catch((error) => {
        toast.error("Unable to save profile", {
          description: getErrorMessage(error, "Please check your details."),
        });
      })
      .finally(() => setIsSubmitting(false));
  }

  return (
    <>
      <header className="mb-10 text-center">
        <h1 className="text-[28px] font-semibold tracking-[-0.02em] text-[#4b100d]">
          What do you want to achieve?
        </h1>
        <p className="mt-2 text-[15px] text-[#344054]">
          Select all that apply.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="flex flex-wrap items-center gap-2.5">
          {goals.map((goal) => {
            if (goal === "Others") {
              const isOthersSelected = selectedGoals.includes("Others");
              const hasCustomText = otherGoalText.trim().length > 0;

              return (
                <div key="Others" className="inline-flex items-center gap-2.5">
                  <AnimatePresence mode="wait">
                    {isOthersSelected && isEditingOther ? (
                      <motion.div
                        key="other-input-container"
                        initial={{ width: 0, opacity: 0 }}
                        animate={{ width: "auto", opacity: 1 }}
                        exit={{ width: 0, opacity: 0 }}
                        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                        className="overflow-hidden"
                      >
                        <input
                          ref={otherInputRef}
                          type="text"
                          value={otherGoalText}
                          onChange={(e) => setOtherGoalText(e.target.value)}
                          onBlur={handleOtherInputBlur}
                          onKeyDown={handleOtherInputKeyDown}
                          placeholder="Specify other goal..."
                          style={{
                            width: `${Math.max(150, Math.min(260, otherGoalText.length * 9 + 48))}px`,
                          }}
                          className="h-[37px] rounded-full border border-[#4b100d] bg-white px-4 text-[14px] text-[#141c2e] outline-none placeholder:text-[#94a3b8] focus:ring-2 focus:ring-[#4b100d]/20"
                        />
                      </motion.div>
                    ) : isOthersSelected && hasCustomText ? (
                      <motion.button
                        key="other-text-pill"
                        type="button"
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                        onClick={() => {
                          setIsEditingOther(true);
                          setTimeout(() => otherInputRef.current?.focus(), 60);
                        }}
                        className="rounded-full border border-[#4b100d] bg-[#4b100d] px-4 py-1.5 text-[15px] text-white hover:bg-[#4b100d]/90 transition-colors"
                      >
                        {otherGoalText.trim()}
                      </motion.button>
                    ) : null}
                  </AnimatePresence>

                  <button
                    type="button"
                    onClick={handleOthersClick}
                    className={`rounded-full border px-4 py-1.5 text-[15px] transition-colors ${
                      isOthersSelected
                        ? "border-[#4b100d] bg-[#4b100d] text-white"
                        : "border-[#e2e8f0] bg-white text-[#344054] hover:border-[#ff8e62]"
                    }`}
                  >
                    Others
                  </button>
                </div>
              );
            }

            const isSelected = selectedGoals.includes(goal);
            return (
              <button
                key={goal}
                type="button"
                onClick={() => toggleGoal(goal)}
                className={`rounded-full border px-4 py-1.5 text-[15px] transition-colors ${
                  isSelected
                    ? "border-[#4b100d] bg-[#4b100d] text-white"
                    : "border-[#e2e8f0] bg-white text-[#344054] hover:border-[#ff8e62]"
                }`}
              >
                {goal}
              </button>
            );
          })}
        </div>

        <div className="flex flex-col gap-2 mt-2">
          <label className="text-sm font-medium text-[#111827]">
            Describe your goal in one sentence
          </label>
          <Input
            value={goalDescription}
            onChange={(e) => setGoalDescription(e.target.value)}
            placeholder="e.g Create a new portfolio as a step to landing a new role"
            className="h-[46px] rounded-xl text-[15px] px-3.5 border-[#e2e8f0] bg-transparent shadow-none placeholder:text-[#94a3b8]"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
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
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-[#111827]">
            How soon do you need to achieve your goal?
          </label>
          <Select value={timeframe} onValueChange={setTimeframe}>
            <SelectTrigger className="h-[46px] rounded-xl text-[15px] px-3.5 border-[#e2e8f0] bg-transparent shadow-none data-[placeholder]:text-[#94a3b8]">
              <SelectValue placeholder="Select one..." />
            </SelectTrigger>
            <SelectContent>
              {timeframes.map((tf) => (
                <SelectItem key={tf} value={tf}>
                  {tf}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="mt-6 h-[48px] w-full rounded-full bg-primary text-[15px] font-medium text-white hover:bg-primary/90"
        >
          {isSubmitting ? "Saving..." : "Continue"}
        </Button>
      </form>
    </>
  );
}
