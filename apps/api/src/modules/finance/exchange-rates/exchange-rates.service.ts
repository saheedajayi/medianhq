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
export function convertAmount(amount: number, usdToNgn: number, to: 'NGN' | 'USD') {
  return to === 'NGN'
    ? Math.round((amount * usdToNgn) / 100) * 100
    : Math.max(1, Math.round(amount / usdToNgn));
}

/**
 * The USD to NGN rate, fetched at most daily. If a refresh fails the last rate
 * stays in use; EXCHANGE_RATE_USD_NGN covers a restart during a provider outage.
 */
@Injectable()
export class ExchangeRatesService {
  private readonly logger = new Logger(ExchangeRatesService.name);
  private rate: number | null = null;
  private updatedAt: Date | null = null;
  private nextFetchAt = 0;

  async getUsdToNgn() {
    if (Date.now() >= this.nextFetchAt) await this.refresh();

    if (this.rate) return { usdToNgn: this.rate, updatedAt: this.updatedAt };

    const fallback = Number(process.env.EXCHANGE_RATE_USD_NGN);
    return this.isPlausible(fallback)
      ? { usdToNgn: fallback, updatedAt: null }
      : { usdToNgn: null, updatedAt: null };
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

  private async refresh() {
    try {
      const response = await fetch(RATES_URL, {
        signal: AbortSignal.timeout(5000),
      });
      const data = (await response.json()) as { rates?: { NGN?: number } };
      const rate = data.rates?.NGN;
      if (!this.isPlausible(rate)) throw new Error(`Unexpected rate: ${rate}`);

      this.rate = rate;
      this.updatedAt = new Date();
      this.nextFetchAt = Date.now() + REFRESH_AFTER_MS;
    } catch (error) {
      this.logger.warn(`Could not refresh exchange rate: ${error}`);
      this.nextFetchAt = Date.now() + RETRY_AFTER_MS;
    }
  }

  private isPlausible(rate: unknown): rate is number {
    return (
      typeof rate === 'number' &&
      rate >= MIN_PLAUSIBLE_RATE &&
      rate <= MAX_PLAUSIBLE_RATE
    );
  }
}
