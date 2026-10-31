import {
  convertAmount,
  ExchangeRatesService,
} from '../../../../../src/modules/finance/exchange-rates/exchange-rates.service';

describe('ExchangeRatesService', () => {
  const originalFetch = global.fetch;
  const mockRate = (rate: unknown) => {
    global.fetch = jest.fn().mockResolvedValue({
      json: () => Promise.resolve({ rates: { NGN: rate } }),
    }) as never;
  };

  afterEach(() => {
    global.fetch = originalFetch;
    delete process.env.EXCHANGE_RATE_USD_NGN;
  });

  it('rounds to the nearest N100 and the nearest $1', () => {
    expect(convertAmount(20, 1345.47, 'NGN')).toBe(26900);
    expect(convertAmount(26900, 1345.47, 'USD')).toBe(20);
    expect(convertAmount(100, 1345.47, 'USD')).toBe(1);
  });

  it('leaves NGN prices alone without needing a rate', async () => {
    global.fetch = jest.fn() as never;
    const result = await new ExchangeRatesService().convertToNgn(5000, 'NGN');

    expect(result).toEqual({ amount: 5000, exchangeRate: null });
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('converts USD and reports the rate used', async () => {
    mockRate(1500);
    const result = await new ExchangeRatesService().convertToNgn(20, 'USD');

    expect(result).toEqual({ amount: 30000, exchangeRate: 1500 });
  });

  it('only fetches the rate once while it is fresh', async () => {
    mockRate(1500);
    const service = new ExchangeRatesService();
    await service.getUsdToNgn();
    await service.getUsdToNgn();

    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it('refuses a rate that makes no sense', async () => {
    mockRate(1);
    await expect(new ExchangeRatesService().convertToNgn(20, 'USD')).rejects.toThrow();
  });

  it('refuses to charge when no rate is available', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('down')) as never;
    await expect(new ExchangeRatesService().convertToNgn(20, 'USD')).rejects.toThrow();
  });

  it('uses the configured fallback during an outage', async () => {
    process.env.EXCHANGE_RATE_USD_NGN = '1400';
    global.fetch = jest.fn().mockRejectedValue(new Error('down')) as never;
    const result = await new ExchangeRatesService().convertToNgn(10, 'USD');

    expect(result).toEqual({ amount: 14000, exchangeRate: 1400 });
  });
});
