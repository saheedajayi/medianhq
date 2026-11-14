interface DonutSlice {
  label: string;
  value: number;
  color: string;
}

interface DonutChartProps {
  slices: DonutSlice[];
  /** Read to screen readers in place of the drawing */
  label: string;
  size?: number;
  /** How thick the ring is; thinner for a gauge with a figure in the middle */
  thickness?: number;
}

const DEFAULT_THICKNESS = 28;
// A sliver of the surface between slices, so neighbours never touch
const GAP = 3;

/** A ring split by share. With nothing to show it is drawn as an empty grey ring. */
export function DonutChart({ slices, label, size = 180, thickness = DEFAULT_THICKNESS }: DonutChartProps) {
  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;
  const total = slices.reduce((sum, slice) => sum + slice.value, 0);
  let offset = 0;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={label} className="shrink-0">
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#F2F4F7" strokeWidth={thickness} />
      {total > 0 &&
        slices.map((slice) => {
          const length = (slice.value / total) * circumference;
          const dash = Math.max(length - GAP, 0);
          const start = offset;
          offset += length;
          return (
            <circle
              key={slice.label}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={slice.color}
              strokeWidth={thickness}
              strokeDasharray={`${dash} ${circumference - dash}`}
              strokeDashoffset={-start}
              // Start at twelve o'clock
              transform={`rotate(-90 ${size / 2} ${size / 2})`}
            >
              <title>
                {slice.label}: {slice.value.toLocaleString("en-NG")}
              </title>
            </circle>
          );
        })}
    </svg>
  );
}
