import type { AdminOverviewActivityDay } from "@/services/admin/overview";
import { LineChart } from "../shared/charts/line-chart";
import { formatDay } from "../shared/format";
import { ACTIVITY_SERIES } from "./overview-utils";

interface PlatformActivityChartProps {
  days: AdminOverviewActivityDay[];
}

export function PlatformActivityChart({ days }: PlatformActivityChartProps) {
  return (
    <LineChart
      label="Daily sessions completed, new sign-ups and churned users"
      series={[...ACTIVITY_SERIES]}
      points={days.map((day) => ({
        // "01 Oct" under the axis, the full date in the tooltip
        label: formatDay(day.date).slice(0, 6),
        title: formatDay(day.date),
        values: ACTIVITY_SERIES.map((series) => day[series.key]),
      }))}
    />
  );
}
