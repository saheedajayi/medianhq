"use client";

import Image from "next/image";

export function LandingFounderNote() {
  return (
    <section
      className="w-full overflow-hidden"
      style={{ background: "#F7F8FB" }}
    >
      {/* Accessible text for SEO & screen readers */}
      <div className="sr-only">
        <h2>A note from the founder</h2>
        <p>
          Early in my career, finding someone to guide me felt almost
          impossible. I spent months scouring LinkedIn, writing cold emails into
          the void, waiting weeks, sometimes months, for a reply that often
          never came. It was exhausting, and honestly, discouraging.
        </p>
        <p>
          But eventually, things changed. As I grew in my career, I made a
          decision: I would try to give others what I never had. I started
          showing up for people; offering clarity, direction, a listening ear.
          And I quickly realised I wasn&apos;t alone in that instinct. There were
          so many experienced professionals who genuinely wanted to help, but
          had no structured way to do it.
        </p>
        <p>
          That&apos;s why I built Median. Not just a platform, but an
          intersection. A place where ambition meets guidance, where experience
          meets opportunity, and where mentorship becomes something real,
          structured, and accessible to everyone who needs it.
        </p>
        <p>Abdullah Mumuni - Founder, Median</p>
        <a
          href="https://www.linkedin.com/company/median-hq/"
          target="_blank"
          rel="noreferrer"
        >
          Median LinkedIn
        </a>
      </div>

      {/* ── Desktop & Tablet View (hidden on small mobile) ── */}
      <div className="relative mx-auto hidden w-full max-w-[1240px] px-4 py-8 sm:block sm:py-12 lg:py-16">
        <div className="relative mx-auto w-full">
          <Image
            src="/landing-page/founder-note-desktop.svg"
            alt="A note from the founder - Abdullah Mumuni, Founder of Median"
            width={1512}
            height={1103}
            className="h-auto w-full"
            priority={false}
          />
          {/* Interactive clickable overlay over LinkedIn icon */}
          <a
            href="https://www.linkedin.com/company/median-hq/"
            target="_blank"
            rel="noreferrer"
            aria-label="Visit Median on LinkedIn"
            title="Visit Median on LinkedIn"
            className="absolute rounded-full transition-all duration-150 hover:ring-2 hover:ring-primary/40 focus:outline-none focus:ring-2 focus:ring-primary"
            style={{
              left: "27.5%",
              top: "71.7%",
              width: "2.5%",
              height: "3.2%",
            }}
          />
        </div>
      </div>

      {/* ── Mobile View (shown only on small mobile) ── */}
      <div className="mx-auto block w-full max-w-[420px] px-4 py-8 sm:hidden">
        <div className="relative mx-auto w-full">
          <Image
            src="/landing-page/founder-note-mobile.svg"
            alt="A note from the founder - Abdullah Mumuni, Founder of Median"
            width={370}
            height={734}
            className="h-auto w-full drop-shadow-sm"
            priority={false}
          />
          {/* Interactive clickable overlay over LinkedIn icon */}
          <a
            href="https://www.linkedin.com/company/median-hq/"
            target="_blank"
            rel="noreferrer"
            aria-label="Visit Median on LinkedIn"
            title="Visit Median on LinkedIn"
            className="absolute rounded-full transition-all duration-150 hover:ring-2 hover:ring-primary/40 focus:outline-none focus:ring-2 focus:ring-primary"
            style={{
              left: "22.8%",
              top: "72.5%",
              width: "7%",
              height: "3.5%",
            }}
          />
        </div>
      </div>
    </section>
  );
}



/*
 * ── OLD IMPLEMENTATION (commented out) ──────────────────────────────────
 *
 * "use client";
 *
 * export function LandingFounderNote() {
 *   return (
 *     <section
 *       className="w-full px-5 py-16 sm:px-8"
 *       style={{ width: "100%", maxWidth: "840px", marginInline: "auto" }}
 *     >
 *       <h2 className="text-center font-serif text-4xl font-black text-primary">
 *         A note from the founder
 *       </h2>
 *       <div className="relative mt-10 text-base leading-7 font-medium text-text-900 md:text-lg">
 *         <div className="pointer-events-none absolute flex -translate-x-7 translate-y-12 select-none gap-0 text-[12rem] text-accent-150">
 *           <span>❛</span>
 *           <span className="-ml-5">❛</span>
 *         </div>
 *         <p className="relative z-10">
 *           Early in my career, finding someone to guide me felt almost
 *           impossible. I spent months scouring LinkedIn, writing cold emails
 *           into the void, waiting weeks, sometimes months, for a reply that
 *           often never came. It was exhausting, and honestly, discouraging.
 *         </p>
 *         <p className="relative z-10 mt-6">
 *           But eventually, things changed. As I grew in my career, I made a
 *           decision: I would try to give others what I never had. I started
 *           showing up for people; offering clarity, direction, a listening ear.
 *           And I quickly realised I wasn&apos;t alone in that instinct. There were
 *           so many experienced professionals who genuinely wanted to help, but
 *           had no structured way to do it.
 *         </p>
 *         <p className="relative z-10 mt-6">
 *           That&apos;s why I built Median. Not just a platform, but an intersection.
 *           A place where ambition meets guidance, where experience meets
 *           opportunity, and where mentorship becomes something real,
 *           structured, and accessible to everyone who needs it.
 *         </p>
 *       </div>
 *       <div className="mt-6 flex items-center gap-3">
 *         <div className="flex size-9 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
 *           AM
 *         </div>
 *         <div>
 *           <p className="text-sm font-bold text-text-900">Abdullah Mumuni</p>
 *           <p className="text-xs text-text-500">Founder, Median</p>
 *         </div>
 *       </div>
 *     </section>
 *   );
 * }
 */
