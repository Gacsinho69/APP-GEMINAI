
import {
  AdminConfigState,
  CourierType,
  Currency,
  Incoterm,
  Scenario,
} from './types';

// API Keys - In a real app, these would be loaded securely from environment variables.
// For demonstration, we'll use placeholders or publicly available test keys.
export const OPEN_EXCHANGE_RATES_APP_ID = 'YOUR_OPEN_EXCHANGE_RATES_APP_ID'; // Replace with a real key if using live FX

export const DEFAULT_CURRENCY_OPTIONS = [
  Currency.USD,
  Currency.GBP,
  Currency.EUR,
  Currency.CNY,
  Currency.JPY,
  Currency.MXN,
  Currency.CAD,
  Currency.AUD,
  Currency.BRL,
];

export const DEFAULT_COURIER_OPTIONS = [
  CourierType.DHL,
  CourierType.FEDEX,
  CourierType.UPS,
  CourierType.LATAM_CARGO,
  CourierType.LOCAL_FORWARDER,
];

export const DEFAULT_ADMIN_CONFIG: AdminConfigState = {
  defaultIvaRate: 0.19, // 19%
  defaultInsuranceRate: 0.02, // 2%
  fxSpreadPercentage: 0.03, // 3%
  aduanaUsdClpRate: 950, // Example default, will be fetched/overridden
  adValoremRates: [
    {
      id: 'av-1',
      hsCodePrefix: '',
      originCountry: 'GLOBAL',
      rate: 0.06,
    }, // Default 6%
  ],
  serviceFees: [
    {
      id: 'sf-honorarios',
      name: 'Honorarios',
      baseAmountClp: 77491,
      perKgRateClp: 0,
      brackets: [],
      vatTaxable: true,
    },
    {
      id: 'sf-gastos-despachos',
      name: 'Gastos Despachos',
      baseAmountClp: 38746,
      perKgRateClp: 0,
      brackets: [],
      vatTaxable: true,
    },
    {
      id: 'sf-gastos-operacionales',
      name: 'Gastos Operacionales',
      baseAmountClp: 0,
      perKgRateClp: 0,
      brackets: [
        { minChargeableWeightKg: 0, maxChargeableWeightKg: 170, amountClp: 300000 },
        {
          minChargeableWeightKg: 170.01,
          maxChargeableWeightKg: 270,
          amountClp: 800000,
        },
        // Add more brackets as needed
      ],
      vatTaxable: false,
    },
  ],
  courierDivisors: [
    {
      id: 'cd-dhl',
      courier: CourierType.DHL,
      divisor: 5000,
      description: 'DHL standard divisor',
    },
    {
      id: 'cd-fedex-air',
      courier: CourierType.FEDEX,
      divisor: 5000,
      description: 'FedEx Air standard divisor',
    },
    {
      id: 'cd-ups-air',
      courier: CourierType.UPS,
      divisor: 5000,
      description: 'UPS Air standard divisor',
    },
    {
      id: 'cd-latam-cargo',
      courier: CourierType.LATAM_CARGO,
      divisor: 6000,
      description: 'LATAM Cargo divisor',
    },
    {
      id: 'cd-local-forwarder',
      courier: CourierType.LOCAL_FORWARDER,
      divisor: 6000,
      description: 'Local Forwarder divisor',
    },
  ],
};

export const INITIAL_SCENARIO: Scenario = {
  generalInfo: {
    nameOfGoods: '',
    hsCode: '',
    originCountry: 'United States',
    originCurrency: Currency.USD,
    exwUnitPriceOrigin: 0,
    quantity: 1,
  },
  parcelInfo: {
    lengthCm: 0,
    widthCm: 0,
    heightCm: 0,
    actualWeightKg: 0,
    courier: CourierType.DHL,
    originCityPostcode: '',
    destinationCityPostcode: 'Santiago, Chile',
    shipmentDate: new Date().toISOString().split('T')[0],
    selectedCourierRateId: undefined,
  },
  cifPrice: {
    insuranceRate: DEFAULT_ADMIN_CONFIG.defaultInsuranceRate,
  },
  chileCustoms: {
    adValoremRate: DEFAULT_ADMIN_CONFIG.adValoremRates[0].rate,
    ivaRate: DEFAULT_ADMIN_CONFIG.defaultIvaRate,
    serviceItems: DEFAULT_ADMIN_CONFIG.serviceFees.map((sf) => ({
      id: sf.id,
      name: sf.name,
      amountClp: 0, // Calculated later
      vatTaxable: sf.vatTaxable,
    })),
    nationalDeliveryClp: 0,
    nationalDeliveryVatTaxable: true,
  },
  markup: {
    markupPercentage: 0,
  },
  calculations: {
    exwUnitUsd: 0,
    exwTotalUsd: 0,
    exwUnitClp: 0,
    exwTotalClp: 0,
    volumetricWeightKg: 0,
    chargeableWeightKg: 0,
    courierQuotes: [],
    freightUsd: 0, // Added to calculations
    insuranceUsd: 0, // Added to calculations
    cifUsd: 0,
    cifClp: 0,
    dutiesClp: 0,
    ivaAduaneroClp: 0,
    ivaServiciosClp: 0,
    totalGcpClp: 0,
    totalDesembolsosClp: 0,
    totalProvisionFondosClp: 0,
    totalCostChileClp: 0,
    totalCostChileUsd: 0,
    unitCostUsd: 0,
    unitCostClp: 0,
    totalSalesPriceUsd: 0,
    totalSalesPriceClp: 0,
    unitSalesPriceUsd: 0,
    unitSalesPriceClp: 0,
    totalProfitUsd: 0,
    totalProfitClp: 0,
    unitProfitUsd: 0,
    unitProfitClp: 0,
    fxRateToUsd: 1, // Default to 1 for USD itself
    tcUsdClp: DEFAULT_ADMIN_CONFIG.aduanaUsdClpRate,
  },
};
