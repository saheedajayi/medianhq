"use client";

export function LandingFounderNote() {
  return (
    <section
      className="w-full px-5 py-16 sm:px-8"
      style={{ width: "100%", maxWidth: "840px", marginInline: "auto" }}
    >
      <h2 className="text-center font-serif text-4xl font-black text-primary">
        A note from the founder
      </h2>
      <div className="relative mt-10 text-base leading-7 font-medium text-text-900 md:text-lg">
        <div className="pointer-events-none absolute flex -translate-x-7 translate-y-12 select-none gap-0 text-[12rem] text-accent-150">
          <span>❛</span>
          <span className="-ml-5">❛</span>
        </div>
        <p className="relative z-10">
          Early in my career, finding someone to guide me felt almost
          impossible. I spent months scouring LinkedIn, writing cold emails
          into the void, waiting weeks, sometimes months, for a reply that
          often never came. It was exhausting, and honestly, discouraging.
        </p>
        <p className="relative z-10 mt-6">
          But eventually, things changed. As I grew in my career, I made a
          decision: I would try to give others what I never had. I started
          showing up for people; offering clarity, direction, a listening ear.
          And I quickly realised I wasn&apos;t alone in that instinct. There were
          so many experienced professionals who genuinely wanted to help, but
          had no structured way to do it.
        </p>
        <p className="relative z-10 mt-6">
          That&apos;s why I built Median. Not just a platform, but an intersection.
          A place where ambition meets guidance, where experience meets
          opportunity, and where mentorship becomes something real,
          structured, and accessible to everyone who needs it.
        </p>
      </div>
      <div className="mt-6 flex items-center gap-3">
        <div className="flex size-9 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
          AM
        </div>
        <div>
          <p className="text-sm font-bold text-text-900">Abdullah Mumuni</p>
          <p className="text-xs text-text-500">Founder, Median</p>
        </div>
      </div>
    </section>
  );
}
