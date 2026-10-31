import { Controller, Get } from '@nestjs/common';
import { ExchangeRatesService } from './exchange-rates.service';

@Controller('exchange-rates')
export class ExchangeRatesController {
  constructor(private readonly exchangeRates: ExchangeRatesService) {}

  // Public: logged-out visitors see converted prices on mentor profiles too
  @Get()
  getRates() {
    return this.exchangeRates.getUsdToNgn();
  }
}
