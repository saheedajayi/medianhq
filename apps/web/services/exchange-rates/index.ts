import { apiClient } from "@/services/api-client";

export type ExchangeRates = {
  /** Null when no rate is available, so prices stay in their listed currency */
  usdToNgn: number | null;
  updatedAt: string | null;
};

export const exchangeRatesService = {
  get() {
    return apiClient.get<ExchangeRates>("/exchange-rates");
  },
};
