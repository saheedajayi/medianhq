import { MedianMark } from "./median-mark";

interface LandingPageHeroProps {
  title: string;
}

/** The maroon title band at the top of the Contact Us and Careers pages */
export function LandingPageHero({ title }: LandingPageHeroProps) {
  return (
    <section className="relative w-full overflow-hidden bg-[#4E0703] px-4 py-20 text-center sm:py-24 md:py-28">
      <MedianMark className="pointer-events-none absolute left-1/2 top-1/2 h-[118%] -translate-x-1/2 -translate-y-1/2 text-[#590A05] blur-[1.5px]" />
      <h1 className="relative font-neco text-4xl font-semibold italic leading-tight text-[#FFD9A8] sm:text-5xl md:text-[56px]">
        {title}
      </h1>
    </section>
  );
}
