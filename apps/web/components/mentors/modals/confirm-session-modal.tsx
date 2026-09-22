"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/base/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/base/select";
import { SessionPackage } from "../types";

export interface ScopeOption {
  id: string;
  label: string;
  isFree: boolean;
  priceDisplay: string;
  packageMatcher: string;
}

export const conversationScopes: ScopeOption[] = [
  {
    id: "career-growth",
    label: "Career growth & promotions",
    isFree: false,
    priceDisplay: "₦15,000",
    packageMatcher: "career",
  },
  {
    id: "cv-portfolio",
    label: "CV & Portfolio critique",
    isFree: false,
    priceDisplay: "₦20,000",
    packageMatcher: "cv",
  },
  {
    id: "fintech-strategy",
    label: "Fintech strategy & system design",
    isFree: false,
    priceDisplay: "₦20,000",
    packageMatcher: "strategy",
  },
  {
    id: "leadership-coaching",
    label: "Leadership & management coaching",
    isFree: false,
    priceDisplay: "₦20,000",
    packageMatcher: "leadership",
  },
  {
    id: "general-intro",
    label: "General intro & mentorship",
    isFree: true,
    priceDisplay: "Free",
    packageMatcher: "know",
  },
];

interface ConfirmSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  mentorName: string;
  packages?: SessionPackage[];
  selectedPackage: SessionPackage;
  dateTimeDisplay: string;
  onConfirm: (data: {
    scope: string;
    goals: string;
    isFree: boolean;
    packageToUse?: SessionPackage;
  }) => void;
}

export function ConfirmSessionModal({
  isOpen,
  onClose,
  packages,
  selectedPackage,
  dateTimeDisplay,
  onConfirm,
}: ConfirmSessionModalProps) {
  const [scope, setScope] = useState<string>("Career growth & promotions");
  const [goals, setGoals] = useState("");

  // Sync initial scope with the package selected on the mentor profile page
  useEffect(() => {
    if (isOpen) {
      if (selectedPackage.numericPrice === 0) {
        setScope("General intro & mentorship");
      } else if (selectedPackage.title.toLowerCase().includes("cv")) {
        setScope("CV & Portfolio critique");
      } else if (selectedPackage.title.toLowerCase().includes("career")) {
        setScope("Career growth & promotions");
      } else {
        setScope("Career growth & promotions");
      }
    }
  }, [isOpen, selectedPackage]);

  // Determine free vs paid dynamically based on the currently selected conversation scope
  const selectedScopeObj =
    conversationScopes.find((s) => s.label === scope) || conversationScopes[0]!;
  const isFree = selectedScopeObj.isFree;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Map to matching package if available
    let packageToUse = selectedPackage;
    if (packages && packages.length > 0) {
      if (selectedScopeObj.isFree) {
        packageToUse =
          packages.find((p) => p.numericPrice === 0) || selectedPackage;
      } else {
        packageToUse =
          packages.find((p) =>
            p.title.toLowerCase().includes(selectedScopeObj.packageMatcher)
          ) ||
          packages.find((p) => p.numericPrice > 0) ||
          selectedPackage;
      }
    }

    onConfirm({
      scope,
      goals,
      isFree,
      packageToUse,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md rounded-3xl bg-white p-6 sm:p-8 shadow-2xl">
        <DialogHeader className="text-center sm:text-center">
          <DialogTitle className="text-xl font-bold text-[#101828]">
            Confirm your session
          </DialogTitle>
          <p className="mt-1 text-xs text-[#667085]">
            {dateTimeDisplay}
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-4">
          {/* Conversation Scope Dropdown */}
          <div className="flex flex-col gap-1.5 text-left">
            <label className="text-xs font-medium text-[#344054]">
              Conversation scope
            </label>
            <Select value={scope} onValueChange={setScope}>
              <SelectTrigger className="h-11 w-full rounded-xl border border-[#EAECF0] bg-white px-3.5 text-xs text-[#101828] shadow-none outline-hidden focus:border-[#FF5500] focus:ring-2 focus:ring-[#FF5500]/20">
                <SelectValue placeholder="Select conversation scope" />
              </SelectTrigger>
              <SelectContent className="z-[60] rounded-xl border border-[#EAECF0] bg-white p-1 shadow-lg">
                {conversationScopes.map((s) => (
                  <SelectItem
                    key={s.id}
                    value={s.label}
                    className="cursor-pointer rounded-lg py-2.5 px-3 text-xs text-[#101828] focus:bg-[#FFF0EB] focus:text-[#FF5500]"
                  >
                    <div className="flex w-full items-center justify-between gap-4">
                      <span>{s.label}</span>
                      <span
                        className={`text-[11px] font-semibold ${
                          s.isFree ? "text-[#FF5500]" : "text-[#667085]"
                        }`}
                      >
                        {s.isFree ? "Free" : s.priceDisplay}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Details & Goals Textarea */}
          <div className="flex flex-col gap-1.5 text-left">
            <label className="text-xs font-medium text-[#344054]">
              Share a brief detail about you and your goals for this session
            </label>
            <textarea
              rows={4}
              value={goals}
              onChange={(e) => setGoals(e.target.value)}
              placeholder="Write your message here..."
              className="w-full resize-none rounded-2xl border border-[#EAECF0] bg-white p-3.5 text-xs text-[#101828] placeholder-[#98A2B3] outline-hidden focus:border-[#FF5500] focus:ring-2 focus:ring-[#FF5500]/20"
            />
          </div>

          {/* CTA Submit Button (Dynamically changes with conversation scope) */}
          <button
            type="submit"
            className="mt-2 w-full rounded-full bg-[#FF5500] py-3.5 text-sm font-semibold text-white shadow-xs transition-all hover:bg-[#E04B00] active:scale-[0.99]"
          >
            {isFree ? "Confirm booking" : "Proceed to payment"}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
