import { Check } from "lucide-react";

export function SubmittedCheckIcon({ compact = false }: { compact?: boolean }) {
  return (
    <div
      aria-hidden="true"
      className={`flex shrink-0 items-center justify-center rounded-full border border-[#E4E7EC] bg-white ${compact ? "size-12" : "size-24"}`}
    >
      <div className={`flex items-center justify-center rounded-full border-[2.5px] border-[#1D2939] ${compact ? "size-6" : "size-11"}`}>
        <Check className={compact ? "size-4 text-[#1D2939]" : "size-7 text-[#1D2939]"} strokeWidth={3} />
      </div>
    </div>
  );
}
