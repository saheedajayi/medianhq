import Link from "next/link";

type EmptyStateProps = {
  eyebrow: string;
  title: string;
  description: string;
};

export function EmptyState({ eyebrow, title, description }: EmptyStateProps) {
  return (
    <main className="grid min-h-svh items-center bg-background p-8 text-foreground">
      <Link className="absolute left-[5vw] top-8 text-xl font-extrabold" href="/">
        Median
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
