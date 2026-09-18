"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/base/dialog";
import { ArrowDown2 } from "iconsax-react";
import { SessionPackage } from "../types";

interface ConfirmSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  mentorName: string;
  selectedPackage: SessionPackage;
  dateTimeDisplay: string;
  onConfirm: (data: { scope: string; goals: string }) => void;
}

const scopes = [
  "Career growth & promotions",
  "CV & Portfolio critique",
  "Fintech strategy & system design",
  "Leadership & management coaching",
  "General intro & mentorship",
];

export function ConfirmSessionModal({
  isOpen,
  onClose,
  selectedPackage,
  dateTimeDisplay,
  onConfirm,
}: ConfirmSessionModalProps) {
  const [scope, setScope] = useState(scopes[0] || "Career growth & promotions");
  const [goals, setGoals] = useState("");

  const isFree = selectedPackage.numericPrice === 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm({ scope, goals });
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
            <div className="relative">
              <select
                value={scope}
                onChange={(e) => setScope(e.target.value)}
                className="h-11 w-full appearance-none rounded-xl border border-[#EAECF0] bg-white px-3.5 pr-9 text-xs text-[#101828] outline-hidden focus:border-[#FF5500] focus:ring-2 focus:ring-[#FF5500]/20"
              >
                {scopes.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <ArrowDown2
                size="14"
                variant="Linear"
                color="#667085"
                className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2"
              />
            </div>
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

          {/* CTA Submit Button */}
          <button
            type="submit"
            className="mt-2 w-full rounded-full bg-[#FF5500] py-3.5 text-sm font-semibold text-white shadow-xs transition-colors hover:bg-[#E04B00] active:scale-[0.99]"
          >
            {isFree ? "Confirm booking" : "Proceed to payment"}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
