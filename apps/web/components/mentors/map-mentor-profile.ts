import type { MentorDetailProfile, MentorLink, MentorReview } from "./types";

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const formatMonth = (month?: number | null, year?: number | null) =>
  year ? [MONTHS[(month ?? 0) - 1], year].filter(Boolean).join(" ") : "";

/** "March 2022 - Present" or "September 2010 - July 2014" */
export const formatPeriod = (entry: any) =>
  [
    formatMonth(entry.startMonth, entry.startYear),
    entry.isCurrent ? "Present" : formatMonth(entry.endMonth, entry.endYear),
  ]
    .filter(Boolean)
    .join(" - ");

const LINK_KINDS: Record<string, MentorLink["kind"]> = {
  WEBSITE: "website",
  LINKEDIN: "linkedin",
  X: "x",
  CUSTOM: "custom",
};
const LINK_TITLES: Record<MentorLink["kind"], string> = {
  website: "Website",
  linkedin: "LinkedIn",
  x: "X",
  custom: "Link",
};
const LINK_ORDER: MentorLink["kind"][] = ["website", "linkedin", "x", "custom"];

const isWebUrl = (url: unknown): url is string => typeof url === "string" && /^https?:\/\//i.test(url);

/** The links saved in Settings, or the LinkedIn profile from the mentor's application if none is saved */
export function mapLinks(res: any): MentorLink[] {
  const links: MentorLink[] = (Array.isArray(res.socialLinks) ? res.socialLinks : [])
    .filter((link: any) => LINK_KINDS[link.kind] && isWebUrl(link.url))
    .map((link: any) => {
      const kind = LINK_KINDS[link.kind] as MentorLink["kind"];
      return { kind, url: link.url, title: link.title || LINK_TITLES[kind] };
    });
  if (!links.some((link) => link.kind === "linkedin") && isWebUrl(res.linkedinUrl)) {
    links.push({ kind: "linkedin", url: res.linkedinUrl, title: LINK_TITLES.linkedin });
  }
  return links.sort((a, b) => LINK_ORDER.indexOf(a.kind) - LINK_ORDER.indexOf(b.kind));
}

/**
 * Builds a profile page model from the GET /mentors/:id response alone (no preview data).
 * Open dates are loaded separately per session length; group sessions stay empty.
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
    links: mapLinks(res),
    bio: res.bio || "",
    expertise: Array.isArray(res.tags) ? res.tags : [],
    // Until the mentor adds their history in Settings, their current role stands in for it
    experience:
      Array.isArray(res.workExperiences) && res.workExperiences.length > 0
        ? res.workExperiences.map((entry: any) => ({
            role: entry.role,
            company: entry.company,
            period: formatPeriod(entry),
            description: entry.contribution || "",
          }))
        : [{ role, company, period: "Present" }],
    education: Array.isArray(res.educations)
      ? res.educations.map((entry: any) => ({
          role: entry.fieldOfStudy,
          company: entry.school,
          period: formatPeriod(entry),
          description: entry.learnings || "",
        }))
      : [],
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
          currency: pkg.currency,
          description: pkg.description || "",
        }))
      : [],
    availableDates: [],
    groupSessions: [],
  };
}
