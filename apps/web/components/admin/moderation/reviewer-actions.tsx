"use client";

import { useState } from "react";
import { InfoCircle, TickSquare, Trash, Warning2 } from "iconsax-react";
import { toast } from "sonner";
import type { ContentFlag, ReviewerAction } from "@/services/admin/moderation";
import { useTakeFlagAction } from "@/services/admin/moderation/queries/moderation.queries";
import { cn } from "@/lib/utils";

const ACTIONS: { value: ReviewerAction; label: string; icon: typeof Trash; className: string; color: string }[] = [
  { value: "APPROVE", label: "Approve", icon: TickSquare, className: "bg-[#DCEBE4]", color: "#067647" },
  { value: "REMOVE", label: "Remove", icon: Trash, className: "bg-[#FEE4E2]", color: "#F04438" },
  { value: "ESCALATE", label: "Escalate", icon: InfoCircle, className: "bg-[#F5E3D7]", color: "#C2410C" },
  { value: "WARN_USER", label: "Warn User", icon: Warning2, className: "bg-[#F1DFFB]", color: "#A21CAF" },
];

interface ReviewerActionsProps {
  flag: ContentFlag;
}

/** Pick what to do with the content, then confirm it with Take Action */
export function ReviewerActions({ flag }: ReviewerActionsProps) {
  const [action, setAction] = useState<ReviewerAction | null>(null);
  const takeAction = useTakeFlagAction(flag.id);

  const handleTakeAction = () => {
    if (!action) return;
    takeAction.mutate(action, {
      onSuccess: () => {
        toast.success("Action recorded.");
        setAction(null);
      },
      onError: (error) => toast.error(error.message || "We couldn't record that action."),
    });
  };

  return (
    <div>
      <h3 className="text-[15px] text-[#101828]">Reviewer Actions</h3>
      <div className="mt-3 grid grid-cols-4 gap-2.5">
        {ACTIONS.map(({ value, label, icon: Icon, className, color }) => (
          <button
            key={value}
            type="button"
            aria-pressed={action === value}
            onClick={() => setAction(value)}
            className={cn(
              "flex aspect-square flex-col items-center justify-center gap-1.5 rounded text-[7px] font-medium",
              className,
              action === value && "ring-2 ring-[#FF5514]",
            )}
            style={{ color }}
          >
            <Icon size="22" variant="Outline" color={color} />
            {label}
          </button>
        ))}
      </div>
      <button
        type="button"
        disabled={!action || takeAction.isPending}
        onClick={handleTakeAction}
        className="mt-3 w-full rounded bg-[#FF5514] py-2 text-sm font-semibold text-white transition-colors hover:bg-[#E84D12] disabled:opacity-60"
      >
        {takeAction.isPending ? "Saving..." : "Take Action"}
      </button>
    </div>
  );
}
