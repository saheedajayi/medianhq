"use client";

import { toast } from "sonner";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/base/dialog";
import { ShieldCheck, Loader2 } from "lucide-react";
import { SessionPackage } from "../types";
import { useInitializePayment } from "@/services/payments/queries/payments.queries";

interface PaymentConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  mentorName: string;
  selectedPackage: SessionPackage;
  dateTimeDisplay: string;
  bookingId?: string;
  onPaySuccess: () => void;
}

export function PaymentConfirmationModal({
  isOpen,
  onClose,
  mentorName,
  selectedPackage,
  dateTimeDisplay,
  bookingId,
  onPaySuccess,
}: PaymentConfirmationModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const initializePaymentMutation = useInitializePayment();
  // Mentees pay exactly the listed price; Median's fee comes out of the mentor's side
  const formattedTotal = `₦${selectedPackage.numericPrice.toLocaleString()}`;

  const handlePay = async () => {
    if (!bookingId) {
      toast.error("Something went wrong", {
        description: "We couldn't find this booking. Please start again from the mentor's profile.",
      });
      return;
    }

    setIsProcessing(true);
    try {
      const res = await initializePaymentMutation.mutateAsync(bookingId);
      if (res?.authorizationUrl && res.authorizationUrl.startsWith("http")) {
        window.location.href = res.authorizationUrl;
        return;
      }
      // Nothing to pay (for example, a free session): the request went straight to the mentor
      onPaySuccess();
    } catch (err) {
      toast.error("Payment couldn't start", {
        description:
          (err as { message?: string })?.message ||
          "Please try again in a moment. You haven't been charged.",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md rounded-3xl bg-white p-6 sm:p-8">
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
                <span className="font-semibold text-[#101828]">{formattedTotal}</span>
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
            disabled={isProcessing}
            onClick={handlePay}
            className="flex items-center justify-center gap-2 w-full rounded-full bg-[#FF5500] py-3.5 text-sm font-semibold text-white transition-colors hover:bg-[#E04B00] active:scale-[0.99] disabled:opacity-60"
          >
            {isProcessing ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <span>Pay {formattedTotal}</span>
            )}
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
