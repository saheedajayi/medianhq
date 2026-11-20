interface AddPayoutAccountBannerProps {
  onAdd: () => void;
}

/** Shown until the mentor has somewhere for their earnings to go */
export function AddPayoutAccountBanner({ onAdd }: AddPayoutAccountBannerProps) {
  return (
    <section className="flex flex-col gap-4 rounded-3xl border border-[#FFDDB8] bg-[#FFFAF5] p-6 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 className="text-lg font-medium text-[#101828]">Add payout account details</h2>
        <p className="mt-2.5 text-sm text-[#475467]">
          You haven&apos;t added a payout account details yet. Add one to start receiving earnings.
        </p>
      </div>
      <button
        type="button"
        onClick={onAdd}
        className="h-9 shrink-0 self-start rounded-full bg-[#FF5514] px-3.5 text-sm font-medium text-white transition-colors hover:bg-[#E84D12] sm:self-center"
      >
        Add payout account
      </button>
    </section>
  );
}
