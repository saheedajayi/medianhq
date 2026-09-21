import { AvailableDateSlot, MentorDetailProfile } from "./types";
import { mockExploreMentors } from "../explore/mock-mentors";

function upcomingDates(): AvailableDateSlot[] {
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setHours(12, 0, 0, 0);
    date.setDate(date.getDate() + index + 1);
    const times = ["3:00PM", "3:30PM", "4:00PM", "4:30PM"];
    return {
      dateString: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`,
      dayOfWeek: date.toLocaleDateString("en-US", { weekday: "short" }).toUpperCase(),
      dayNumber: String(date.getDate()).padStart(2, "0"),
      month: date.toLocaleDateString("en-US", { month: "short" }),
      slotsCount: times.length,
      times,
    };
  });
}

export const defaultMentorProfile: MentorDetailProfile = {
  id: "1",
  name: "Adaeze Okonkwo",
  role: "Senior Designer",
  company: "Andela",
  location: "London",
  sessionCount: 40,
  rating: 4.5,
  reviewCount: 20,
  avatarUrl: "/mentors/mentor-2.png",
  socials: {
    website: "https://medianhq.co",
    facebook: "https://linkedin.com",
    instagram: "https://instagram.com/median_hq",
  },
  bio: "You chose to improve people's well-being. You stepped out of your comfort zone. I want to hear about your challenges. Together, we will tap into your inner strengths and find joy when things get complicated.",
  expertise: [
    "Product strategy",
    "Fintech",
    "Career growth",
    "Leadership",
  ],
  experience: [
    {
      role: "VP of Product",
      company: "Kuda",
      period: "2024 - Present",
    },
    {
      role: "Director of Product",
      company: "Kuda",
      period: "2021 - 2024",
    },
    {
      role: "Senior Product Manager",
      company: "Kuda",
      period: "2020 - 2021",
    },
  ],
  reviews: [
    {
      id: "r1",
      authorName: "Anna T.",
      authorAvatar: "/mentors/mentor-3.png",
      date: "Feb 2, 2026",
      rating: 5,
      comment:
        "Sarah's advice was incredibly actionable. She helped me reframe my approach to stakeholder management which directly led to my promotion.",
    },
    {
      id: "r2",
      authorName: "Marcus Vance",
      authorAvatar: "/mentors/mentor-1.png",
      date: "Jan 18, 2026",
      rating: 5,
      comment:
        "The CV review completely changed how I frame my engineering leadership experience. Landed interviews within two weeks!",
    },
    {
      id: "r3",
      authorName: "Chioma Nwosu",
      authorAvatar: "/mentors/mentor-4.png",
      date: "Dec 12, 2025",
      rating: 4.5,
      comment:
        "Extremely insightful session on scaling Fintech products. Adaeze was patient, thoughtful, and shared direct frameworks I can use immediately.",
    },
  ],
  packages: [
    {
      id: "pkg-1",
      title: "Get to Know You",
      durationMinutes: 15,
      price: "Free",
      numericPrice: 0,
      description:
        "A quick intro chat to see if we're a good fit before booking longer strategy sessions.",
    },
    {
      id: "pkg-2",
      title: "CV Review",
      durationMinutes: 30,
      price: "₦20,000",
      numericPrice: 20000,
      description:
        "Deep dive into your CV with actionable feedback, layout improvements and positioning tips.",
    },
    {
      id: "pkg-3",
      title: "Career Positioning",
      durationMinutes: 30,
      price: "₦15,000",
      numericPrice: 15000,
      description:
        "Strategic advice on your next career move, salary negotiation, support or portfolio positioning.",
    },
  ],
  availableDates: upcomingDates(),
  groupSessions: [
    {
      id: "grp-1",
      title: "Career Clarity Masterclass",
      date: "July 22nd, 2026 • 6:00 PM WAT",
      description:
        "Step out of your comfort zone and define your high-impact product roadmap with like-minded peers.",
      imageUrl: "/mentors/mentor-2.png",
      spotsLeft: 6,
    },
    {
      id: "grp-2",
      title: "Breaking into Fintech Leadership",
      date: "August 5th, 2026 • 5:00 PM WAT",
      description:
        "A group roundtable on scaling payments systems, building trust with stakeholders, and executive presence.",
      imageUrl: "/mentors/mentor-1.png",
      spotsLeft: 4,
    },
  ],
};

export const mentorsDirectory: Record<string, MentorDetailProfile> = Object.fromEntries(
  mockExploreMentors.map((mentor) => [
    mentor.id,
    {
      ...defaultMentorProfile,
      id: mentor.id,
      name: mentor.name,
      role: mentor.role,
      company: mentor.company,
      location: mentor.location,
      sessionCount: mentor.sessionCount,
      rating: mentor.rating,
      reviewCount: mentor.reviewCount,
      avatarUrl: mentor.avatarUrl,
      bio: mentor.bio,
      expertise: mentor.tags,
      experience: [{ role: mentor.role, company: mentor.company, period: "Present" }],
    },
  ])
);
