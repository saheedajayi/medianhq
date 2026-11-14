"use client";

import { useState } from "react";
import { SegmentedTabs } from "@/components/ui/custom/segmented-tabs";
import type { AdminApplicationDetail } from "@/services/admin/applications";
import { cn } from "@/lib/utils";
import { DetailList, cardClass, cardTitleClass, chipClass } from "../shared/shared";

const EMAIL_TABS = [
  { value: "accept", label: "Accept" },
  { value: "reject", label: "Reject" },
] as const;

type EmailTab = (typeof EMAIL_TABS)[number]["value"];

interface DecisionEmailCardProps {
  application: AdminApplicationDetail;
}

/** Shows the email the applicant gets for either decision, exactly as the API sends it */
export function DecisionEmailCard({ application }: DecisionEmailCardProps) {
  const [tab, setTab] = useState<EmailTab>("accept");
  const email = application.emailPreview[tab];
  const firstName = application.name.split(" ")[0];

  return (
    <section className={cn(cardClass, "p-5")}>
      <div className="flex items-center justify-between gap-3">
        <h2 className={cardTitleClass}>Decision email preview</h2>
        <span className={chipClass}>{application.status === "PENDING_REVIEW" ? "Draft" : "Sent"}</span>
      </div>

      <SegmentedTabs tabs={EMAIL_TABS} activeTab={tab} onChange={setTab} size="lg" className="mt-4" />

      <DetailList
        className="mt-5"
        items={[
          ["To", application.email],
          ["Subject", email.subject],
        ]}
      />

      <div className="mt-5 flex flex-col gap-3 text-sm leading-relaxed text-[#344054]">
        <p>Hi {firstName},</p>
        {email.paragraphs.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>

      {tab === "reject" && (
        <p className="mt-4 rounded-xl bg-[#F9FAFB] p-3.5 text-xs leading-relaxed text-[#667085]">
          Feedback you add when rejecting is included in this email. Private reviewer notes never are.
        </p>
      )}
    </section>
  );
}
