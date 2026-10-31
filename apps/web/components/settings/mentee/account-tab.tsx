"use client";

import { useState } from "react";
import { BasicInfoTab } from "./basic-info-tab";
import { CareerTab } from "./career-tab";
import { SocialsTab } from "./socials-tab";

const SECTIONS = [
  { value: "basic", label: "Basic Info" },
  { value: "career", label: "Career Info" },
  { value: "socials", label: "Socials" },
] as const;

type Section = (typeof SECTIONS)[number]["value"];

export function AccountTab() {
  const [section, setSection] = useState<Section>("basic");

  return (
    <div className="flex flex-col gap-6">
      <div role="tablist" className="flex gap-2 border-b border-[#EAECF0]">
        {SECTIONS.map((item) => (
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
      {section === "career" && <CareerTab />}
      {section === "socials" && <SocialsTab />}
    </div>
  );
}
