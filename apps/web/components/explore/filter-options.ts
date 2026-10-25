import type {
  AvailabilityOption,
  ExperienceLevel,
  ExploreFilterState,
  ExploreMentor,
  MentorGender,
  SessionType,
} from "./types";

// Each expertise option matches mentors whose tags or role mention any of its keywords
export const expertiseOptions: { label: string; keywords: string[] }[] = [
  { label: "UI/UX Design", keywords: ["ui/ux", "ux", "ui design", "design system", "figma"] },
  { label: "Product Design", keywords: ["product design"] },
  { label: "Web Development", keywords: ["web", "frontend", "front-end", "full stack", "fullstack"] },
  { label: "Data Science", keywords: ["data", "ai/ml", "machine learning"] },
  { label: "Marketing", keywords: ["marketing"] },
  { label: "Graphic Design", keywords: ["graphic", "brand", "visual design"] },
];

export const locationOptions = ["Lagos", "London", "New York", "Remote", "Accra", "Nairobi"];

export const availabilityOptions: { value: AvailabilityOption; label: string }[] = [
  { value: "now", label: "Available now" },
  { value: "this-week", label: "This week" },
  { value: "this-month", label: "This month" },
  { value: "weekends", label: "Weekends only" },
];

export const sessionTypeOptions: { value: SessionType; label: string }[] = [
  { value: "one-on-one", label: "One-on-one" },
  { value: "group", label: "Group session" },
];

export const ratingOptions = [4, 3, 2, 1];

export const experienceLevelOptions: { value: ExperienceLevel; label: string }[] = [
  { value: "beginner", label: "Beginner friendly" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
  { value: "expert", label: "Expert" },
];

export const genderOptions: { value: MentorGender; label: string }[] = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
];

/** Number of filter groups in use (search, category and sort are not counted). */
export function countActiveFilters(filters: ExploreFilterState): number {
  return [
    filters.expertise?.length,
    filters.locations?.length,
    filters.minPrice !== undefined || filters.maxPrice !== undefined,
    filters.availability?.length,
    filters.sessionTypes?.length,
    filters.minRating !== undefined,
    filters.experienceLevels?.length,
    filters.gender,
  ].filter(Boolean).length;
}

function mentorPrice(mentor: ExploreMentor): number {
  if (typeof mentor.pricePerSession === "number") return mentor.pricePerSession;
  const digits = (mentor.price ?? "").replace(/[^\d]/g, "");
  return digits ? Number(digits) : 0;
}

// "tomorrow" -> 1, "in 3 days" -> 3, "today" -> 0
function daysUntilAvailable(mentor: ExploreMentor): number | null {
  const relative = mentor.nextAvailability?.relative?.toLowerCase() ?? "";
  if (relative.includes("today") || relative.includes("now")) return 0;
  if (relative.includes("tomorrow")) return 1;
  const match = relative.match(/(\d+)\s*day/);
  return match ? Number(match[1]) : null;
}

function matchesAvailability(mentor: ExploreMentor, option: AvailabilityOption): boolean {
  if (option === "weekends") {
    return /^(sat|sun)/i.test(mentor.nextAvailability?.formattedDate ?? "");
  }
  const days = daysUntilAvailable(mentor);
  if (days === null) return false;
  if (option === "now") return days <= 1;
  if (option === "this-week") return days <= 7;
  return days <= 30;
}

export function applyMentorFilters(
  mentors: ExploreMentor[],
  filters: ExploreFilterState
): ExploreMentor[] {
  return mentors.filter((mentor) => {
    if (filters.expertise?.length) {
      const haystack = [...mentor.tags, mentor.role].join(" ").toLowerCase();
      const matches = expertiseOptions
        .filter((option) => filters.expertise!.includes(option.label))
        .some((option) => option.keywords.some((keyword) => haystack.includes(keyword)));
      if (!matches) return false;
    }

    if (
      filters.locations?.length &&
      !filters.locations.some((location) =>
        mentor.location.toLowerCase().includes(location.toLowerCase())
      )
    ) {
      return false;
    }

    const price = mentorPrice(mentor);
    if (filters.minPrice !== undefined && price < filters.minPrice) return false;
    if (filters.maxPrice !== undefined && price > filters.maxPrice) return false;

    if (
      filters.availability?.length &&
      !filters.availability.some((option) => matchesAvailability(mentor, option))
    ) {
      return false;
    }

    if (
      filters.sessionTypes?.length &&
      !filters.sessionTypes.some((type) => mentor.sessionTypes?.includes(type))
    ) {
      return false;
    }

    if (filters.minRating !== undefined && mentor.rating < filters.minRating) return false;

    if (
      filters.experienceLevels?.length &&
      (!mentor.experienceLevel || !filters.experienceLevels.includes(mentor.experienceLevel))
    ) {
      return false;
    }

    if (filters.gender && mentor.gender !== filters.gender) return false;

    return true;
  });
}
