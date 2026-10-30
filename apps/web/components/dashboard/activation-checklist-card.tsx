"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { toast } from "sonner";
import { Skeleton, SkeletonGroup } from "@/components/ui/base/skeleton";
import { ProfileUpdateModal } from "./profile-update-modal";

interface ActivationChecklistCardProps {
  userId?: string;
  isProfileComplete: boolean;
  hasAvailability: boolean;
  hasPayoutDetails: boolean;
  isLoading?: boolean;
}

const actionClass =
  "inline-flex shrink-0 items-center gap-2 text-sm font-medium text-[#FF5514] hover:underline";

// The default grey disappears on this card's peach background
const SKELETON_TINT = "bg-[#FFE3D6]!";

// Varied widths follow the real rows' text, so loading doesn't shift the card
const SKELETON_ROWS = [
  { title: "w-36", description: "w-3/5 max-w-sm", action: null },
  { title: "w-40", description: "w-4/5 max-w-lg", action: "w-28" },
  { title: "w-44", description: "w-3/4 max-w-md", action: "w-32" },
  { title: "w-40", description: "w-3/5 max-w-sm", action: "w-24" },
  { title: "w-32", description: "w-3/4 max-w-md", action: "w-28" },
];

// The API doesn't record shares, so this is remembered per browser
const readHasShared = (userId: string) => {
  try {
    return localStorage.getItem(`median:shared-mentor-profile:${userId}`) === "true";
  } catch {
    return false;
  }
};

const saveHasShared = (userId: string) => {
  try {
    localStorage.setItem(`median:shared-mentor-profile:${userId}`, "true");
  } catch {
    // Not being able to remember the share only means the step stays unticked
  }
};

export function ActivationChecklistCard({
  userId,
  isProfileComplete,
  hasAvailability,
  hasPayoutDetails,
  isLoading = false,
}: ActivationChecklistCardProps) {
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [hasShared, setHasShared] = useState(false);

  useEffect(() => {
    if (userId) setHasShared(readHasShared(userId));
  }, [userId]);

  const handleShare = async () => {
    if (!userId) return;
    const url = `${window.location.origin}/mentors/${userId}`;
    const text = "I'm open to mentorship on Median.";

    try {
      if (navigator.share) {
        await navigator.share({ title: "Median", text, url });
      } else {
        await navigator.clipboard.writeText(`${text} ${url}`);
        toast.success("Profile link copied. Paste it on your socials.");
      }
      saveHasShared(userId);
      setHasShared(true);
    } catch (err) {
      // Closing the share sheet isn't a failure
      if (err instanceof DOMException && err.name === "AbortError") return;
      toast.error("We couldn't share your profile link. Please try again.");
    }
  };

  const items = [
    {
      title: "Application approved",
      description: "Your submission has been successfully verified by our team.",
      done: true,
      action: null,
    },
    {
      title: "Complete your profile",
      description: "Add your professional journey, roles, skills, and tools so mentees can find you.",
      done: isProfileComplete,
      action: (
        <button type="button" onClick={() => setIsProfileModalOpen(true)} className={actionClass}>
          Complete profile <ArrowRight className="size-4" />
        </button>
      ),
    },
    {
      title: "Set up your availability",
      description: "Define your session time slots for booking coordination.",
      done: hasAvailability,
      action: (
        <Link href="/mentor/availability" className={actionClass}>
          <span className="flex items-center gap-2 text-[#FF5514]">
            Set up availability <ArrowRight className="size-4" />
          </span>
        </Link>
      ),
    },
    {
      title: "Set up payout details",
      description: "Connect your bank details to receive earnings.",
      done: hasPayoutDetails,
      action: (
        <Link href="/mentor/earnings" className={actionClass}>
          <span className="flex items-center gap-2 text-[#FF5514]">
            Set up payout <ArrowRight className="size-4" />
          </span>
        </Link>
      ),
    },
    {
      title: "Share on socials",
      description: "Let your network know you're open to mentorship on Median.",
      done: hasShared,
      action: (
        <button type="button" onClick={handleShare} className={actionClass}>
          Share on socials <ArrowRight className="size-4" />
        </button>
      ),
    },
  ];

  if (isLoading) {
    return (
      <SkeletonGroup
        label="Loading activation checklist"
        className="rounded-2xl border border-[#FFDEC9] bg-[#FFF9F6] p-5"
      >
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-sm font-semibold uppercase text-[#101828]">Activation checklist</h2>
          <Skeleton className={`h-4 w-28 ${SKELETON_TINT}`} />
        </div>

        <ul className="mt-4 flex flex-col gap-4">
          {SKELETON_ROWS.map(({ title, description, action }, index) => (
            <li
              key={index}
              className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-6"
            >
              <div className="flex flex-1 items-start gap-3">
                <Skeleton className={`mt-1 size-3.5 shrink-0 rounded-[2px] ${SKELETON_TINT}`} />
                {/* Same line heights as the real title and description */}
                <div className="flex flex-1 flex-col gap-1">
                  <div className="flex h-6 items-center">
                    <Skeleton className={`h-4 ${title} ${SKELETON_TINT}`} />
                  </div>
                  <div className="flex h-5 items-center">
                    <Skeleton className={`h-3.5 ${description} ${SKELETON_TINT}`} />
                  </div>
                </div>
              </div>
              {/* The approved step has nothing left to do, so it has no action */}
              {action && <Skeleton className={`ml-6 h-4 sm:ml-0 ${action} ${SKELETON_TINT}`} />}
            </li>
          ))}
        </ul>
      </SkeletonGroup>
    );
  }

  const completedCount = items.filter((item) => item.done).length;
  if (completedCount === items.length) return null;

  return (
    <>
      <section className="rounded-2xl border border-[#FFDEC9] bg-[#FFF9F6] p-5">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-sm font-semibold uppercase text-[#101828]">Activation checklist</h2>
          <span className="shrink-0 text-sm text-[#475467]">
            {completedCount} of {items.length} Complete -{" "}
            {Math.round((completedCount / items.length) * 100)}%
          </span>
        </div>

        <ul className="mt-4 flex flex-col gap-4">
          {items.map((item) => (
            <li
              key={item.title}
              className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-6"
            >
              <div className="flex items-start gap-3">
                <span
                  className={`mt-1 flex size-3.5 shrink-0 items-center justify-center rounded-[2px] border-[1.5px] border-[#FF5514] ${
                    item.done ? "bg-[#FF5514]" : "bg-transparent"
                  }`}
                >
                  {item.done && <Check className="size-2.5 stroke-[4] text-white" />}
                </span>
                <div className="flex flex-col gap-1">
                  <span
                    className={`text-base ${
                      item.done ? "text-[#667085] line-through" : "text-[#101828]"
                    }`}
                  >
                    {item.title}
                  </span>
                  <span className={`text-sm ${item.done ? "text-[#98A2B3]" : "text-[#667085]"}`}>
                    {item.description}
                  </span>
                </div>
              </div>
              {!item.done && item.action && <div className="pl-6 sm:pl-0">{item.action}</div>}
            </li>
          ))}
        </ul>
      </section>

      <ProfileUpdateModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />
    </>
  );
}
