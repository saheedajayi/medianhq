import Link from "next/link";
import Image from "next/image";

type EmptyStateProps = {
  eyebrow: string;
  title: string;
  description: string;
};

export function EmptyState({ eyebrow, title, description }: EmptyStateProps) {
  return (
    <main className="grid min-h-svh items-center bg-background p-8 text-foreground">
      <Link className="absolute left-[5vw] top-8 z-10 block text-xl font-extrabold" href="/">
       <Image
          src="/median-logo.svg"
          alt="Median"
          width={155}
          height={45}
          priority
          unoptimized
          className="h-auto w-[190px] xl:w-[224px]"
        />
      </Link>
      <section className="mx-auto w-full max-w-[680px] rounded-lg border border-border bg-card p-8">
        <span className="mb-4 inline-block text-xs font-extrabold uppercase text-primary">
          {eyebrow}
        </span>
        <h1 className="mb-4 text-[clamp(2.25rem,5vw,4.5rem)] leading-none">
          {title}
        </h1>
        <p className="m-0 text-[1.05rem] leading-relaxed text-muted-foreground">
          {description}
        </p>
      </section>
    </main>
  );
}
