"use client";

import { useState } from "react";
import { ChartTooltip } from "./chart-tooltip";
import { axisMax, axisTicks, formatAxisValue, useElementWidth } from "./chart-utils";
import { ChartTable, type ChartPoint, type ChartSeries } from "./line-chart";

const PAD = { top: 16, right: 8, bottom: 40, left: 64 };
// How much of each slot the bar fills; the rest is the gap between bars
const BAR_FILL = 0.65;
const BAR_RADIUS = 4;

interface BarChartProps {
  /** One series: a bar per point */
  series: ChartSeries;
  points: ChartPoint[];
  /** Read to screen readers in place of the drawing */
  label: string;
  height?: number;
}

export function BarChart({ series, points, label, height = 320 }: BarChartProps) {
  const { ref, width } = useElementWidth<HTMLDivElement>();
  const [hovered, setHovered] = useState<number | null>(null);

  const plotWidth = Math.max(width - PAD.left - PAD.right, 0);
  const plotHeight = height - PAD.top - PAD.bottom;
  const baseline = PAD.top + plotHeight;
  const max = axisMax(Math.max(...points.map((point) => point.values[0] ?? 0), 0));
  const slot = points.length ? plotWidth / points.length : 0;
  const barWidth = slot * BAR_FILL;
  const center = (index: number) => PAD.left + slot * (index + 0.5);
  const hoveredPoint = hovered === null ? undefined : points[hovered];

  return (
    <div ref={ref} className="relative">
      {width > 0 ? (
        <svg width={width} height={height} role="img" aria-label={label} className="block">
          {axisTicks(max).map((tick) => {
            const y = baseline - (tick / max) * plotHeight;
            return (
              <g key={tick}>
                <line x1={PAD.left} x2={width - PAD.right} y1={y} y2={y} stroke="#F2F4F7" />
                <text x={PAD.left - 16} y={y} dy="0.32em" textAnchor="end" fontSize="16" fill="#667085">
                  {formatAxisValue(tick)}
                </text>
              </g>
            );
          })}
          <line x1={PAD.left} x2={PAD.left} y1={PAD.top} y2={baseline} stroke="#667085" />
          <line x1={PAD.left} x2={width - PAD.right} y1={baseline} y2={baseline} stroke="#D0D5DD" />

          {points.map((point, index) => {
            const barHeight = ((point.values[0] ?? 0) / max) * plotHeight;
            return (
              <g key={`${point.label}-${index}`}>
                {/* Rounded at the top only, so the bar sits flat on the baseline */}
                <path
                  d={`M${center(index) - barWidth / 2},${baseline} v${-Math.max(barHeight - BAR_RADIUS, 0)} q0,${-BAR_RADIUS} ${BAR_RADIUS},${-BAR_RADIUS} h${barWidth - BAR_RADIUS * 2} q${BAR_RADIUS},0 ${BAR_RADIUS},${BAR_RADIUS} v${Math.max(barHeight - BAR_RADIUS, 0)} z`}
                  fill={series.color}
                  opacity={barHeight === 0 ? 0 : hovered === null || hovered === index ? 1 : 0.6}
                />
                <text x={center(index)} y={height - 12} textAnchor="middle" fontSize="16" fill="#667085">
                  {point.label}
                </text>
                {/* The whole column is the hover target, so short bars are still easy to hit */}
                <rect
                  x={PAD.left + slot * index}
                  y={PAD.top}
                  width={slot}
                  height={plotHeight}
                  fill="transparent"
                  onPointerEnter={() => setHovered(index)}
                  onPointerLeave={() => setHovered(null)}
                />
              </g>
            );
          })}
        </svg>
      ) : (
        <div style={{ height }} />
      )}

      {hoveredPoint && hovered !== null && (
        <ChartTooltip
          title={hoveredPoint.title ?? hoveredPoint.label}
          rows={[
            { label: series.label, color: series.color, value: (hoveredPoint.values[0] ?? 0).toLocaleString("en-NG") },
          ]}
          x={center(hovered)}
          chartWidth={width}
        />
      )}

      <ChartTable series={[series]} points={points} caption={label} />
    </div>
  );
}
