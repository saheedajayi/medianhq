type EmptyStateProps = {
  title: string;
  eyebrow?: string;
  description?: string;
};

export function EmptyState({ title }: EmptyStateProps) {
  return (
    <div className="flex min-h-[calc(100vh-12rem)] items-center justify-center">
      <h1 className="text-2xl font-semibold text-[#101828] sm:text-3xl">
        {title}
      </h1>
    </div>
  );
}
