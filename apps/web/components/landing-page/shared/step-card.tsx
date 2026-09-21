import type { ReactNode } from "react";

export function LandingStepCard({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <article className="flex flex-col">
      {children}
      <div className="mt-4 sm:mt-5">
        <h3 className="text-lg font-medium text-[#101828] sm:text-xl">{title}</h3>
        <p className="mt-1.5 text-xs leading-relaxed text-[#475467] sm:text-sm">
          {description}
        </p>
      </div>
    </article>
  );
}
