import type { MentorDetailProfile, MentorReview } from "./types";

/**
 * Builds a profile page model from the GET /mentors/:id response alone (no preview data).
 * Fields the API does not provide yet (dates, group sessions, socials) stay empty.
 */
export function mapApiMentorProfile(res: any): MentorDetailProfile {
  const role = res.role || "Mentor";
  const company = res.company || "Independent";

  const reviews: MentorReview[] = Array.isArray(res.reviews)
    ? res.reviews.map((r: any) => ({
        id: String(r.id),
        authorName: r.authorName || "Anonymous",
        authorAvatar: r.authorAvatar,
        date: r.createdAt
          ? new Date(r.createdAt).toLocaleDateString("en-US", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })
          : "",
        rating: r.rating ?? 0,
        comment: r.comment || "",
      }))
    : [];

  return {
    id: String(res.id),
    name: res.name || "Mentor",
    role,
    company,
    location: res.location || "",
    sessionCount: res.sessionCount ?? 0,
    rating: res.rating ?? 0,
    reviewCount: res.reviewCount ?? reviews.length,
    avatarUrl: res.avatarUrl || "/default-avatar.svg",
    socials: { linkedin: res.linkedinUrl || undefined },
    bio: res.bio || "",
    expertise: Array.isArray(res.tags) ? res.tags : [],
    experience: [{ role, company, period: "Present" }],
    reviews,
    packages: [
      {
        id: "standard",
        title: "1:1 Mentorship Session",
        durationMinutes: 30,
        price: res.price || "Free",
        numericPrice: res.pricePerSession ?? 0,
        description: "A one-on-one session with this mentor.",
      },
    ],
    availableDates: [],
    groupSessions: [],
  };
}
