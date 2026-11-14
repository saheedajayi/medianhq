import type { FinanceRevenue } from "@/services/admin/finance";
import { cn } from "@/lib/utils";
import { DonutChart } from "../shared/charts/donut-chart";
import { LineChart } from "../shared/charts/line-chart";
import { financeCardClass, formatAmount, percentOf } from "./finance-utils";

const titleClass = "text-xl font-semibold text-[#475467]";
const SESSIONS_COLOR = "#475467";
const SUBSCRIPTIONS_COLOR = "#FFA98A";

interface RevenueSummaryCardsProps {
  revenue: FinanceRevenue;
  showSubscriptions: boolean;
}

/** The three cards under the bar chart: the trend, the split by product and the headlines */
export function RevenueSummaryCards({ revenue, showSubscriptions }: RevenueSummaryCardsProps) {
  const key = showSubscriptions ? "subscriptionRevenue" : "sessionRevenue";
  const { oneOnOne, group } = revenue.byProduct;
  const { insights } = revenue;
  // With no subscriptions sold there is nothing to split, so the ring stays empty
  const products = showSubscriptions
    ? []
    : [
        { label: "1-1 Session", value: oneOnOne, color: "#EAECF0" },
        { label: "Group Session", value: group, color: "#FFD9A8" },
      ];
  const productTotal = oneOnOne + group;

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)_minmax(0,0.8fr)]">
      <section className={cn(financeCardClass, "p-3")}>
        <div className="flex items-center justify-between gap-3 px-1">
          <h2 className={titleClass}>Revenue Trend</h2>
          <span className="flex items-center gap-1.5 text-sm text-[#667085]">
            <span
              className="size-2 rounded-full"
              style={{ backgroundColor: showSubscriptions ? SUBSCRIPTIONS_COLOR : SESSIONS_COLOR }}
            />
            {showSubscriptions ? "subscriptions" : "Sessions"}
          </span>
        </div>
        <div className="mt-3">
          <LineChart
            label="Revenue trend"
            height={190}
            series={[
              {
                label: showSubscriptions ? "Subscriptions" : "Sessions",
                color: showSubscriptions ? SUBSCRIPTIONS_COLOR : SESSIONS_COLOR,
              },
            ]}
            points={revenue.series.map((bucket) => ({ label: bucket.label, values: [bucket[key]] }))}
          />
        </div>
      </section>

      <section className={cn(financeCardClass, "p-3")}>
        <h2 className={titleClass}>{showSubscriptions ? "Revenue by users" : "Revenue by product"}</h2>
        <div className="mt-3 flex flex-wrap items-center gap-6">
          <DonutChart label="Revenue by product" slices={products} size={170} />
          {products.length === 0 ? (
            <p className="text-sm text-[#667085]">No subscription revenue yet.</p>
          ) : (
            <dl className="flex flex-col gap-4">
              {products.map((product) => (
                <div key={product.label}>
                  <dt className="flex items-center gap-2 text-xs text-[#667085]">
                    <span className="size-3.5 rounded-full" style={{ backgroundColor: product.color }} />
                    {product.label}
                  </dt>
                  <dd className="mt-1.5 pl-5 text-xs text-[#101828]">{formatAmount(product.value)}</dd>
                  <dd className="pl-5 text-[10px] text-[#98A2B3]">{percentOf(product.value, productTotal)}%</dd>
                </div>
              ))}
            </dl>
          )}
        </div>
      </section>

      <section className={cn(financeCardClass, "p-3")}>
        <h2 className={titleClass}>Quick Insights</h2>
        <ul className="mt-4 flex flex-col gap-5 text-xs">
          <Insight
            title={describeChange("Sessions revenue", insights.sessionsChangePct)}
            note="Compared to last week."
          />
          <Insight
            title={describeChange("Subscriptions revenue", insights.subscriptionsChangePct)}
            note="Compared to last week."
          />
          <li className="pl-3">
            <p className="font-semibold text-[#101828]">Top earning period</p>
            <p className="mt-0.5 text-[10px] text-[#344054]">
              {insights.topEarning
                ? `${insights.topEarning.label} · ${formatAmount(insights.topEarning.amount)}`
                : "No revenue in this range."}
            </p>
          </li>
        </ul>
      </section>
    </div>
  );
}

const describeChange = (name: string, changePct: number | null) =>
  changePct === null
    ? `${name} has no earlier week to compare`
    : `${name} ${changePct < 0 ? "decreased" : "increased"} by ${Math.abs(changePct)}%`;

function Insight({ title, note }: { title: string; note: string }) {
  return (
    <li className="list-inside list-disc">
      <span className="font-semibold text-[#101828]">{title}</span>
      <p className="mt-0.5 pl-3 text-[10px] text-[#344054]">{note}</p>
    </li>
  );
}
