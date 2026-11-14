import type { AdminApplicationDetail } from "@/services/admin/applications";
import { cn } from "@/lib/utils";
import { badgeClass, cardClass, cardTitleClass, chipClass } from "../shared/shared";

const answerClass = "mt-4 whitespace-pre-line text-sm leading-relaxed text-[#475467]";

interface ApplicationAnswerProps {
  application: AdminApplicationDetail;
}

export function ExpertiseCard({ application }: ApplicationAnswerProps) {
  return (
    <section className={cn(cardClass, "p-5")}>
      <h2 className={cardTitleClass}>Expertise &amp; professional scope</h2>
      <p className="mt-4 flex flex-wrap gap-2">
        <span className={cn(badgeClass, "bg-[#FFEEE8] text-[#E84D12]")}>{application.expertise}</span>
        {application.skills.map((skill) => (
          <span key={skill} className={chipClass}>
            {skill}
          </span>
        ))}
      </p>
      <p className={answerClass}>{application.bio ?? "No professional summary provided."}</p>
    </section>
  );
}

export function MotivationCard({ application }: ApplicationAnswerProps) {
  return (
    <section className={cn(cardClass, "p-5")}>
      <h2 className={cardTitleClass}>Why I want to mentor</h2>
      <p className={answerClass}>{application.motivation ?? "No answer provided."}</p>
    </section>
  );
}
