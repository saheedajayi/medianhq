import Link from "next/link";
import { Briefcase } from "iconsax-react";

export function NoOpenings() {
  return (
    <section className="flex flex-col items-center px-4 py-20 text-center sm:py-24">
      <span className="flex size-[120px] items-center justify-center rounded-full bg-[#FFF8F3]">
        <Briefcase size="72" variant="Outline" color="#667085" />
      </span>
      <h2 className="mt-10 text-3xl font-semibold text-[#101828] sm:text-[36px]">No Jobs Available!</h2>
      <p className="mt-4 max-w-lg text-sm leading-relaxed text-[#344054] sm:text-base">
        Unfortunately, we do not have any job openings at the moment, you can always check back at another time
      </p>
      <Link
        href="/"
        className="mt-10 inline-flex h-12 w-full max-w-[354px] items-center justify-center rounded-full bg-[#FF5514] text-sm font-semibold !text-white transition-colors hover:bg-[#E84D12]"
      >
        Back to homepage
      </Link>
    </section>
  );
}
