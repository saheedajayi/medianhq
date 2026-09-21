interface LegalHeroProps {
  title: string;
  effectiveDate: string;
}

export function LegalHero({ title, effectiveDate }: LegalHeroProps) {
  return (
    <section className="w-full bg-[#4E0703] px-4 py-16 text-center sm:py-20 md:py-24">
      <div className="mx-auto max-w-4xl">
        <h1 className="font-neco text-4xl italic font-semibold text-[#FFD9A8] sm:text-5xl md:text-[56px] leading-tight">
          {title}
        </h1>
        <p className="mt-4 text-sm font-normal text-white/90 sm:text-base">
          Effective: {effectiveDate}
        </p>
      </div>
    </section>
  );
}
