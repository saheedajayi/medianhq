"use client";

import { useEffect, useState } from "react";
import { MentorCard, Mentor } from "./mentor-card";
import { mentorsService } from "@/services/mentors";

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

export function MentorsForYouSection({ mentors }: MentorsForYouSectionProps) {
  const [list, setList] = useState<Mentor[]>(mentors || defaultMentors);

  useEffect(() => {
    if (mentors && mentors.length > 0) {
      setList(mentors);
      return;
    }

    let isMounted = true;
    mentorsService
      .getFeatured(6)
      .then((featured: any) => {
        if (!isMounted || !Array.isArray(featured) || featured.length === 0) return;
        const mapped: Mentor[] = featured.map((m: any) => ({
          id: String(m.id),
          name: m.name || "Mentor",
          role: m.role || "Mentor",
          company: m.company || "Independent",
          location: m.location || "Remote",
          sessionCount: m.sessionCount ?? 0,
          rating: m.rating ?? 5.0,
          reviewCount: m.reviewCount ?? 0,
          bio: m.bio || "",
          price: m.price || "Free",
          avatarUrl: m.avatarUrl,
        }));
        setList(mapped);
      })
      .catch((err) => {
        console.warn("Could not fetch featured mentors from API, using default dataset:", err);
      });

    return () => {
      isMounted = false;
    };
  }, [mentors]);

  return (
    <section className="flex flex-col gap-4 rounded-3xl border border-[#EAECF0] bg-white p-6 md:p-8 shadow-xs">
      <h2 className="text-xs font-bold tracking-wider text-[#667085] uppercase">
        Mentors For You
      </h2>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((mentor, index) => (
          <MentorCard key={`${mentor.id}-${index}`} mentor={mentor} />
        ))}
      </div>
    </section>
  );
}
