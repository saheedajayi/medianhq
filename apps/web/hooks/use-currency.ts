"use client";

import { useCallback, useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { convertAmount, formatAmount, type Currency } from "@/lib/currency";
import { useCurrentUser } from "@/services/auth/queries/auth.queries";
import { exchangeRatesService } from "@/services/exchange-rates";

export function useExchangeRate() {
  const { data } = useQuery({
    queryKey: ["exchange-rates"],
    queryFn: async () => (await exchangeRatesService.get()).data,
    staleTime: 60 * 60 * 1000,
  });
  return data?.usdToNgn ?? null;
}

/** The viewer's currency: from their saved location, otherwise their device's timezone */
export function useLocalCurrency(): Currency {
  const { data: user } = useCurrentUser();
  const location = user?.menteeProfile?.location ?? user?.mentorProfile?.location;
  // Starts as NGN on the server, which can't see the device's timezone
  const [deviceCurrency, setDeviceCurrency] = useState<Currency>("NGN");

  useEffect(() => {
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    setDeviceCurrency(timeZone === "Africa/Lagos" ? "NGN" : "USD");
  }, []);

  if (location) return /nigeria/i.test(location) ? "NGN" : "USD";
  return deviceCurrency;
}

/** Formats a listed price in the viewer's currency; without a rate it stays as listed */
export function useFormatPrice() {
  const localCurrency = useLocalCurrency();
  const usdToNgn = useExchangeRate();

  return useCallback(
    (amount: number, currency: string = "NGN") =>
      amount > 0 && currency !== localCurrency && usdToNgn
        ? formatAmount(convertAmount(amount, usdToNgn, localCurrency), localCurrency)
        : formatAmount(amount, currency),
    [localCurrency, usdToNgn]
  );
}
