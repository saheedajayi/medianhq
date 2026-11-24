import { formatPeriod, mapLinks } from "@/components/mentors/map-mentor-profile";
import type { MenteePublicProfile } from "@/services/mentees";
import type { MenteeDetailProfile } from "./types";

/** Builds the page model from the GET /mentees/:id response */
export function mapApiMenteeProfile(res: MenteePublicProfile): MenteeDetailProfile {
  return {
    id: res.id,
    name: res.name || "Mentee",
    role: res.role || "",
    company: res.company || "",
    location: res.location || "",
    sessionCount: res.sessionCount ?? 0,
    rating: res.rating ?? 0,
    reviewCount: res.reviewCount ?? 0,
    avatarUrl: res.avatarUrl || "/default-avatar.svg",
    links: mapLinks(res),
    bio: res.bio || "",
    expertise: res.expertise ?? [],
    experience: (res.workExperiences ?? []).map((entry) => ({
      role: entry.role,
      company: entry.company,
      period: formatPeriod(entry),
      description: entry.contribution || "",
    })),
    reviews: (res.reviews ?? []).map((review) => ({
      id: review.id,
      authorName: review.authorName || "Mentor",
      authorAvatar: review.authorAvatar,
      date: review.createdAt
        ? new Date(review.createdAt).toLocaleDateString("en-US", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })
        : "",
      rating: review.rating ?? 0,
      comment: review.comment || "",
    })),
  };
}
