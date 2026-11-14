/** A figure with its change on the 7 days before; null when there is nothing to compare with */
export type AnalyticsStat = { value: number; changePct: number | null };

export type FunnelAnalytics = {
  stats: {
    signUps: AnalyticsStat;
    goalSetups: AnalyticsStat;
    firstSearches: AnalyticsStat;
    firstBookings: AnalyticsStat;
    firstSessions: AnalyticsStat;
  };
  /** One entry per day, oldest first */
  series: {
    label: string;
    signUps: number;
    goalSetups: number;
    firstSearches: number;
    firstBookings: number;
    firstSessions: number;
  }[];
  conversionRates: { label: string; pct: number }[];
  keyMetrics: { activeUsers: number; monthlyUsers: number; dropOffRatePct: number };
};

export type VerticalRatio = {
  vertical: string;
  mentors: number;
  mentees: number;
  /** Mentors per mentee; null when the vertical has no mentees */
  ratio: number | null;
  status: "BALANCED" | "NEEDS_SUPPLY";
  /** New profiles in the vertical, week by week */
  trend: number[];
};

export type DemandRatioAnalytics = { top: VerticalRatio[]; verticals: VerticalRatio[] };

export type FillRateAnalytics = {
  stats: { totalRequests: AnalyticsStat; successful: AnalyticsStat; failed: AnalyticsStat };
  flow: { requests: number; accepted: number; scheduled: number; fillRatePct: number };
  byVertical: { vertical: string; fillRatePct: number }[];
};

export type PerformanceAnalytics = {
  stats: { totalSearches: AnalyticsStat; filterUsers: AnalyticsStat; bookingRatePct: AnalyticsStat };
  topQueries: { query: string; searches: number; pctOfTotal: number }[];
  filterUsage: { filter: string; usage: number; pctOfTotal: number }[];
  funnel: { step: string; count: number; pct: number }[];
  daily: { label: string; searches: number; bookingRatePct: number; bookings: number }[];
  satisfaction: {
    /** Null until there is a review */
    average: number | null;
    reviews: number;
    changePct: number | null;
    distribution: { stars: number; pct: number }[];
  };
};

export type AsyncThread = {
  id: string;
  askedAt: string;
  asker: string;
  question: string;
  mentor: string;
  /** Null while the question is unanswered */
  responseMinutes: number | null;
  status: "ON_TIME" | "LATE" | "WAITING";
};

export type ResponseMetricsAnalytics = {
  slaHours: number;
  stats: {
    medianResponseMinutes: { value: number | null; changePct: number | null };
    threadVolume: AnalyticsStat;
    slaCompliancePct: AnalyticsStat;
  };
  sla: { met: number; missed: number };
  daily: { label: string; threads: number; medianResponseMinutes: number | null; slaPct: number }[];
  breakdown: { label: string; pct: number }[];
  recent: AsyncThread[];
};

export type ActivityAnalytics = {
  stats: { postVolume: AnalyticsStat; dailyActiveUsers: number; topicCount: number; flaggedRatePct: number };
  daily: { label: string; posts: number; activeMembers: number }[];
  topTopics: { topic: string; posts: number; pct: number }[];
  flagged: { flaggedPosts: number; totalPosts: number };
  latest: { id: string; author: string; topic: string; replies: number; createdAt: string }[];
  engagement: { topic: string; posts: number; activeMembers: number }[];
  insights: {
    postVolumeChangePct: number | null;
    activeMembersChangePct: number | null;
    topTopic: { topic: string; pct: number } | null;
  };
};

export type VisitorPeriod = "daily" | "weekly" | "monthly" | "yearly";

export type VisitorsAnalytics = {
  period: VisitorPeriod;
  stats: Record<VisitorPeriod, AnalyticsStat>;
  series: { label: string; visitors: number }[];
};
