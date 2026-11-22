"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { BasicInfoTab } from "./basic-info-tab";
import { CareerGoalsTab } from "./career-goals-tab";
import { CareerTab } from "./career-tab";
import { SocialsTab } from "./socials-tab";

const SECTIONS = [
  { value: "basic", label: "Basic info" },
  { value: "goals", label: "Career Goals" },
  { value: "career", label: "Career Info" },
  { value: "socials", label: "Socials" },
] as const;

type Section = (typeof SECTIONS)[number]["value"];

/** Mentors use the same sections, minus the mentee's career goals */
export function AccountTab({ withGoals = true }: { withGoals?: boolean }) {
  const sections = SECTIONS.filter((item) => withGoals || item.value !== "goals");
  // Links such as the dashboard's "Set your goals" open a section directly
  const linked = useSearchParams().get("section");
  const [section, setSection] = useState<Section>(
    sections.some((item) => item.value === linked) ? (linked as Section) : "basic"
  );

  return (
    <div className="flex flex-col gap-6">
      <div role="tablist" className="flex gap-2 border-b border-[#EAECF0]">
        {sections.map((item) => (
          <button
            key={item.value}
            role="tab"
            type="button"
            aria-selected={section === item.value}
            onClick={() => setSection(item.value)}
            className={`-mb-px whitespace-nowrap border-b px-3 py-2 text-sm transition ${
              section === item.value
                ? "border-[#101828] font-medium text-[#101828]"
                : "border-transparent text-[#475467] hover:text-[#101828]"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {section === "basic" && <BasicInfoTab />}
      {section === "goals" && <CareerGoalsTab />}
      {section === "career" && <CareerTab />}
      {section === "socials" && <SocialsTab />}
    </div>
  );
}
