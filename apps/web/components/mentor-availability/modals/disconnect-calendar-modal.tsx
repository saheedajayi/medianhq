"use client";

import { X } from "lucide-react";

interface DisconnectCalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmDisconnect: () => void;
}

export function DisconnectCalendarModal({
  isOpen,
  onClose,
  onConfirmDisconnect,
}: DisconnectCalendarModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-[2px] animate-in fade-in duration-200">
      <div className="relative w-full max-w-[500px] rounded-[24px] bg-white p-7 sm:p-9 shadow-2xl animate-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-6 top-6 text-[#98A2B3] hover:text-[#101828] transition-colors p-1"
          aria-label="Close modal"
        >
          <X size={20} />
        </button>

        <div className="text-center pt-2">
          <h2 className="text-2xl font-bold text-[#101828]">
            Disconnect Google Calendar
          </h2>
          <p className="mt-3 text-sm text-[#475467] leading-relaxed">
            Your availability will no longer sync with your Google Calendar. Existing bookings won&apos;t be affected, but future conflicts won&apos;t be detected automatically.
          </p>

          <div className="mt-8 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-[#D0D5DD] bg-white px-6 py-2.5 text-sm font-medium text-[#344054] hover:bg-gray-50 transition-colors"
            >
              Keep connected
            </button>
            <button
              type="button"
              onClick={() => {
                onConfirmDisconnect();
                onClose();
              }}
              className="rounded-full bg-[#FF5514] px-7 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-[#E04B12] transition-colors"
            >
              Disconnect
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
