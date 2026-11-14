interface SparklineProps {
  values: number[];
  color: string;
  /** Read to screen readers in place of the drawing */
  label: string;
}

const WIDTH = 72;
const HEIGHT = 24;
const INSET = 3;

/** A small line with no axes, to show a row's direction of travel */
export function Sparkline({ values, color, label }: SparklineProps) {
  const max = Math.max(...values, 1);
  const x = (index: number) => INSET + (index / Math.max(values.length - 1, 1)) * (WIDTH - INSET * 2);
  const y = (value: number) => HEIGHT - INSET - (value / max) * (HEIGHT - INSET * 2);
  const last = values.length - 1;

  return (
    <svg width={WIDTH} height={HEIGHT} role="img" aria-label={label}>
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinejoin="round"
        points={values.map((value, index) => `${x(index)},${y(value)}`).join(" ")}
      />
      {last >= 0 && <circle cx={x(last)} cy={y(values[last] ?? 0)} r="2.5" fill={color} />}
    </svg>
  );
}
