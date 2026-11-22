"use client";

import { useCallback, useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  convertAmount,
  convertBetween,
  formatAmount,
  payCurrencyForLocation,
  payCurrencyForTimeZone,
  type Currency,
  type PayCurrency,
} from "@/lib/currency";
import { useCurrentUser } from "@/services/auth/queries/auth.queries";
import { exchangeRatesService } from "@/services/exchange-rates";

export function useExchangeRates() {
  const { data } = useQuery({
    queryKey: ["exchange-rates"],
    queryFn: async () => (await exchangeRatesService.get()).data,
    staleTime: 60 * 60 * 1000,
  });
  return { usdToNgn: data?.usdToNgn ?? null, rates: data?.rates ?? null };
}

export function useExchangeRate() {
  return useExchangeRates().usdToNgn;
}

/** Where the viewer is: their saved location, otherwise their device's timezone */
function useViewerPlace() {
  const { data: user } = useCurrentUser();
  const location = user?.menteeProfile?.location ?? user?.mentorProfile?.location;
  // Starts as Lagos on the server, which can't see the device's timezone
  const [timeZone, setTimeZone] = useState("Africa/Lagos");

  useEffect(() => {
    setTimeZone(Intl.DateTimeFormat().resolvedOptions().timeZone);
  }, []);

  return { location, timeZone };
}

/** The currency a mentor lists their sessions in by default */
export function useLocalCurrency(): Currency {
  const { location, timeZone } = useViewerPlace();
  if (location) return /nigeria/i.test(location) ? "NGN" : "USD";
  return timeZone === "Africa/Lagos" ? "NGN" : "USD";
}

/** The currency a mentee sees prices in and pays in */
export function usePayCurrency(): PayCurrency {
  const { location, timeZone } = useViewerPlace();
  return location ? payCurrencyForLocation(location) : payCurrencyForTimeZone(timeZone);
}

/** Formats a listed price in the viewer's currency; without a rate it stays as listed */
export function useFormatPrice() {
  const payCurrency = usePayCurrency();
  const { usdToNgn, rates } = useExchangeRates();

  return useCallback(
    (amount: number, currency: string = "NGN") => {
      if (amount <= 0 || currency === payCurrency) return formatAmount(amount, currency);
      // Naira prices round to ₦100, as the booking charge does
      if (payCurrency === "NGN" && currency === "USD" && usdToNgn) {
        return formatAmount(convertAmount(amount, usdToNgn, "NGN"), "NGN");
      }
      const converted = rates ? convertBetween(amount, currency, payCurrency, rates) : null;
      return converted === null ? formatAmount(amount, currency) : formatAmount(converted, payCurrency);
    },
    [payCurrency, usdToNgn, rates]
  );
}
