"use client";

import { MentorCard, Mentor } from "./mentor-card";

const defaultMentors: Mentor[] = [
  {
    id: "1",
    name: "Abdulrahman Hassan",
    role: "VP Product",
    company: "Kuda",
    location: "London",
    sessionCount: 40,
    rating: 4.5,
    reviewCount: 20,
    bio: "You chose to improve people's well-being. You stepped out of your comfort zone.",
    price: "Free",
  },
  {
    id: "2",
    name: "Abdulrahman Hassan",
    role: "VP Product",
    company: "Kuda",
    location: "London",
    sessionCount: 40,
    rating: 4.5,
    reviewCount: 20,
    bio: "You chose to improve people's well-being. You stepped out of your comfort zone.",
    price: "N20,000",
  },
  {
    id: "3",
    name: "Abdulrahman Hassan",
    role: "VP Product",
    company: "Kuda",
    location: "London",
    sessionCount: 40,
    rating: 4.5,
    reviewCount: 20,
    bio: "You chose to improve people's well-being. You stepped out of your comfort zone.",
    price: "Free",
  },
  {
    id: "4",
    name: "Abdulrahman Hassan",
    role: "VP Product",
    company: "Kuda",
    location: "London",
    sessionCount: 40,
    rating: 4.5,
    reviewCount: 20,
    bio: "You chose to improve people's well-being. You stepped out of your comfort zone.",
    price: "Free",
  },
  {
    id: "5",
    name: "Abdulrahman Hassan",
    role: "VP Product",
    company: "Kuda",
    location: "London",
    sessionCount: 40,
    rating: 4.5,
    reviewCount: 20,
    bio: "You chose to improve people's well-being. You stepped out of your comfort zone.",
    price: "N20,000",
  },
  {
    id: "6",
    name: "Abdulrahman Hassan",
    role: "VP Product",
    company: "Kuda",
    location: "London",
    sessionCount: 40,
    rating: 4.5,
    reviewCount: 20,
    bio: "You chose to improve people's well-being. You stepped out of your comfort zone.",
    price: "Free",
  },
];

interface MentorsForYouSectionProps {
  mentors?: Mentor[];
}

export function MentorsForYouSection({ mentors = defaultMentors }: MentorsForYouSectionProps) {
  return (
    <section className="flex flex-col gap-4 rounded-3xl border border-[#EAECF0] bg-white p-6 md:p-8 shadow-xs">
      <h2 className="text-xs font-bold tracking-wider text-[#667085] uppercase">
        Mentors For You
      </h2>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {mentors.map((mentor, index) => (
          <MentorCard key={`${mentor.id}-${index}`} mentor={mentor} />
        ))}
      </div>
    </section>
  );
}
