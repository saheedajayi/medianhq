export function LandingBenefitCard({
  title,
  description,
  color,
  className = "",
}: {
  title: string;
  description: string;
  color: string;
  className?: string;
}) {
  return (
    <article className={`${color} ${className} relative z-20 flex min-h-40 flex-col justify-center rounded-2xl p-6 shadow-sm lg:h-[178px] lg:w-[372px] lg:p-7`}>
      <h3 className="text-xl font-bold text-[#101828]">{title}</h3>
      <p className="mt-2.5 text-sm leading-relaxed text-[#475467]">{description}</p>
    </article>
  );
}
