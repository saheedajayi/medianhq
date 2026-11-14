"use client";

import { useActivityAnalytics } from "@/services/admin/analytics/queries/analytics.queries";
import { DonutChart } from "../shared/charts/donut-chart";
import { LineChart } from "../shared/charts/line-chart";
import { formatCount, formatLongDate } from "../shared/format";
import {
  AnalyticsTabLayout,
  type AnalyticsTabProps,
} from "./analytics-tab-layout";
import {
  AnalyticsCard,
  AnalyticsTabState,
  Legend,
  ProgressBar,
  statCard,
} from "./analytics-utils";

const POSTS = { label: "Post", color: "#FFD9A8" };
const MEMBERS = { label: "Active members", color: "#3B0A05" };
const TOPIC_COLORS = ["#2E9E6B", "#182230", "#FFD9A8", "#4A0A05"];

const headClass = "pb-3 text-left text-xs font-medium text-[#101828]";
const cellClass = "py-2.5 pr-2 text-[10px] text-[#475467]";

/** "increase by 16%" or "decrease by 4%"; null when there was nothing to compare with */
const describeChange = (changePct: number | null) =>
  changePct === null
    ? null
    : `${changePct < 0 ? "decrease" : "increase"} by ${Math.abs(changePct)}%`;

export function ActivityTab({ tabBar }: AnalyticsTabProps) {
  const query = useActivityAnalytics();

  return (
    <AnalyticsTabState query={query}>
      {({ stats, daily, topTopics, flagged, latest, engagement, insights }) => {
        const mostPosts = Math.max(...engagement.map((row) => row.posts), 1);
        const mostMembers = Math.max(
          ...engagement.map((row) => row.activeMembers),
          1,
        );
        const postChange = describeChange(insights.postVolumeChangePct);
        const memberChange = describeChange(insights.activeMembersChangePct);

        return (
          <AnalyticsTabLayout
            tabBar={tabBar}
            stats={[
              statCard("Total Post Volume", stats.postVolume),
              {
                label: "Daily Active Users (DAU)",
                value: formatCount(stats.dailyActiveUsers),
                note: "Seen in the last 24 hours",
              },
              {
                label: "Top Topics",
                value: formatCount(stats.topicCount),
                note: "topics discussed this week",
              },
              {
                label: "Flagged Content Rate",
                value: `${stats.flaggedRatePct}%`,
                note: "of this week's posts",
              },
            ]}
          >
            <div className="grid gap-4 xl:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)_minmax(0,0.8fr)]">
              <AnalyticsCard
                title="Post Volume & DAU"
                aside={<Legend items={[POSTS, MEMBERS]} />}
              >
                <LineChart
                  label="Posts and active community members per day"
                  height={190}
                  series={[POSTS, MEMBERS]}
                  points={daily.map((day) => ({
                    label: day.label,
                    values: [day.posts, day.activeMembers],
                  }))}
                />
              </AnalyticsCard>

              <AnalyticsCard title="Top Topic">
                {topTopics.length === 0 ? (
                  <p className="text-sm text-[#667085]">No posts this week.</p>
                ) : (
                  <ol className="flex flex-col gap-3">
                    {topTopics.map((topic, index) => (
                      <li
                        key={topic.topic}
                        className="flex items-center gap-3 text-xs text-[#101828]"
                      >
                        <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[#FFE4DB] text-sm">
                          {index + 1}
                        </span>
                        <span className="flex-1 truncate font-medium">
                          {topic.topic}
                        </span>
                        <span>{formatCount(topic.posts)} Posts</span>
                        <span className="w-8 text-right text-[#12B76A]">
                          {topic.pct}%
                        </span>
                      </li>
                    ))}
                  </ol>
                )}
              </AnalyticsCard>

              <AnalyticsCard title="Flagged Content Rate">
                <div className="flex flex-wrap items-center gap-4">
                  <div className="relative size-[120px]">
                    <DonutChart
                      label="Flagged posts"
                      size={120}
                      thickness={8}
                      slices={[
                        {
                          label: "Flagged Post",
                          value: flagged.flaggedPosts,
                          color: "#F04438",
                        },
                      ]}
                    />
                    <p className="absolute inset-0 flex flex-col items-center justify-center text-[#101828]">
                      <span className="text-lg">{stats.flaggedRatePct}%</span>
                      <span className="text-[9px]">Flagged Rate</span>
                    </p>
                  </div>
                  <dl className="grid grid-cols-[auto_auto] gap-x-4 gap-y-2 text-xs text-[#98A2B3]">
                    <dt>Flagged Post</dt>
                    <dd className="text-[#101828]">
                      {formatCount(flagged.flaggedPosts)}
                    </dd>
                    <dt>Total Post</dt>
                    <dd className="text-[#101828]">
                      {formatCount(flagged.totalPosts)}
                    </dd>
                  </dl>
                </div>
              </AnalyticsCard>
            </div>

            <div className="grid gap-4 xl:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)_minmax(0,0.8fr)]">
              <AnalyticsCard title="Latest Forum Activity">
                {latest.length === 0 ? (
                  <p className="text-sm text-[#667085]">No posts yet.</p>
                ) : (
                  <table className="w-full border-collapse">
                    <thead>
                      <tr>
                        {["#", "Users", "Topic", "Replies", "Create at"].map(
                          (column) => (
                            <th key={column} scope="col" className={headClass}>
                              {column}
                            </th>
                          ),
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {latest.map((post, index) => (
                        <tr key={post.id}>
                          <td className={cellClass}>{index + 1}</td>
                          <td className={cellClass}>{post.author}</td>
                          <td className={`${cellClass} max-w-40 truncate`}>
                            {post.topic}
                          </td>
                          <td className={cellClass}>{post.replies}</td>
                          <td className={`${cellClass} whitespace-nowrap`}>
                            {formatLongDate(post.createdAt)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </AnalyticsCard>

              <AnalyticsCard title="Engagement by Topic">
                <div className="grid grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] gap-x-4 gap-y-3 text-[10px] text-[#101828]">
                  <span className="text-xs">Topic · Post</span>
                  <span className="text-right text-xs">Members</span>
                  {engagement.map((row, index) => (
                    <div
                      key={row.topic}
                      className="col-span-2 grid grid-cols-subgrid items-end"
                    >
                      <div>
                        <p className="flex justify-between gap-2">
                          <span className="truncate">{row.topic}</span>
                          {row.posts}
                        </p>
                        <ProgressBar
                          pct={(row.posts / mostPosts) * 100}
                          color={TOPIC_COLORS[index] ?? "#98A2B3"}
                          className="mt-1.5"
                        />
                      </div>
                      <div>
                        <p className="text-right">{row.activeMembers}</p>
                        <ProgressBar
                          pct={(row.activeMembers / mostMembers) * 100}
                          color={TOPIC_COLORS[index] ?? "#98A2B3"}
                          className="mt-1.5"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </AnalyticsCard>

              <AnalyticsCard title="Community Insights">
                <ul className="flex flex-col gap-4 text-sm">
                  {postChange && (
                    <Insight
                      title={`Post volume ${postChange}`}
                      note="Compared to the previous 7 days"
                    />
                  )}
                  {memberChange && (
                    <Insight
                      title={`Active members ${memberChange}`}
                      note="Compared to the previous 7 days"
                    />
                  )}
                  {insights.topTopic && (
                    <Insight
                      title={`Top Topic: ${insights.topTopic.topic}`}
                      note={`Received ${insights.topTopic.pct}% of total posts.`}
                    />
                  )}
                  {!postChange && !memberChange && !insights.topTopic && (
                    <li className="text-[#667085]">Not enough activity yet.</li>
                  )}
                </ul>
              </AnalyticsCard>
            </div>
          </AnalyticsTabLayout>
        );
      }}
    </AnalyticsTabState>
  );
}

function Insight({ title, note }: { title: string; note: string }) {
  return (
    <li>
      <p className="font-semibold text-[#101828]">{title}</p>
      <p className="text-xs text-[#667085]">{note}</p>
    </li>
  );
}
