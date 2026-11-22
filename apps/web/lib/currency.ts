/** Currencies a mentor can list a session in */
export type Currency = "NGN" | "USD";

/**
 * Currencies a mentee can pay in: naira through Paystack, the rest through
 * Flutterwave. Must match FLUTTERWAVE_CURRENCIES in the API.
 */
export const PAY_CURRENCIES = [
  "NGN",
  "USD",
  "GBP",
  "EUR",
  "GHS",
  "KES",
  "ZAR",
  "EGP",
  "RWF",
  "TZS",
  "UGX",
  "ZMW",
  "XOF",
  "XAF",
] as const;
export type PayCurrency = (typeof PAY_CURRENCIES)[number];

const SYMBOLS: Record<PayCurrency, string> = {
  NGN: "₦",
  USD: "$",
  GBP: "£",
  EUR: "€",
  GHS: "GH₵",
  KES: "KSh",
  ZAR: "R",
  EGP: "E£",
  RWF: "RF",
  TZS: "TSh",
  UGX: "USh",
  ZMW: "ZK",
  XOF: "CFA",
  XAF: "FCFA",
};

export function formatAmount(amount: number, currency: string = "NGN") {
  if (!amount || amount <= 0) return "Free";
  return `${SYMBOLS[currency as PayCurrency] ?? `${currency} `}${amount.toLocaleString()}`;
}

/** Same rounding as the API, so a converted price matches the charge: nearest ₦100 or $1 */
export function convertAmount(amount: number, usdToNgn: number, to: Currency) {
  return to === "NGN"
    ? Math.round((amount * usdToNgn) / 100) * 100
    : Math.max(1, Math.round(amount / usdToNgn));
}

/**
 * Same as the API's conversion for Flutterwave charges: through the US dollar,
 * rounded to a whole unit. Rates are how much of each currency $1 buys.
 */
export function convertBetween(amount: number, from: string, to: string, rates: Record<string, number>) {
  if (from === to) return amount;
  const fromRate = from === "USD" ? 1 : rates[from];
  const toRate = to === "USD" ? 1 : rates[to];
  if (!fromRate || !toRate) return null;
  return Math.max(1, Math.round((amount / fromRate) * toRate));
}

// Countries where Flutterwave takes payments in the local currency
const COUNTRY_CURRENCIES: Record<string, PayCurrency> = {
  nigeria: "NGN",
  ghana: "GHS",
  kenya: "KES",
  "south africa": "ZAR",
  egypt: "EGP",
  rwanda: "RWF",
  tanzania: "TZS",
  uganda: "UGX",
  zambia: "ZMW",
  senegal: "XOF",
  "côte d'ivoire": "XOF",
  "cote d'ivoire": "XOF",
  "ivory coast": "XOF",
  "burkina faso": "XOF",
  cameroon: "XAF",
  "united kingdom": "GBP",
  uk: "GBP",
  "united states": "USD",
  usa: "USD",
  austria: "EUR",
  belgium: "EUR",
  croatia: "EUR",
  cyprus: "EUR",
  estonia: "EUR",
  finland: "EUR",
  france: "EUR",
  germany: "EUR",
  greece: "EUR",
  ireland: "EUR",
  italy: "EUR",
  latvia: "EUR",
  lithuania: "EUR",
  luxembourg: "EUR",
  malta: "EUR",
  netherlands: "EUR",
  portugal: "EUR",
  slovakia: "EUR",
  slovenia: "EUR",
  spain: "EUR",
};

const TIME_ZONE_CURRENCIES: Record<string, PayCurrency> = {
  "Africa/Lagos": "NGN",
  "Africa/Accra": "GHS",
  "Africa/Nairobi": "KES",
  "Africa/Johannesburg": "ZAR",
  "Africa/Cairo": "EGP",
  "Africa/Kigali": "RWF",
  "Africa/Dar_es_Salaam": "TZS",
  "Africa/Kampala": "UGX",
  "Africa/Lusaka": "ZMW",
  "Africa/Dakar": "XOF",
  "Africa/Abidjan": "XOF",
  "Africa/Ouagadougou": "XOF",
  "Africa/Douala": "XAF",
  "Europe/London": "GBP",
  "Europe/Vienna": "EUR",
  "Europe/Brussels": "EUR",
  "Europe/Zagreb": "EUR",
  "Asia/Nicosia": "EUR",
  "Europe/Tallinn": "EUR",
  "Europe/Helsinki": "EUR",
  "Europe/Paris": "EUR",
  "Europe/Berlin": "EUR",
  "Europe/Athens": "EUR",
  "Europe/Dublin": "EUR",
  "Europe/Rome": "EUR",
  "Europe/Riga": "EUR",
  "Europe/Vilnius": "EUR",
  "Europe/Luxembourg": "EUR",
  "Europe/Malta": "EUR",
  "Europe/Amsterdam": "EUR",
  "Europe/Lisbon": "EUR",
  "Europe/Bratislava": "EUR",
  "Europe/Ljubljana": "EUR",
  "Europe/Madrid": "EUR",
};

/** "Accra, Ghana" pays in cedis; a country Flutterwave doesn't cover pays in dollars */
export const payCurrencyForLocation = (location: string): PayCurrency =>
  COUNTRY_CURRENCIES[location.split(",").pop()?.trim().toLowerCase() ?? ""] ?? "USD";

export const payCurrencyForTimeZone = (timeZone: string): PayCurrency => TIME_ZONE_CURRENCIES[timeZone] ?? "USD";
