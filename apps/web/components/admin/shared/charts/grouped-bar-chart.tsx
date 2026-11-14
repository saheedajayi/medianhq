"use client";

import { axisMax, axisTicks, formatAxisValue, useElementWidth } from "./chart-utils";
import { ChartTable, type ChartPoint, type ChartSeries } from "./line-chart";

const PAD = { top: 28, right: 8, bottom: 40, left: 56 };
// How much of each group's slot its bars fill; the rest separates the groups
const GROUP_FILL = 0.75;
const BAR_GAP = 2;
const BAR_RADIUS = 4;

interface GroupedBarChartProps {
  series: ChartSeries[];
  /** One group per point, with a value for each series */
  points: ChartPoint[];
  /** Read to screen readers in place of the drawing */
  label: string;
  height?: number;
  /** Writes each bar's value above it, for a chart with few bars */
  showValues?: boolean;
}

/** Bars side by side within each group, for comparing a few measures across categories */
export function GroupedBarChart({ series, points, label, height = 300, showValues = false }: GroupedBarChartProps) {
  const { ref, width } = useElementWidth<HTMLDivElement>();

  const plotWidth = Math.max(width - PAD.left - PAD.right, 0);
  const plotHeight = height - PAD.top - PAD.bottom;
  const baseline = PAD.top + plotHeight;
  const max = axisMax(Math.max(...points.flatMap((point) => point.values), 0));
  const slot = points.length ? plotWidth / points.length : 0;
  const barWidth = Math.max((slot * GROUP_FILL) / series.length - BAR_GAP, 0);

  return (
    <div ref={ref}>
      {width > 0 ? (
        <svg width={width} height={height} role="img" aria-label={label} className="block">
          {axisTicks(max).map((tick) => {
            const y = baseline - (tick / max) * plotHeight;
            return (
              <g key={tick}>
                <line x1={PAD.left} x2={width - PAD.right} y1={y} y2={y} stroke="#F2F4F7" />
                <text x={PAD.left - 14} y={y} dy="0.32em" textAnchor="end" fontSize="14" fill="#667085">
                  {formatAxisValue(tick)}
                </text>
              </g>
            );
          })}
          <line x1={PAD.left} x2={PAD.left} y1={PAD.top} y2={baseline} stroke="#667085" />
          <line x1={PAD.left} x2={width - PAD.right} y1={baseline} y2={baseline} stroke="#D0D5DD" />

          {points.map((point, groupIndex) => {
            const groupStart = PAD.left + slot * groupIndex + (slot * (1 - GROUP_FILL)) / 2;
            return (
              <g key={`${point.label}-${groupIndex}`}>
                {point.values.map((value, seriesIndex) => {
                  const barHeight = (value / max) * plotHeight;
                  const x = groupStart + seriesIndex * (barWidth + BAR_GAP);
                  return (
                    <g key={seriesIndex}>
                      {barHeight > 0 && (
                        <path
                          d={`M${x},${baseline} v${-Math.max(barHeight - BAR_RADIUS, 0)} q0,${-BAR_RADIUS} ${BAR_RADIUS},${-BAR_RADIUS} h${barWidth - BAR_RADIUS * 2} q${BAR_RADIUS},0 ${BAR_RADIUS},${BAR_RADIUS} v${Math.max(barHeight - BAR_RADIUS, 0)} z`}
                          fill={series[seriesIndex]?.color}
                        >
                          <title>
                            {point.label} · {series[seriesIndex]?.label}: {value.toLocaleString("en-NG")}
                          </title>
                        </path>
                      )}
                      {showValues && (
                        <text
                          x={x + barWidth / 2}
                          y={baseline - barHeight - 8}
                          textAnchor="middle"
                          fontSize="13"
                          fill="#101828"
                        >
                          {formatAxisValue(value)}
                        </text>
                      )}
                    </g>
                  );
                })}
                <text x={PAD.left + slot * (groupIndex + 0.5)} y={height - 12} textAnchor="middle" fontSize="15" fill="#101828">
                  {point.label}
                </text>
              </g>
            );
          })}
        </svg>
      ) : (
        <div style={{ height }} />
      )}
      <ChartTable series={series} points={points} caption={label} />
    </div>
  );
}
