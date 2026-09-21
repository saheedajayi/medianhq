"use client";

import Image from "next/image";
import { LandingStepCard } from "../shared/step-card";
import { Location, Messages, Clock } from "iconsax-react";
import { Star } from "lucide-react";

interface StepMentorCardProps {
  avatarSrc: string;
  name: string;
  role: string;
  location: string;
  sessions: string;
  rating: string;
  reviewCount: string;
  bio: string;
  tags: string[];
  availabilityDays: string;
  availabilityTime: string;
  isFeatured?: boolean;
}

export function StepMentorCard({
  avatarSrc,
  name,
  role,
  location,
  sessions,
  rating,
  reviewCount,
  bio,
  tags,
  availabilityDays,
  availabilityTime,
  isFeatured = true,
}: StepMentorCardProps) {
  return (
    <div className="relative flex flex-col justify-between overflow-hidden rounded-xl border border-[#EAECF0] bg-white shadow-2xs">
      {/* Featured badge */}
      {isFeatured && (
        <span className="absolute top-1.5 right-1.5 z-10 rounded-full bg-[#EDE6E6] px-1.5 py-0.2 text-[6.5px] font-semibold text-[#4E0703]">
          Featured
        </span>
      )}

      {/* Card Body */}
      <div className="p-1.5 sm:p-2 text-center">
        <div className="mx-auto size-8 sm:size-9 overflow-hidden rounded-full border border-gray-100 shadow-2xs">
          <Image
            src={avatarSrc}
            alt={name}
            width={36}
            height={36}
            className="size-full object-cover"
          />
        </div>
        <h5 className="mt-1 text-[9.5px] sm:text-[10.5px] font-normal text-[#101828]">
          {name}
        </h5>
        <p className="text-[7.5px] sm:text-[8px] text-[#667085] leading-none mt-0.5">
          {role}
        </p>
        <div className="mt-1 flex items-center justify-center gap-1.5 text-[5.5px] sm:text-[6px] text-[#667085]">
          <span className="inline-flex items-center gap-0.5">
            <Location size="9" variant="Linear" color="#667085" className="shrink-0" />
            {location}
          </span>
          <span className="inline-flex items-center gap-0.5">
            <Messages size="9" variant="Linear" color="#667085" className="shrink-0" />
            {sessions}
          </span>
          <span className="inline-flex items-center gap-0.5">
            <Star className="size-2 fill-[#FDB022] text-[#FDB022] shrink-0" />
            {rating} ({reviewCount})
          </span>
        </div>
        <p className="mt-1 text-[5px] sm:text-[5.5px] text-[#475467] leading-tight line-clamp-2 px-0.5">
          {bio}
        </p>
        {/* Tags */}
        <div className="mt-1 flex flex-wrap items-center justify-center gap-0.5">
          {tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-[#F2F4F7] px-1.5 py-0.2 text-[6.5px] text-[#475467]"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Card Footer */}
      <div className="border-t border-[#F2F4F7] bg-[#FAFAFA] px-1.5 sm:px-2 py-1 sm:py-1.5 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-0.5">
            <span className="text-[6px] sm:text-[6.5px] font-bold text-[#FF5514]">
              Next availability
            </span>
            <span className="rounded-full bg-[#FFECE5] px-1 py-0.2 text-[5px] sm:text-[5.5px] font-medium text-[#FF5514]">
              {availabilityDays}
            </span>
          </div>
          <p className="text-[6px] sm:text-[6.5px] text-[#667085] mt-0.5">
            {availabilityTime}
          </p>
        </div>
        <button
          type="button"
          className="rounded-full bg-[#FF5514] px-2 py-0.5 text-[7px] sm:text-[7.5px] font-semibold text-white shadow-2xs hover:bg-[#e84d12]"
        >
          View Profile
        </button>
      </div>
    </div>
  );
}

const achievementGoalRows = [
  [
    { label: "Career switch", active: false },
    { label: "Leadership", active: true },
    { label: "Portfolio review", active: true },
    { label: "Interview prep", active: false },
  ],
  [
    { label: "Job search", active: false },
    { label: "Skills growth", active: true },
    { label: "Fundraising", active: false },
    { label: "Others", active: false },
  ],
];

const sessionOptions = [
  {
    title: "Get to Know You",
    price: "Free",
    duration: "15 mins",
    description: "A quick intro chat to see if we're a good fit before booking longer strategy sessions.",
    active: true,
  },
  {
    title: "CV Review",
    price: "₦20,000",
    duration: "60 mins",
    description: "Deep dive into your CV with actionable feedback, layout improvements and positioning tips.",
    active: false,
  },
];

export function LandingSteps() {
  return (
    <section className="relative overflow-hidden bg-white py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-[#FF5514] sm:text-4xl lg:text-5xl">
            From sign-up to breakthrough in four steps
          </h2>
          <p className="mt-4 text-base text-[#475467] sm:text-lg">
            Median removes the friction. You tell us where you want to go - we connect you with someone who is already been there.
          </p>
        </div>

        {/* 4 Steps Grid (2x2) */}
        <div className="mt-14 sm:mt-18 grid grid-cols-1 gap-10 md:grid-cols-2 lg:gap-12">
          {/* Step 1: Share your goal */}
          <LandingStepCard title="Share your goal" description="Turn your ambitions into clear goals and find the right mentor to help you move forward.">
            {/* Visual Stage with spacious #FDF9F6 background */}
            <div className="flex h-[330px] sm:h-[350px] w-full items-center justify-center rounded-xl sm:rounded-2xl bg-[#FDF9F6] p-4 sm:p-6">
              <div className="w-full max-w-[340px] sm:max-w-[360px] rounded-2xl bg-white p-4 sm:p-5 shadow-[0_4px_24px_rgba(0,0,0,0.03)] border border-black/[0.04]">
                <h4 className="text-center text-xs sm:text-sm font-bold text-[#4E0703]">
                  What do you want to achieve?
                </h4>
                <div className="mt-3 space-y-1.5">
                  {achievementGoalRows.map((row, rowIndex) => (
                    <div key={rowIndex} className="flex items-center justify-center gap-1 sm:gap-1.5">
                      {row.map((item) => (
                        <span
                          key={item.label}
                          className={`whitespace-nowrap rounded-full px-2 py-0.5 text-[8px] sm:text-[9px] ${
                            item.active
                              ? "bg-[#4E0703] font-medium text-white"
                              : "border border-[#D0D5DD] bg-white text-[#344054]"
                          }`}
                        >
                          {item.label}
                        </span>
                      ))}
                    </div>
                  ))}
                </div>
                <div className="mt-3 sm:mt-3.5">
                  <label className="block text-[8.5px] sm:text-[9.5px] font-medium text-[#344054]">
                    Describe your goal in one sentence
                  </label>
                  <div className="mt-1 rounded-lg border border-[#D0D5DD] bg-white px-2.5 py-1.5 text-[8.5px] sm:text-[9.5px] text-[#98A2B3]">
                    e.g Create a new portfolio as a step to landing a new role
                  </div>
                </div>
              </div>
            </div>

          </LandingStepCard>

          {/* Step 2: Browse vetted mentors */}
          <LandingStepCard title="Browse vetted mentors" description="Explore our curated directory of experienced professionals across Tech, Finance, Consulting and Business.">
            {/* Visual Stage with spacious #FDF9F6 background */}
            <div className="flex h-[330px] sm:h-[350px] w-full flex-col items-center justify-center rounded-xl sm:rounded-2xl bg-[#FDF9F6] p-3 sm:p-5">
              {/* Clean Floating Category Tabs Bar */}
              <div className="mb-2.5 inline-flex items-center gap-4 sm:gap-5 rounded-full bg-white p-1.5 pl-1.5 pr-5 shadow-[0_2px_10px_rgba(0,0,0,0.03)] border border-black/[0.03]">
                <span className="rounded-full bg-[#F4F5F7] px-4 py-1.5 text-xs font-semibold text-[#FF5514]">
                  All
                </span>
                <span className="cursor-pointer text-xs font-semibold text-[#525866] hover:text-[#101828] transition-colors">
                  Tech
                </span>
                <span className="cursor-pointer text-xs font-semibold text-[#525866] hover:text-[#101828] transition-colors">
                  Finance
                </span>
                <span className="cursor-pointer text-xs font-semibold text-[#525866] hover:text-[#101828] transition-colors">
                  Business
                </span>
                <span className="cursor-pointer text-xs font-semibold text-[#525866] hover:text-[#101828] transition-colors">
                  Consulting
                </span>
              </div>

              {/* Outer White Container enclosing both mentor cards */}
              <div className="w-full max-w-[340px] sm:max-w-[365px] rounded-2xl bg-white p-2 sm:p-2.5 shadow-[0_4px_24px_rgba(0,0,0,0.03)] border border-black/[0.04]">
                <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
                  <StepMentorCard
                    avatarSrc="/landing-page/mentor-male.png"
                    name="Abdulrahman Hassan"
                    role="Senior Designer @ Andela"
                    location="London"
                    sessions="40 Session"
                    rating="4.5"
                    reviewCount="20 Reviews"
                    bio="You chose to improve people's well-being. You stepped out of your comfort zone..."
                    tags={["Product Strategy", "Fintech", "Healthtech"]}
                    availabilityDays="in 3 days"
                    availabilityTime="Wed, 12 August 11:30 AM"
                  />
                  <StepMentorCard
                    avatarSrc="/landing-page/mentor-female.png"
                    name="Abdulrahman Hassan"
                    role="Senior Designer @ Andela"
                    location="London"
                    sessions="40 Session"
                    rating="4.5"
                    reviewCount="20 Reviews"
                    bio="You chose to improve people's well-being. You stepped out of your comfort zone..."
                    tags={["Product Strategy", "Fintech", "Healthtech"]}
                    availabilityDays="in 3 days"
                    availabilityTime="Wed, 12 August 11:30 AM"
                  />
                </div>
              </div>
            </div>

          </LandingStepCard>

          {/* Step 3: Connect with a mentor */}
          <LandingStepCard title="Connect with a mentor" description="Choose how you want to connect — 1-on-1 sessions or group calls, based on availability, price, or expertise.">
            {/* Visual Stage with spacious #FDF9F6 background */}
            <div className="flex h-[330px] sm:h-[350px] w-full items-center justify-center rounded-xl sm:rounded-2xl bg-[#FDF9F6] p-4 sm:p-6">
              <div className="w-full max-w-[280px] sm:max-w-[300px] rounded-2xl bg-white p-3.5 sm:p-4 shadow-[0_4px_24px_rgba(0,0,0,0.03)] border border-black/[0.04] space-y-2">
                {sessionOptions.map((option) => (
                  <div
                    key={option.title}
                    className={`rounded-xl p-2.5 transition-all ${
                      option.active
                        ? "border border-[#FFCAB6] bg-[#FDF9F6]"
                        : "border border-[#EAECF0] bg-white hover:border-[#FFCAB6]/50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] sm:text-[11px] font-semibold text-[#101828]">
                        {option.title}
                      </span>
                      <span className="text-[9px] sm:text-[10px] font-semibold text-[#FF5514]">
                        {option.price}
                      </span>
                    </div>
                    <div className="mt-0.5 flex items-center gap-1 text-[8px] sm:text-[9px] text-[#667085]">
                      <Clock size="12" variant="Outline" color="#667085" className="shrink-0" />
                      <span>{option.duration}</span>
                    </div>
                    <p className="mt-1 text-[9px] sm:text-[9.5px] text-[#475467] leading-tight">
                      {option.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

          </LandingStepCard>

          {/* Step 4: Grow with structure */}
          <LandingStepCard title="Grow with structure" description="Leave every session with a clear action plan. Track your milestone and stay accountable between calls.">
            {/* Visual Stage with spacious #FDF9F6 background */}
            <div className="flex h-[330px] sm:h-[350px] w-full flex-col items-center justify-center rounded-xl sm:rounded-2xl bg-[#FDF9F6] p-4 sm:p-6">
              <div className="w-full max-w-[280px] sm:max-w-[300px] flex flex-col items-center">
                <p className="text-[8.5px] sm:text-[9px] font-semibold tracking-wider text-[#FF5514] mb-2 sm:mb-2.5">
                  YOUR 90-DAY GOAL PROGRESS
                </p>
                <div className="w-full rounded-2xl border border-black/[0.04] bg-white p-3.5 shadow-[0_4px_24px_rgba(0,0,0,0.03)]">
                  <div className="flex items-center gap-2.5 sm:gap-3">
                    {/* Layered Goal Badge: #FFD9A8 outer, #FF5514 middle, #FF7743 inner circle */}
                    <div className="flex size-8 sm:size-9 shrink-0 items-center justify-center rounded-xl bg-[#FFD9A8] p-1 sm:p-1.5">
                      <div className="flex size-full items-center justify-center rounded-lg bg-[#FF5514]">
                        <div className="size-3.5 sm:size-4 rounded-full bg-[#FF7743]" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] sm:text-[11px] font-medium text-[#101828]">Land a pm Role</span>
                        <span className="text-[10px] sm:text-[11px] font-medium text-[#FF5514]">45%</span>
                      </div>
                      {/* Progress Bar */}
                      <div className="mt-1.5 sm:mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[#F2F4F7]">
                        <div className="h-full w-[45%] rounded-full bg-[#FF5514]" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </LandingStepCard>
        </div>
      </div>
    </section>
  );
}
