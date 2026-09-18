"use client";

export function PricingHero() {
  return (
    <section
      className="relative w-full overflow-hidden py-24 sm:py-32 text-center"
      style={{
        background: "linear-gradient(180deg, #FFDFD4 0%, #FFECE5 100%)",
      }}
    >
      <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <h1 className="font-playfair text-4xl font-black tracking-tight text-[#101828] sm:text-6xl lg:text-7xl leading-[1.12]">
          Pay less.{" "}
          <span className="italic text-[#FF5514]">
            Earn more.
          </span>
          <br />
          <span className="italic text-[#101828]">
            Keep what&apos;s yours
          </span>
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-base text-[#344054] sm:text-lg leading-relaxed font-normal">
          No hidden charges. No complex structures. Just fair pricing — for
          mentees growing their careers and mentors growing their impact.
        </p>
      </div>
    </section>
  );
}
