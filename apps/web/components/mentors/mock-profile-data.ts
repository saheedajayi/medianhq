import { MentorDetailProfile } from "./types";

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
      title: "Get to Know Each Other",
      durationMinutes: 15,
      price: "Free",
      numericPrice: 0,
      description:
        "A quick intro call to discuss your goals, challenges, and plan your strategy sessions.",
    },
    {
      id: "pkg-2",
      title: "CV Review & Optimization",
      durationMinutes: 30,
      price: "₦20,000",
      numericPrice: 20000,
      description:
        "Deep dive into CV improvement, portfolio critique, and positioning for top companies.",
    },
    {
      id: "pkg-3",
      title: "Career Positioning & Strategy",
      durationMinutes: 30,
      price: "₦25,000",
      numericPrice: 25000,
      description:
        "Strategic advice on navigating promotions, team leadership, and cross-functional influence.",
    },
  ],
  availableDates: [
    {
      dateString: "2026-06-07",
      dayOfWeek: "SUN",
      dayNumber: "07",
      month: "Jun",
      slotsCount: 8,
      times: ["03:00PM", "03:30PM", "04:00PM", "04:30PM", "05:00PM"],
    },
    {
      dateString: "2026-06-08",
      dayOfWeek: "MON",
      dayNumber: "08",
      month: "Jun",
      slotsCount: 6,
      times: ["02:00PM", "03:00PM", "03:30PM", "05:00PM"],
    },
    {
      dateString: "2026-06-09",
      dayOfWeek: "TUE",
      dayNumber: "09",
      month: "Jun",
      slotsCount: 4,
      times: ["11:00AM", "01:30PM", "04:00PM", "04:30PM"],
    },
    {
      dateString: "2026-06-10",
      dayOfWeek: "WED",
      dayNumber: "10",
      month: "Jun",
      slotsCount: 5,
      times: ["10:00AM", "11:30AM", "02:00PM", "03:00PM"],
    },
    {
      dateString: "2026-06-11",
      dayOfWeek: "THU",
      dayNumber: "11",
      month: "Jun",
      slotsCount: 7,
      times: ["01:00PM", "02:30PM", "03:00PM", "04:00PM"],
    },
  ],
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

export const mentorsDirectory: Record<string, MentorDetailProfile> = {
  "1": defaultMentorProfile,
  "2": {
    ...defaultMentorProfile,
    id: "2",
    name: "Amina Yusuf",
    role: "VP of Product",
    company: "Paystack",
    location: "Lagos",
    avatarUrl: "/mentors/mentor-2.png",
  },
  "3": {
    ...defaultMentorProfile,
    id: "3",
    name: "Chidinma Okafor",
    role: "Engineering Director",
    company: "Moniepoint",
    location: "London",
    avatarUrl: "/mentors/mentor-3.png",
  },
  "4": {
    ...defaultMentorProfile,
    id: "4",
    name: "Tunde Balogun",
    role: "Head of Growth",
    company: "Flutterwave",
    location: "San Francisco",
    avatarUrl: "/mentors/mentor-4.png",
  },
};
