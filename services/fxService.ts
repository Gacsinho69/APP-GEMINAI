
import { FxRates, Currency } from '../types';
import { OPEN_EXCHANGE_RATES_APP_ID } from '../constants';

const BASE_URL = 'https://api.exchangerate.host/latest'; // A free alternative
// const BASE_URL = 'https://open.er-api.com/v6/latest/USD'; // Another free alternative

interface ExchangeRateHostResponse {
  rates: { [key: string]: number };
  base: string;
  date: string;
  time_last_updated: number;
}

export const fxService = {
  // Fetches rates relative to USD.
  // In Open Exchange Rates, the base is USD. In ExchangeRate.host, you can specify base.
  // For simplicity, we assume we need to convert `fromCurrency` to `USD`.
  getFxRateToUsd: async (
    fromCurrency: Currency,
    fxSpreadPercentage: number,
  ): Promise<number> => {
    if (fromCurrency === Currency.USD) {
      return 1; // USD to USD is 1
    }

    try {
      // Using ExchangeRate.host which allows specifying base currency for free.
      // If we used Open Exchange Rates, we'd fetch base USD, then calculate fromCurrency/USD.
      // For Open Exchange Rates: const response = await fetch(`https://openexchangerates.org/api/latest.json?app_id=${OPEN_EXCHANGE_RATES_APP_ID}`);
      // const data = await response.json();
      // const rate = data.rates[fromCurrency]; // This is USD / fromCurrency
      // return (1 / rate) * (1 + fxSpreadPercentage);

      const response = await fetch(`${BASE_URL}?base=${fromCurrency}&symbols=USD`);
      if (!response.ok) {
        throw new Error(`FX API error: ${response.statusText}`);
      }
      const data: ExchangeRateHostResponse = await response.json();

      if (!data.rates || !data.rates.USD) {
        throw new Error(`FX rate for ${fromCurrency} to USD not found.`);
      }

      const rate = data.rates.USD; // This is (fromCurrency / USD), so 1 unit of fromCurrency = X USD
      return rate * (1 + fxSpreadPercentage); // Apply spread for conversion TO USD
    } catch (error) {
      console.error('Error fetching FX rate:', error);
      // Fallback: If API fails, or for currencies not covered, provide a default or throw.
      // For demo purposes, hardcoding some rates as a fallback.
      const fallbackRates: { [key in Currency]?: number } = {
        [Currency.EUR]: 1.08,
        [Currency.GBP]: 1.25,
        [Currency.CNY]: 0.14,
        [Currency.JPY]: 0.0067,
        [Currency.MXN]: 0.059,
        [Currency.CAD]: 0.73,
        [Currency.AUD]: 0.65,
        [Currency.BRL]: 0.20,
      };
      const fallbackRate = fallbackRates[fromCurrency];
      if (fallbackRate) {
        console.warn(
          `Using fallback FX rate for ${fromCurrency} to USD: ${fallbackRate}`,
        );
        return fallbackRate * (1 + fxSpreadPercentage);
      }
      throw new Error(
        `Failed to fetch FX rate for ${fromCurrency} to USD. No fallback available.`,
      );
    }
  },

  // Mock function to fetch all rates relative to USD (not used in current calculations)
  getLatestRates: async (baseCurrency: Currency): Promise<FxRates> => {
    try {
      const response = await fetch(`${BASE_URL}?base=${baseCurrency}`);
      if (!response.ok) {
        throw new Error(`FX API error: ${response.statusText}`);
      }
      const data: ExchangeRateHostResponse = await response.json();
      return data.rates;
    } catch (error) {
      console.error('Error fetching latest FX rates:', error);
      return { USD: 1, EUR: 0.9, GBP: 0.8, CNY: 7.2 }; // Fallback mock rates
    }
  },
};
