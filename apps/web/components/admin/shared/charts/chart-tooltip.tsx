interface ChartTooltipProps {
  title: string;
  rows: { label: string; color: string; value: string }[];
  /** Distance of the hovered point from the left edge of the chart */
  x: number;
  chartWidth: number;
}

/** The hover card for a chart, flipped to the left of the pointer in the right half */
export function ChartTooltip({ title, rows, x, chartWidth }: ChartTooltipProps) {
  const isRightHalf = x > chartWidth / 2;

  return (
    <div
      className="pointer-events-none absolute top-2 z-10 min-w-40 rounded-xl border border-[#EAECF0] bg-white px-3 py-2.5 text-xs shadow-lg"
      style={isRightHalf ? { right: chartWidth - x + 12 } : { left: x + 12 }}
    >
      <p className="mb-1.5 font-medium text-[#667085]">{title}</p>
      {rows.map((row) => (
        <p key={row.label} className="flex items-center gap-2 py-0.5 text-[#475467]">
          <span className="size-2 rounded-full" style={{ backgroundColor: row.color }} />
          {row.label}
          <span className="ml-auto pl-3 font-semibold text-[#101828]">{row.value}</span>
        </p>
      ))}
    </div>
  );
}
