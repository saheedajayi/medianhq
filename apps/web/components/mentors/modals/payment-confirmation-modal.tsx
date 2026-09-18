"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/base/dialog";
import { ShieldCheck } from "lucide-react";
import { SessionPackage } from "../types";

interface PaymentConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  mentorName: string;
  selectedPackage: SessionPackage;
  dateTimeDisplay: string;
  onPaySuccess: () => void;
}

export function PaymentConfirmationModal({
  isOpen,
  onClose,
  mentorName,
  selectedPackage,
  dateTimeDisplay,
  onPaySuccess,
}: PaymentConfirmationModalProps) {
  const sessionPrice = selectedPackage.numericPrice;
  const serviceCharge = Math.round(sessionPrice * 0.1);
  const totalAmount = sessionPrice + serviceCharge;

  const formattedSessionPrice = `₦${sessionPrice.toLocaleString()}`;
  const formattedServiceCharge = `₦${serviceCharge.toLocaleString()}`;
  const formattedTotal = `₦${totalAmount.toLocaleString()}`;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md rounded-3xl bg-white p-6 sm:p-8 shadow-2xl">
        <DialogHeader className="text-center sm:text-center">
          <DialogTitle className="text-xl font-bold text-[#101828]">
            Booking Confirmation
          </DialogTitle>
          <p className="mt-1 text-xs text-[#667085]">
            Review your session and complete payment.
          </p>
        </DialogHeader>

        <div className="mt-4 flex flex-col gap-5">
          {/* Session Overview Box */}
          <div className="rounded-2xl bg-[#F7F8FB] p-4 text-left">
            <span className="text-xs font-bold text-[#FF5500]">
              {selectedPackage.title} with {mentorName}
            </span>
            <p className="mt-1 text-xs text-[#667085]">
              {dateTimeDisplay}
            </p>
          </div>

          {/* Price Breakdown Card */}
          <div className="rounded-2xl border border-[#EAECF0] p-4 text-left">
            <span className="text-xs font-bold uppercase tracking-wider text-[#344054]">
              Price breakdown
            </span>

            <div className="mt-3 flex flex-col gap-2 divide-y divide-[#F2F4F7] text-xs">
              <div className="flex items-center justify-between pb-1.5 text-[#475467]">
                <span>Session price</span>
                <span className="font-semibold text-[#101828]">
                  {formattedSessionPrice}
                </span>
              </div>

              <div className="flex items-center justify-between py-1.5 text-[#475467]">
                <span>Service charge</span>
                <span className="font-semibold text-[#101828]">
                  {formattedServiceCharge}
                </span>
              </div>

              <div className="flex items-center justify-between pt-2 text-sm font-bold text-[#101828]">
                <span>Total</span>
                <span className="text-[#FF5500]">{formattedTotal}</span>
              </div>
            </div>
          </div>

          {/* Pay Button */}
          <button
            type="button"
            onClick={onPaySuccess}
            className="w-full rounded-full bg-[#FF5500] py-3.5 text-sm font-semibold text-white shadow-xs transition-colors hover:bg-[#E04B00] active:scale-[0.99]"
          >
            Pay {formattedTotal}
          </button>

          {/* Paystack Trust Badge */}
          <div className="flex items-center justify-center gap-1.5 text-[11px] text-[#667085]">
            <ShieldCheck className="size-3.5 text-[#12B76A]" />
            <span>Powered by Paystack</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
