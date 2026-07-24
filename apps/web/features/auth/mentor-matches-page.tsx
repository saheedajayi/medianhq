"use client";

import { Button } from "@/components/ui/base/button";
import { ArrowRight, Check } from "lucide-react";
import Link from "next/link";

const mentors = [
  {
    id: 1,
    name: "Tomi Koyejo",
    role: "VP Product @ Kuda",
    sessions: "2 sessions",
    match: "90%",
    image: "https://i.pravatar.cc/150?u=a042581f4e29026024d",
  },
  {
    id: 2,
    name: "Tomi Koyejo",
    role: "VP Product @ Kuda",
    sessions: "10 sessions",
    match: "80%",
    image: "https://i.pravatar.cc/150?u=a042581f4e29026024d",
  },
  {
    id: 3,
    name: "Tomi Koyejo",
    role: "VP Product @ Kuda",
    sessions: "4 sessions",
    match: "70%",
    image: "https://i.pravatar.cc/150?u=a042581f4e29026024d",
  },
];

export function MentorMatchesPage() {
  return (
    <>
      <header className="mb-8 text-center">
        <h1 className="text-[28px] font-bold tracking-[-0.02em] text-[#4b100d]">
          Top mentor matches for you
        </h1>
        <p className="mt-2 text-lg text-[#344054]">Based on your goals</p>
      </header>

      <div className="grid gap-4">
        {mentors.map((mentor) => (
          <div
            key={mentor.id}
            className="flex items-center justify-between rounded-2xl border border-[#f1f5f9] bg-white p-4 shadow-[0px_2px_4px_rgba(0,0,0,0.02)] transition-shadow hover:shadow-sm"
          >
            <div className="flex items-center gap-4">
              <div className="relative">
                <img
                  src={mentor.image}
                  alt={mentor.name}
                  className="size-14 rounded-full object-cover"
                />
                <svg
                  className="absolute -bottom-1.5 -right-1.5 size-7 drop-shadow-sm"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z"
                    className="fill-primary"
                  />
                  <path
                    d="m9 12 2 2 4-4"
                    stroke="white"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-base font-semibold text-[#111827]">
                  {mentor.name}
                </h3>
                <p className="mt-0.5 text-[15px] text-[#64748b]">
                  {mentor.role}
                </p>
                <p className="mt-1 text-[15px] text-[#64748b]">
                  {mentor.sessions}
                </p>
              </div>
            </div>

            <div className="flex h-8 items-center justify-center rounded-full bg-[#e6f4ea] px-3">
              <span className="text-[13px] font-medium text-[#14532d]">
                {mentor.match} Match
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8">
        <Button asChild className="h-14 w-full rounded-full text-base font-medium shadow-none">
          <Link href="/dashboard">
            Go to Dashboard
            <ArrowRight className="ml-2 size-5" />
          </Link>
        </Button>
      </div>
    </>
  );
}
