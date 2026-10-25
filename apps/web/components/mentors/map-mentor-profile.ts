import type { MentorDetailProfile, MentorReview } from "./types";

/**
 * Builds a profile page model from the GET /mentors/:id response alone (no preview data).
 * Open dates are loaded separately per session length; group sessions and most socials stay empty.
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
    mentorUserId: res.mentorUserId,
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
    // The API lists the mentor's live 1:1 sessions, or a standard 1:1 at their profile price
    packages: Array.isArray(res.packages)
      ? res.packages.map((pkg: any) => ({
          id: String(pkg.id),
          mentorSessionId: pkg.mentorSessionId ?? null,
          title: pkg.title,
          durationMinutes: pkg.durationMinutes,
          price: pkg.price,
          numericPrice: pkg.numericPrice ?? 0,
          description: pkg.description || "",
        }))
      : [],
    availableDates: [],
    groupSessions: [],
  };
}
