import { Location } from "iconsax-react";
import type { AdminApplicationDetail } from "@/services/admin/applications";
import { cn } from "@/lib/utils";
import { DetailList, UserAvatar, cardClass, linkClass } from "../shared/shared";
import { formatRole } from "./application-utils";

interface ApplicantCardProps {
  application: AdminApplicationDetail;
}

export function ApplicantCard({ application }: ApplicantCardProps) {
  const role = formatRole(application, " @ ");

  return (
    <section className={cn(cardClass, "p-5")}>
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="flex flex-col items-center rounded-2xl border border-[#EAECF0] px-5 py-8 text-center">
          <UserAvatar name={application.name} avatarUrl={application.avatarUrl} className="size-28 text-3xl" />
          <h2 className="mt-4 text-lg font-semibold text-[#101828]">{application.name}</h2>
          {role && <p className="mt-1 text-sm text-[#475467]">{role}</p>}
          {application.location && (
            <p className="mt-1.5 flex items-center gap-1 text-sm text-[#475467]">
              <Location size="14" variant="Outline" color="#475467" />
              {application.location}
            </p>
          )}
        </div>

        <DetailList
          className="py-2"
          items={[
            ["User ID", application.userId],
            ["Email", application.email],
            ["Experience", application.experience],
          ]}
        />
      </div>

      <div className="mt-5 rounded-xl bg-[#F9FAFB] p-3.5">
        <p className="text-xs font-semibold text-[#101828]">LinkedIn URL</p>
        {application.linkedinUrl ? (
          <a
            href={application.linkedinUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(linkClass, "mt-1.5 block break-all font-normal")}
          >
            {application.linkedinUrl}
          </a>
        ) : (
          <p className="mt-1.5 text-sm text-[#667085]">Not provided</p>
        )}
        {application.cvUrl && (
          <a
            href={application.cvUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(linkClass, "mt-3 inline-block")}
          >
            View CV
          </a>
        )}
      </div>
    </section>
  );
}
