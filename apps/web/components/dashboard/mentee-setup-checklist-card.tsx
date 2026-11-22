"use client";

import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";

const actionClass =
  "inline-flex shrink-0 items-center gap-2 text-sm font-medium text-[#FF5514] hover:underline";

/** What a mentee who skipped onboarding (a rejected mentor applicant) still has to fill in */
export function MenteeSetupChecklistCard({
  isProfileComplete,
  hasGoals,
}: {
  isProfileComplete: boolean;
  hasGoals: boolean;
}) {
  const items = [
    {
      title: "Complete your profile",
      description: "Tell us more about you",
      done: isProfileComplete,
      href: "/settings?tab=account",
      action: "Go to settings",
    },
    {
      title: "Set your goals",
      description: "Tell us what success looks like to you",
      done: hasGoals,
      href: "/settings?tab=account&section=goals",
      action: "Set your goals",
    },
  ];

  const completedCount = items.filter((item) => item.done).length;
  if (completedCount === items.length) return null;

  return (
    <section className="rounded-2xl border border-[#FFDEC9] bg-[#FFF9F6] p-5">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-sm font-semibold uppercase text-[#101828]">Set up mentee profile</h2>
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
            {!item.done && (
              <Link href={item.href} className={`${actionClass} pl-6 sm:pl-0`}>
                {item.action} <ArrowRight className="size-4" />
              </Link>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
