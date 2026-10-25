"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/base/dialog";
import { Spinner } from "@/components/ui/custom/spinner";
import { SessionPackage } from "../types";

interface ConfirmSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  mentorName: string;
  packages?: SessionPackage[];
  selectedPackage: SessionPackage;
  dateTimeDisplay: string;
  isLoading?: boolean;
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
  selectedPackage,
  dateTimeDisplay,
  isLoading = false,
  onConfirm,
}: ConfirmSessionModalProps) {
  const [goals, setGoals] = useState("");

  const isFree = selectedPackage.numericPrice === 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    onConfirm({
      scope: selectedPackage.title,
      goals,
      isFree,
      packageToUse: selectedPackage,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !isLoading && onClose()}>
      <DialogContent className="max-w-md rounded-3xl bg-white p-6 sm:p-8">
        <DialogHeader className="text-center sm:text-center">
          <DialogTitle className="text-xl font-bold text-[#101828]">
            Confirm your session
          </DialogTitle>
          <p className="mt-1 text-xs text-[#667085]">
            {dateTimeDisplay}
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-4">
          {/* Details & Goals Textarea */}
          <div className="flex flex-col gap-1.5 text-left">
            <label className="text-xs font-medium text-[#344054]">
              Share a brief detail about you and your goals for this session
            </label>
            <textarea
              rows={4}
              value={goals}
              disabled={isLoading}
              onChange={(e) => setGoals(e.target.value)}
              placeholder="Write your message here..."
              className="w-full resize-none rounded-2xl border border-[#EAECF0] bg-white p-3.5 text-xs text-[#101828] placeholder-[#98A2B3] outline-hidden focus:border-[#FF5500] focus:ring-2 focus:ring-[#FF5500]/20 disabled:cursor-not-allowed disabled:bg-[#F9FAFB] disabled:opacity-75"
            />
          </div>

          {/* CTA Submit Button with Loading State */}
          <button
            type="submit"
            disabled={isLoading}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-full bg-[#FF5500] py-3.5 text-sm font-semibold text-white transition-all hover:bg-[#E04B00] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-75"
          >
            {isLoading ? (
              <>
                <Spinner size="sm" className="text-white" />
                <span>{isFree ? "Confirming booking..." : "Proceeding to payment..."}</span>
              </>
            ) : (
              <span>{isFree ? "Confirm booking" : "Proceed to payment"}</span>
            )}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
