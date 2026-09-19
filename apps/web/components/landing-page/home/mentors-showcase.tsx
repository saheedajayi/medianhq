"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Location, Messages } from "iconsax-react";
import { Star } from "lucide-react";

const CATEGORIES = [
  "Tech Professionals",
  "Finance",
  "Consulting",
  "Business",
];

const MENTORS = [
  {
    name: "Adebiyi Basirat",
    role: "Senior Investment Analyst @ Cowrywise",
    location: "Lagos",
    sessions: 40,
    rating: 4.5,
    reviews: 20,
    avatar: "/landing-page/mentor-female.png",
    tags: ["Product Strategy", "Fintech", "Healthtech"],
    availability: "Wed, 12 August 11:30 AM",
    inDays: "in 3 days",
    category: "Finance",
  },
  {
    name: "Ayomide Olupitan",
    role: "Co-founder @ Loma Bank",
    location: "Lagos",
    sessions: 40,
    rating: 4.5,
    reviews: 20,
    avatar: "/landing-page/mentor-female.png",
    tags: ["Product Strategy", "Fintech", "Healthtech"],
    availability: "Wed, 12 August 11:30 AM",
    inDays: "in 3 days",
    category: "Tech Professionals",
  },
  {
    name: "Babatunde Adeleke",
    role: "Lead Product Designer @ Paystack",
    location: "Lagos",
    sessions: 48,
    rating: 4.9,
    reviews: 32,
    avatar: "/landing-page/mentor-male.png",
    tags: ["Design Systems", "Fintech", "UX Research"],
    availability: "Tue, 11 August 2:00 PM",
    inDays: "in 2 days",
    category: "Tech Professionals",
  },
  {
    name: "Abdulrahman Hassan",
    role: "Senior Designer @ Andela",
    location: "London",
    sessions: 40,
    rating: 4.5,
    reviews: 20,
    avatar: "/mentors/mentor-1.png",
    tags: ["Product Strategy", "Fintech", "Healthtech"],
    availability: "Wed, 12 August 11:30 AM",
    inDays: "in 3 days",
    category: "Consulting",
  },
  {
    name: "Amina Yusuf",
    role: "VP of Product @ Revolut",
    location: "London",
    sessions: 52,
    rating: 4.9,
    reviews: 38,
    avatar: "/mentors/mentor-3.png",
    tags: ["Growth", "Fintech", "Payments"],
    availability: "Thu, 13 August 2:00 PM",
    inDays: "in 2 days",
    category: "Business",
  },
  {
    name: "Chidinma Okafor",
    role: "Engineering Director @ Stripe",
    location: "London",
    sessions: 35,
    rating: 4.8,
    reviews: 29,
    avatar: "/mentors/mentor-4.png",
    tags: ["Leadership", "Cloud Architecture", "Career Growth"],
    availability: "Fri, 14 August 4:30 PM",
    inDays: "in 4 days",
    category: "Tech Professionals",
  },
];

export function LandingMentorsShowcase() {
  const [selectedCategory, setSelectedCategory] = useState("Tech Professionals");

  return (
    <section className="relative overflow-hidden bg-white py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-[#101828] sm:text-4xl lg:text-5xl">
            Our mentors are top professionals across Tech, Finance, Consulting and Business
          </h2>
          <p className="mt-4 text-base text-[#475467] sm:text-lg">
            Pick the brains of our mentors who work at some of the world&apos;s leading companies including employees from Revolut, Stripe, and Paystack.
          </p>

          {/* Category Tabs */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-2 sm:gap-3">
            {CATEGORIES.map((category) => {
              const isActive = selectedCategory === category;
              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => setSelectedCategory(category)}
                  className={`rounded-full px-3.5 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold transition-all ${
                    isActive
                      ? "bg-[#FF5514] text-white shadow-xs"
                      : "border border-[#D0D5DD] bg-white text-[#344054] hover:bg-[#F9FAFB]"
                  }`}
                >
                  {category}
                </button>
              );
            })}
          </div>
        </div>

        {/* Section Subtitle */}
        <h3 className="mt-14 text-center text-2xl font-bold text-[#101828]">
          Top mentors
        </h3>

        {/* Mentors Grid */}
        <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {MENTORS.map((mentor) => (
            <div
              key={mentor.name}
              className="flex flex-col justify-between overflow-hidden rounded-3xl border border-[#EAECF0] bg-white shadow-2xs transition-all hover:border-[#D0D5DD] hover:shadow-md"
            >
              {/* Card Body */}
              <div className="p-6 sm:p-7 text-center">
                {/* Avatar */}
                <div className="mx-auto size-28 overflow-hidden rounded-full border-2 border-white shadow-xs">
                  <Image
                    src={mentor.avatar}
                    alt={mentor.name}
                    width={112}
                    height={112}
                    className="size-full object-cover"
                  />
                </div>

                {/* Name & Role */}
                <div className="mt-5 text-center">
                  <h4 className="text-xl font-bold text-[#101828]">{mentor.name}</h4>
                  <p className="mt-1 text-sm text-[#475467]">{mentor.role}</p>
                  <div className="mt-2.5 flex items-center justify-center gap-2.5 text-xs text-[#475467]">
                    <span className="inline-flex items-center gap-1">
                      <Location size="15" variant="Linear" color="#475467" className="shrink-0" />
                      {mentor.location}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Messages size="15" variant="Linear" color="#475467" className="shrink-0" />
                      {mentor.sessions} Session
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Star className="size-3.5 fill-[#FDB022] text-[#FDB022] shrink-0" />
                      {mentor.rating} ({mentor.reviews} Reviews)
                    </span>
                  </div>
                </div>

                {/* Expertise Tags */}
                <div className="mt-4 flex flex-wrap justify-center gap-1.5">
                  {mentor.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-[#F2F4F7] px-3.5 py-1 text-xs font-medium text-[#344054]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Card Footer: Next Availability & CTA */}
              <div className="border-t border-[#F2F4F7] bg-[#F9FAFB] px-6 py-4 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs sm:text-[13px] font-bold text-[#FF5514]">
                      Next availability
                    </span>
                    <span className="rounded-full bg-[#FFEEE8] px-2 py-0.5 text-[11px] font-medium text-[#FF5514]">
                      {mentor.inDays}
                    </span>
                  </div>
                  <p className="mt-1 text-xs sm:text-[13px] text-[#344054]">
                    {mentor.availability}
                  </p>
                </div>
                <Link
                  href="/signup?role=mentee"
                  className="inline-flex h-10 items-center justify-center rounded-full bg-[#FF5514] px-5 text-xs sm:text-sm font-semibold !text-white shadow-xs transition-all hover:bg-[#E84D12] active:scale-[0.98]"
                >
                  Book Session
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
