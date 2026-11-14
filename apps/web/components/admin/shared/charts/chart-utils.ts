"use client";

import { useEffect, useRef, useState } from "react";

/** A round axis maximum with four even steps, at least 4 so an empty chart still has a scale */
export function axisMax(highest: number) {
  const rough = Math.max(highest, 4) / 4;
  const magnitude = 10 ** Math.floor(Math.log10(rough));
  const step = [1, 1.5, 2, 2.5, 3, 4, 5, 7.5, 10].map((m) => m * magnitude).find((s) => s >= rough) ?? rough;
  return Math.ceil(step) * 4;
}

/** The five evenly spaced values an axis is labelled with */
export const axisTicks = (max: number) => [0, 1, 2, 3, 4].map((step) => (max / 4) * step);

/** "600k" for an axis label, so large amounts stay short */
export const formatAxisValue = (value: number) =>
  value >= 1_000_000
    ? `${+(value / 1_000_000).toFixed(1)}m`
    : value >= 1_000
      ? `${+(value / 1_000).toFixed(1)}k`
      : String(value);

/** Tracks an element's width, so an SVG chart can be drawn to fit its container */
export function useElementWidth<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => setWidth(entry?.contentRect.width ?? 0));
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return { ref, width };
}
