"use client";

import { useMemo, useState } from "react";
import { useMenteeProfile } from "@/services/mentees/queries/mentees.queries";
import { mapApiMenteeProfile } from "./map-mentee-profile";
import { MenteeHeroCard } from "./mentee-hero-card";
import { MenteeProfileSkeleton } from "./mentee-profile-skeleton";
import { MenteeProfileTabs, type MenteeProfileTab } from "./mentee-profile-tabs";
import { MenteeUnavailableState } from "./mentee-unavailable-state";

interface MenteeProfileViewProps {
  menteeId: string;
}

/** A mentor's view of a mentee who has booked them */
export function MenteeProfileView({ menteeId }: MenteeProfileViewProps) {
  const { data, isLoading, error } = useMenteeProfile(menteeId);
  const [activeTab, setActiveTab] = useState<MenteeProfileTab>("profile");

  const mentee = useMemo(() => (data?.id ? mapApiMenteeProfile(data) : null), [data]);

  if (isLoading) return <MenteeProfileSkeleton />;
  if (!mentee) return <MenteeUnavailableState isForbidden={error?.status === 403} />;

  return (
    <div className="flex w-full flex-1 flex-col gap-6 pb-16">
      <MenteeHeroCard mentee={mentee} />
      <div className="mx-auto w-full max-w-[596px]">
        <MenteeProfileTabs mentee={mentee} activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
    </div>
  );
}
