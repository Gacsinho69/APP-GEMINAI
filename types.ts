
export interface Scenario {
  generalInfo: GeneralInfo;
  parcelInfo: ParcelInfo;
  cifPrice: CIFPrice;
  chileCustoms: ChileCustoms;
  markup: Markup;
  calculations: Calculations;
}

export interface GeneralInfo {
  nameOfGoods: string;
  hsCode: string;
  originCountry: string;
  // FIX: Use Currency enum for better type safety
  originCurrency: Currency; // e.g., "GBP", "EUR", "USD", "CNY"
  exwUnitPriceOrigin: number; // EX-Works unit price in origin currency
  quantity: number;
}

export interface ParcelInfo {
  lengthCm: number;
  widthCm: number;
  heightCm: number;
  actualWeightKg: number;
  courier: CourierType;
  originCityPostcode: string;
  destinationCityPostcode: string; // Chile
  shipmentDate: string; // YYYY-MM-DD
  selectedCourierRateId?: string; // ID of the selected quote
}

export interface CourierQuote {
  id: string;
  provider: CourierType;
  serviceLevel: string;
  transitTimeDays: number;
  price: number; // in original currency
  // FIX: Use Currency enum for better type safety
  currency: Currency;
  incoterm: Incoterm;
}

export interface CIFPrice {
  insuranceRate: number; // % of EXW/FOB
  manualFreightUsdPerKg?: number; // Optional manual freight rate in USD per kg
  useManualFreight: boolean; // Whether to use manual freight or courier quote
}

export interface ServiceItem {
  id: string;
  name: string;
  amountClp: number;
  vatTaxable: boolean;
}

export interface ChileCustoms {
  adValoremRate: number; // %
  ivaRate: number; // %
  serviceItems: ServiceItem[];
  nationalDeliveryClp: number;
  nationalDeliveryVatTaxable: boolean;
}

export interface Markup {
  markupPercentage: number; // %
}

export interface Calculations {
  // General Info Derived
  exwUnitUsd: number;
  exwTotalUsd: number;
  exwUnitClp: number;
  exwTotalClp: number;

  // Parcel Info Derived
  volumetricWeightKg: number;
  chargeableWeightKg: number;
  courierQuotes: CourierQuote[]; // Live fetched quotes

  // CIF Price Derived
  freightUsd: number; // Moved to Calculations
  insuranceUsd: number; // Moved to Calculations
  cifUsd: number;
  cifClp: number;

  // Chile Customs Derived
  dutiesClp: number;
  ivaAduaneroClp: number;
  ivaServiciosClp: number;
  totalGcpClp: number;
  totalDesembolsosClp: number;
  totalProvisionFondosClp: number;

  // Totals & Unit Economics Derived
  totalCostChileClp: number;
  totalCostChileUsd: number;
  unitCostUsd: number;
  unitCostClp: number;

  // Markup & Profit Derived
  totalSalesPriceUsd: number;
  totalSalesPriceClp: number;
  unitSalesPriceUsd: number;
  unitSalesPriceClp: number;
  totalProfitUsd: number;
  totalProfitClp: number;
  unitProfitUsd: number;
  unitProfitClp: number;

  // Rates used in calculations
  fxRateToUsd: number; // Origin currency to USD, with spread
  tcUsdClp: number; // Official Customs USD to CLP rate
}

export enum Currency {
  GBP = 'GBP',
  EUR = 'EUR',
  USD = 'USD',
  CNY = 'CNY',
  JPY = 'JPY',
  MXN = 'MXN',
  CAD = 'CAD',
  AUD = 'AUD',
  CLP = 'CLP',
  BRL = 'BRL',
}

export enum CourierType {
  DHL = 'DHL',
  FEDEX = 'FEDEX',
  UPS = 'UPS',
  LATAM_CARGO = 'LATAM_CARGO',
  LOCAL_FORWARDER = 'LOCAL_FORWARDER',
}

export enum Incoterm {
  EXW = 'EXW',
  FOB = 'FOB',
  CIF = 'CIF',
}

// Admin Configurations
export interface AdminConfigState {
  defaultIvaRate: number;
  defaultInsuranceRate: number;
  fxSpreadPercentage: number;
  aduanaUsdClpRate: number; // Manual override for T/C
  adValoremRates: AdValoremRateConfig[];
  serviceFees: ServiceFeeConfig[];
  courierDivisors: CourierDivisorConfig[];
}

export interface AdValoremRateConfig {
  id: string;
  hsCodePrefix: string; // e.g., "85" for electronics
  originCountry: string; // e.g., "US", "CN", "GLOBAL"
  rate: number; // %
}

export interface ServiceFeeConfig {
  id: string;
  name: string;
  baseAmountClp: number;
  perKgRateClp: number;
  brackets: ServiceFeeBracket[];
  vatTaxable: boolean;
}

export interface ServiceFeeBracket {
  minChargeableWeightKg: number;
  maxChargeableWeightKg: number;
  amountClp: number;
}

export interface CourierDivisorConfig {
  id: string;
  courier: CourierType;
  divisor: number;
  description: string;
}

export interface FxRates {
  [currencyCode: string]: number;
}