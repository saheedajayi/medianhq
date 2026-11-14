import type { AdminOverview } from "@/services/admin/overview";
import { downloadCsv } from "@/lib/csv";

export const ACTIVITY_SERIES = [
  { key: "sessionsCompleted", label: "Sessions completed", color: "#FF5514" },
  { key: "newSignUps", label: "New sign-ups", color: "#2F6FC2" },
  { key: "churnedUsers", label: "Churned users", color: "#98A2B3", dashed: true },
] as const;

export const NPS_GROUPS = [
  { key: "promotersPct", label: "Promoters", color: "#079455" },
  { key: "passivesPct", label: "Passives", color: "#F5B94C" },
  { key: "detractorsPct", label: "Detractors", color: "#E5827A" },
] as const;

/** "+4" for a rise, "-3" for a fall */
export const formatSigned = (value: number) => `${value > 0 ? "+" : ""}${value}`;

/** Saves everything on the overview as one CSV */
export function exportSnapshot(overview: AdminOverview) {
  const { stats, activity, nps, alerts } = overview;
  const timestamp = overview.generatedAt.slice(0, 16).replace(":", "");

  downloadCsv(`median-overview-${timestamp}.csv`, [
    ["Section", "Metric", "Value"],
    ["Stats", "Monthly active users", stats.monthlyActiveUsers],
    ["Stats", "Sessions today", stats.sessionsToday.total],
    ["Stats", "Sessions completed today", stats.sessionsToday.completed],
    ["Stats", "Sessions in progress", stats.sessionsToday.inProgress],
    ["Stats", `Revenue today (${stats.revenueToday.currency})`, stats.revenueToday.amount],
    ["Stats", "Approved mentors", stats.mentors.approved],
    ["Stats", "Mentors with sessions in the last 30 days", stats.mentors.withSessionsLast30Days],
    ["Stats", "Pending applications", stats.pendingApplications.total],
    ["NPS", "Score", nps.score],
    ["NPS", "Responses", nps.responses],
    ...NPS_GROUPS.map((group) => ["NPS", `${group.label} %`, nps[group.key]]),
    ...activity.days.flatMap((day) =>
      ACTIVITY_SERIES.map((series) => [`Activity ${day.date}`, series.label, day[series.key]]),
    ),
    ...alerts.map((alert) => ["Alert", alert.title, `${alert.detail} (${alert.occurredAt})`]),
  ]);
}
