"use client";

import { useState } from "react";
import { ChartTooltip } from "./chart-tooltip";
import { axisMax, axisTicks, formatAxisValue, useElementWidth } from "./chart-utils";

export interface ChartSeries {
  label: string;
  color: string;
  /** Drawn as a dashed line, for a secondary measure */
  dashed?: boolean;
}

export interface ChartPoint {
  /** Shown under the axis */
  label: string;
  /** Shown as the tooltip's heading; the axis label when left out */
  title?: string;
  /** One value per series, in the same order */
  values: number[];
}

const PAD = { top: 12, right: 12, bottom: 28, left: 40 };
const MAX_X_LABELS = 7;
const X_LABEL_SPACE = 72;

interface LineChartProps {
  series: ChartSeries[];
  points: ChartPoint[];
  /** Read to screen readers in place of the drawing */
  label: string;
  height?: number;
  /** Marks every point with a dot, for a chart with few points */
  showPoints?: boolean;
}

export function LineChart({ series, points, label, height = 240, showPoints = false }: LineChartProps) {
  const { ref, width } = useElementWidth<HTMLDivElement>();
  const [hovered, setHovered] = useState<number | null>(null);

  const plotWidth = Math.max(width - PAD.left - PAD.right, 0);
  const plotHeight = height - PAD.top - PAD.bottom;
  const max = axisMax(Math.max(...points.flatMap((point) => point.values), 0));
  const x = (index: number) =>
    PAD.left + (points.length > 1 ? (index / (points.length - 1)) * plotWidth : plotWidth / 2);
  const y = (value: number) => PAD.top + plotHeight - (value / max) * plotHeight;
  const labelCount = Math.min(MAX_X_LABELS, Math.max(Math.floor(plotWidth / X_LABEL_SPACE), 2));
  const labelEvery = Math.ceil(points.length / labelCount);
  const hoveredPoint = hovered === null ? undefined : points[hovered];

  const handleMove = (event: React.PointerEvent<SVGSVGElement>) => {
    if (!plotWidth || points.length === 0) return;
    const offset = event.clientX - event.currentTarget.getBoundingClientRect().left - PAD.left;
    const index = Math.round((offset / plotWidth) * (points.length - 1));
    setHovered(Math.min(Math.max(index, 0), points.length - 1));
  };

  return (
    <div ref={ref} className="relative">
      {width > 0 ? (
        <svg
          width={width}
          height={height}
          role="img"
          aria-label={label}
          className="block touch-none"
          onPointerMove={handleMove}
          onPointerLeave={() => setHovered(null)}
        >
          {axisTicks(max).map((tick) => (
            <g key={tick}>
              <line x1={PAD.left} x2={width - PAD.right} y1={y(tick)} y2={y(tick)} stroke="#F2F4F7" />
              <text x={PAD.left - 10} y={y(tick)} dy="0.32em" textAnchor="end" fontSize="11" fill="#98A2B3">
                {formatAxisValue(tick)}
              </text>
            </g>
          ))}

          {points.map((point, index) =>
            // Counted back from the last point, so the latest is always labelled
            (points.length - 1 - index) % labelEvery === 0 ? (
              <text
                key={`${point.label}-${index}`}
                x={x(index)}
                y={height - 8}
                textAnchor={index === 0 ? "start" : index === points.length - 1 ? "end" : "middle"}
                fontSize="11"
                fill="#667085"
              >
                {point.label}
              </text>
            ) : null,
          )}

          {hovered !== null && (
            <line x1={x(hovered)} x2={x(hovered)} y1={PAD.top} y2={PAD.top + plotHeight} stroke="#D0D5DD" />
          )}

          {series.map((line, seriesIndex) => (
            <g key={line.label}>
              <polyline
                fill="none"
                stroke={line.color}
                strokeWidth={showPoints ? 1 : 2}
                strokeLinejoin="round"
                strokeLinecap="round"
                strokeDasharray={line.dashed ? "4 4" : undefined}
                points={points.map((point, index) => `${x(index)},${y(point.values[seriesIndex] ?? 0)}`).join(" ")}
              />
              {showPoints &&
                points.map((point, index) => (
                  <circle
                    key={index}
                    cx={x(index)}
                    cy={y(point.values[seriesIndex] ?? 0)}
                    r="4"
                    fill={line.color}
                    stroke="#FFFFFF"
                    strokeWidth="2"
                  />
                ))}
              {hoveredPoint && hovered !== null && (
                <circle
                  cx={x(hovered)}
                  cy={y(hoveredPoint.values[seriesIndex] ?? 0)}
                  r="4.5"
                  fill={line.color}
                  stroke="#FFFFFF"
                  strokeWidth="2"
                />
              )}
            </g>
          ))}
        </svg>
      ) : (
        <div style={{ height }} />
      )}

      {hoveredPoint && hovered !== null && (
        <ChartTooltip
          title={hoveredPoint.title ?? hoveredPoint.label}
          rows={series.map((line, index) => ({
            label: line.label,
            color: line.color,
            value: (hoveredPoint.values[index] ?? 0).toLocaleString("en-NG"),
          }))}
          x={x(hovered)}
          chartWidth={width}
        />
      )}

      <ChartTable series={series} points={points} caption={label} />
    </div>
  );
}

interface ChartTableProps {
  series: ChartSeries[];
  points: ChartPoint[];
  caption: string;
}

/** The chart's numbers as a table, for screen readers */
export function ChartTable({ series, points, caption }: ChartTableProps) {
  return (
    <table className="sr-only">
      <caption>{caption}</caption>
      <thead>
        <tr>
          <th scope="col">Period</th>
          {series.map((line) => (
            <th key={line.label} scope="col">
              {line.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {points.map((point, index) => (
          <tr key={`${point.label}-${index}`}>
            <th scope="row">{point.title ?? point.label}</th>
            {point.values.map((value, valueIndex) => (
              <td key={valueIndex}>{value}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
