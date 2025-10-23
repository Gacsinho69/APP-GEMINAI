
import { CourierDivisorConfig, CourierQuote, CourierType, Incoterm, ParcelInfo, Currency } from '../types';
import { fxService } from './fxService';
import { DEFAULT_ADMIN_CONFIG } from '../constants';

export const courierService = {
  getQuotes: async (
    parcelInfo: ParcelInfo,
    chargeableWeightKg: number,
    originCurrency: Currency,
    courierDivisors: CourierDivisorConfig[],
  ): Promise<CourierQuote[]> => {
    console.log(
      `Fetching courier quotes for ${parcelInfo.courier} from ${parcelInfo.originCityPostcode} to ${parcelInfo.destinationCityPostcode} with ${chargeableWeightKg.toFixed(2)} kg chargeable weight...`,
    );
    await new Promise((resolve) => setTimeout(resolve, 1500)); // Simulate API call

    if (chargeableWeightKg <= 0) {
      throw new Error('Chargeable weight must be greater than zero to fetch quotes.');
    }
    if (!parcelInfo.originCityPostcode || !parcelInfo.destinationCityPostcode) {
      throw new Error('Origin and Destination are required for courier quotes.');
    }

    const quotes: CourierQuote[] = [];

    // Mock logic for generating quotes based on courier and weight
    const generateQuote = async (
      courier: CourierType,
      serviceLevel: string,
      basePriceUsdPerKg: number,
      minPriceUsd: number,
    ): Promise<CourierQuote> => {
      const priceUsd = Math.max(chargeableWeightKg * basePriceUsdPerKg, minPriceUsd);

      // Convert mock USD price to originCurrency if needed
      let priceInOriginCurrency = priceUsd;
      let quoteCurrency = Currency.USD;

      if (originCurrency !== Currency.USD) {
        try {
          // Temporarily use 0 spread for courier cost conversion to not double-apply it
          const fxRateUsdToOrigin =
            1 / (await fxService.getFxRateToUsd(originCurrency, 0));
          priceInOriginCurrency = priceUsd * fxRateUsdToOrigin;
          quoteCurrency = originCurrency;
        } catch (error) {
          console.warn(
            `Could not convert courier quote to ${originCurrency}, defaulting to USD.`,
            error,
          );
        }
      }

      return {
        id: `${courier}-${serviceLevel}-${Date.now()}`,
        provider: courier,
        serviceLevel: serviceLevel,
        transitTimeDays: Math.floor(Math.random() * 5) + 3, // 3-7 days
        price: priceInOriginCurrency,
        currency: quoteCurrency,
        incoterm: Incoterm.EXW, // Assuming EXW for now
      };
    };

    // DHL
    if (parcelInfo.courier === CourierType.DHL) {
      quotes.push(await generateQuote(CourierType.DHL, 'Express Worldwide', 5, 150));
      quotes.push(await generateQuote(CourierType.DHL, 'Economy Select', 3, 100));
    }
    // FedEx
    else if (parcelInfo.courier === CourierType.FEDEX) {
      quotes.push(await generateQuote(CourierType.FEDEX, 'International Priority', 4.8, 140));
      quotes.push(await generateQuote(CourierType.FEDEX, 'International Economy', 3.2, 90));
    }
    // UPS
    else if (parcelInfo.courier === CourierType.UPS) {
      quotes.push(await generateQuote(CourierType.UPS, 'Worldwide Express', 4.9, 145));
      quotes.push(await generateQuote(CourierType.UPS, 'Worldwide Saver', 3.1, 95));
    }
    // LATAM Cargo
    else if (parcelInfo.courier === CourierType.LATAM_CARGO) {
      quotes.push(await generateQuote(CourierType.LATAM_CARGO, 'Air Freight Standard', 2.5, 80));
    }
    // Local Forwarder
    else if (parcelInfo.courier === CourierType.LOCAL_FORWARDER) {
      quotes.push(await generateQuote(CourierType.LOCAL_FORWARDER, 'Standard Air', 2, 70));
    }

    if (quotes.length === 0) {
      throw new Error(`No mock quotes available for ${parcelInfo.courier}.`);
    }

    return quotes;
  },
};
