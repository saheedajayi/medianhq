import {
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';

const RATES_URL = 'https://open.er-api.com/v6/latest/USD';
const REFRESH_AFTER_MS = 24 * 60 * 60 * 1000;
const RETRY_AFTER_MS = 5 * 60 * 1000;
// Guards against a bad response turning into a wildly wrong charge
const MIN_PLAUSIBLE_RATE = 100;
const MAX_PLAUSIBLE_RATE = 100_000;

/** Prices convert to round numbers: the nearest N100, or the nearest $1 */
export function convertAmount(
  amount: number,
  usdToNgn: number,
  to: 'NGN' | 'USD',
) {
  return to === 'NGN'
    ? Math.round((amount * usdToNgn) / 100) * 100
    : Math.max(1, Math.round(amount / usdToNgn));
}

/**
 * A price in another currency, through the US dollar, rounded to a whole unit.
 * Rates are how much of each currency one US dollar buys.
 */
export function convertBetween(
  amount: number,
  from: string,
  to: string,
  rates: Record<string, number>,
) {
  if (from === to) return amount;
  const fromRate = from === 'USD' ? 1 : rates[from];
  const toRate = to === 'USD' ? 1 : rates[to];
  if (!fromRate || !toRate) return null;
  return Math.max(1, Math.round((amount / fromRate) * toRate));
}

/**
 * Exchange rates against the US dollar, fetched at most daily. If a refresh
 * fails the last rates stay in use; EXCHANGE_RATE_USD_NGN covers the naira
 * rate after a restart during a provider outage.
 */
@Injectable()
export class ExchangeRatesService {
  private readonly logger = new Logger(ExchangeRatesService.name);
  private rates: Record<string, number> = {};
  private updatedAt: Date | null = null;
  private nextFetchAt = 0;

  async getUsdToNgn() {
    const { usdToNgn, updatedAt } = await this.getRates();
    return { usdToNgn, updatedAt };
  }

  /** The naira rate on its own, plus every other currency's rate */
  async getRates() {
    if (Date.now() >= this.nextFetchAt) await this.refresh();

    const fallback = Number(process.env.EXCHANGE_RATE_USD_NGN);
    const usdToNgn = this.isPlausibleNgn(this.rates.NGN)
      ? this.rates.NGN
      : this.isPlausibleNgn(fallback)
        ? fallback
        : null;
    return {
      usdToNgn,
      rates: { ...this.rates, ...(usdToNgn && { NGN: usdToNgn }) },
      updatedAt: this.updatedAt,
    };
  }

  /** The amount to charge in NGN; refuses rather than guessing without a rate */
  async convertToNgn(amount: number, currency: string) {
    if (currency === 'NGN') return { amount, exchangeRate: null };

    const { usdToNgn } = await this.getUsdToNgn();
    if (currency !== 'USD' || !usdToNgn) {
      throw new ServiceUnavailableException(
        "We can't price this session right now. Please try again shortly.",
      );
    }
    return {
      amount: convertAmount(amount, usdToNgn, 'NGN'),
      exchangeRate: usdToNgn,
    };
  }

  /** A price in another currency; refuses rather than guessing without a rate */
  async convert(amount: number, from: string, to: string) {
    const { rates } = await this.getRates();
    const converted = convertBetween(amount, from, to, rates);
    if (converted === null) {
      throw new ServiceUnavailableException(
        "We can't price this session right now. Please try again shortly.",
      );
    }
    return converted;
  }

  private async refresh() {
    try {
      const response = await fetch(RATES_URL, {
        signal: AbortSignal.timeout(5000),
      });
      const data = (await response.json()) as {
        rates?: Record<string, unknown>;
      };
      const rates = Object.fromEntries(
        Object.entries(data.rates ?? {}).filter(
          (entry): entry is [string, number] =>
            typeof entry[1] === 'number' &&
            Number.isFinite(entry[1]) &&
            entry[1] > 0,
        ),
      );
      if (!this.isPlausibleNgn(rates.NGN)) {
        throw new Error(`Unexpected rate: ${String(rates.NGN)}`);
      }

      this.rates = rates;
      this.updatedAt = new Date();
      this.nextFetchAt = Date.now() + REFRESH_AFTER_MS;
    } catch (error) {
      this.logger.warn(`Could not refresh exchange rate: ${error}`);
      this.nextFetchAt = Date.now() + RETRY_AFTER_MS;
    }
  }

  private isPlausibleNgn(rate: unknown): rate is number {
    return (
      typeof rate === 'number' &&
      rate >= MIN_PLAUSIBLE_RATE &&
      rate <= MAX_PLAUSIBLE_RATE
    );
  }
}
