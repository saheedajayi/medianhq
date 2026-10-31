export type Currency = "NGN" | "USD";

const SYMBOLS: Record<Currency, string> = { NGN: "₦", USD: "$" };

export function formatAmount(amount: number, currency: string = "NGN") {
  if (!amount || amount <= 0) return "Free";
  return `${SYMBOLS[currency as Currency] ?? `${currency} `}${amount.toLocaleString()}`;
}

/** Same rounding as the API, so a converted price matches the charge: nearest ₦100 or $1 */
export function convertAmount(amount: number, usdToNgn: number, to: Currency) {
  return to === "NGN"
    ? Math.round((amount * usdToNgn) / 100) * 100
    : Math.max(1, Math.round(amount / usdToNgn));
}
