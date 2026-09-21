import type { LandingAudience } from "../audience";
import type { Currency } from "./currency-dropdown";

export type BillingCycle = "monthly" | "quarterly" | "annually";

export const PRO_PRICES: Record<LandingAudience, Record<BillingCycle, Record<Currency, string>>> = {
  mentee: {
    monthly: { NGN: "₦5,000", USD: "$7" },
    quarterly: { NGN: "₦14,000", USD: "$19" },
    annually: { NGN: "₦48,000", USD: "$68" },
  },
  mentor: {
    monthly: { NGN: "₦12,000", USD: "$15" },
    quarterly: { NGN: "₦33,000", USD: "$40" },
    annually: { NGN: "₦115,600", USD: "$148" },
  },
};

export const BILLING_PERIOD: Record<BillingCycle, string> = {
  monthly: "/month",
  quarterly: "/quarter",
  annually: "/year",
};
