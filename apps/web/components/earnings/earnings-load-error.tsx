import { AlertCircle } from "lucide-react";

interface EarningsLoadErrorProps {
  message: string;
  isRetrying: boolean;
  onRetry: () => void;
}

/** Shown in place of a page whose figures couldn't be loaded, so zeros are never mistaken for real ones */
export function EarningsLoadError({ message, isRetrying, onRetry }: EarningsLoadErrorProps) {
  return (
    <div role="alert" className="rounded-2xl border border-[#FDA29B] bg-[#FEF3F2] p-8 text-center text-sm text-[#B42318]">
      <AlertCircle className="mx-auto mb-2 size-6" />
      <p className="font-medium">{message}</p>
      <button
        type="button"
        disabled={isRetrying}
        onClick={onRetry}
        className="mt-4 rounded-full bg-[#B42318] px-5 py-2 text-xs font-semibold text-white transition hover:bg-[#912018] disabled:opacity-60"
      >
        {isRetrying ? "Trying again..." : "Retry"}
      </button>
    </div>
  );
}
