"use client";

import { X, Lock } from "lucide-react";

interface CalendarSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  isGoogleConnected: boolean;
  googleEmail?: string;
  isOutlookConnected: boolean;
  onConnectGoogle: () => void;
  onDisconnectGoogle: () => void;
  onConnectOutlook: () => void;
  onDisconnectOutlook: () => void;
}

export function CalendarSyncModal({
  isOpen,
  onClose,
  isGoogleConnected,
  googleEmail = "abdullah@gmail.com",
  isOutlookConnected,
  onConnectGoogle,
  onDisconnectGoogle,
  onConnectOutlook,
}: CalendarSyncModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-[2px] animate-in fade-in duration-200">
      <div className="relative w-full max-w-[620px] rounded-[24px] bg-white p-7 sm:p-9 shadow-2xl animate-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-6 top-6 text-[#98A2B3] hover:text-[#101828] transition-colors p-1"
          aria-label="Close modal"
        >
          <X size={20} />
        </button>

        {/* Title & Description */}
        <div className="text-center sm:text-left">
          <h2 className="text-2xl font-bold text-[#101828]">Calendar Sync</h2>
          <p className="mt-1 text-sm text-[#667085] leading-relaxed">
            Connect your calendar to automatically block times when you have existing events.
          </p>
        </div>

        {/* Provider Cards */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Google Calendar Card */}
          <div className="flex flex-col justify-between rounded-2xl border border-[#EAECF0] bg-white p-5 transition-all">
            <div>
              <div className="flex items-center gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#FEE4E2] text-sm font-bold text-[#D92D20]">
                  G
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-[#101828]">
                    Google Calendar
                  </h3>
                  <span className="text-xs text-[#667085]">
                    {isGoogleConnected ? "Connected" : "Not connected"}
                  </span>
                </div>
              </div>

              {isGoogleConnected && (
                <p className="mt-4 truncate text-xs text-[#344054]">
                  {googleEmail}
                </p>
              )}
            </div>

            <div className="mt-5 pt-3 border-t border-[#F2F4F7]">
              {isGoogleConnected ? (
                <button
                  type="button"
                  onClick={onDisconnectGoogle}
                  className="text-xs font-semibold text-[#D92D20] hover:underline"
                >
                  Disconnect
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onConnectGoogle}
                  className="text-xs font-semibold text-[#FF5514] hover:underline"
                >
                  Connect to sync events
                </button>
              )}
            </div>
          </div>

          {/* Microsoft Outlook Card */}
          <div className="flex flex-col justify-between rounded-2xl border border-[#EAECF0] bg-white p-5 transition-all">
            <div>
              <div className="flex items-center gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#EFF8FF] text-sm font-bold text-[#175CD3]">
                  O
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-[#101828]">
                    Microsoft Outlook
                  </h3>
                  <span className="text-xs text-[#667085]">
                    {isOutlookConnected ? "Connected" : "Not connected"}
                  </span>
                </div>
              </div>

              {isOutlookConnected ? (
                <p className="mt-4 truncate text-xs text-[#344054]">
                  outlook-user@outlook.com
                </p>
              ) : (
                <p className="mt-4 text-xs text-[#98A2B3]">
                  Sync personal or work outlook events
                </p>
              )}
            </div>

            <div className="mt-5 pt-3 border-t border-[#F2F4F7]">
              {isOutlookConnected ? (
                <button
                  type="button"
                  onClick={onDisconnectGoogle}
                  className="text-xs font-semibold text-[#D92D20] hover:underline"
                >
                  Disconnect
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onConnectOutlook}
                  className="text-xs font-semibold text-[#FF5514] hover:underline"
                >
                  Connect to sync events
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Security / Privacy Footer */}
        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-[#475467]">
          <Lock size={14} className="text-[#667085]" />
          <span>We only read your busy/free status. We never access event details.</span>
        </div>
      </div>
    </div>
  );
}
