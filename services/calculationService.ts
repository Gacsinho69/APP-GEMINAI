import {
  AdminConfigState,
  Calculations,
  ChileCustoms,
  Currency,
  Scenario,
  ServiceItem,
} from '../types';

export const calculationService = {
  calculateAll: (
    scenario: Scenario,
    adminConfig: AdminConfigState,
  ): {
    newCalculations: Calculations;
    effectiveAdValoremRate: number;
    effectiveIvaRate: number;
  } => {
    const newCalculations: Calculations = { ...scenario.calculations };
    const { generalInfo, parcelInfo, cifPrice, chileCustoms, markup } = scenario;

    // --- General Info Derived ---
    // FX to USD
    newCalculations.fxRateToUsd = scenario.calculations.fxRateToUsd; // This should be pre-set by useScenario hook based on live FX
    if (generalInfo.originCurrency === Currency.USD) {
      newCalculations.fxRateToUsd = 1;
    }

    newCalculations.exwUnitUsd =
      generalInfo.exwUnitPriceOrigin * newCalculations.fxRateToUsd;
    newCalculations.exwTotalUsd = newCalculations.exwUnitUsd * generalInfo.quantity;

    // Aduana USD/CLP Rate
    newCalculations.tcUsdClp = adminConfig.aduanaUsdClpRate; // Use manual override from admin config for this demo

    newCalculations.exwUnitClp = Math.round(
      newCalculations.exwUnitUsd * newCalculations.tcUsdClp,
    );
    newCalculations.exwTotalClp = Math.round(
      newCalculations.exwTotalUsd * newCalculations.tcUsdClp,
    );

    // --- Parcel Info Derived ---
    const courierDivisorConfig = adminConfig.courierDivisors.find(
      (cd) => cd.courier === parcelInfo.courier,
    );
    const divisor = courierDivisorConfig ? courierDivisorConfig.divisor : 5000; // Default if not found

    newCalculations.volumetricWeightKg =
      (parcelInfo.lengthCm * parcelInfo.widthCm * parcelInfo.heightCm) / divisor;
    newCalculations.chargeableWeightKg = Math.max(
      parcelInfo.actualWeightKg,
      newCalculations.volumetricWeightKg,
    );

    // --- CIF Price Derived ---
    // Check if manual freight should be used
    if (cifPrice.useManualFreight && cifPrice.manualFreightUsdPerKg) {
      newCalculations.freightUsd = cifPrice.manualFreightUsdPerKg * newCalculations.chargeableWeightKg;
    } else {
      const selectedQuote = newCalculations.courierQuotes.find(
        (q) => q.id === parcelInfo.selectedCourierRateId,
      );

      newCalculations.freightUsd = selectedQuote
        ? calculationService.convertCurrency(
            selectedQuote.price,
            selectedQuote.currency,
            Currency.USD,
            newCalculations.fxRateToUsd,
            adminConfig.fxSpreadPercentage,
          )
        : 0;
    }

    newCalculations.insuranceUsd =
      newCalculations.exwTotalUsd * cifPrice.insuranceRate;

    newCalculations.cifUsd =
      newCalculations.exwTotalUsd +
      newCalculations.freightUsd +
      newCalculations.insuranceUsd;
    newCalculations.cifClp = Math.round(
      newCalculations.cifUsd * newCalculations.tcUsdClp,
    );

    // --- Chile Customs + Other Costs ---
    const effectiveAdValoremRate =
      adminConfig.adValoremRates.find(
        (rate) =>
          rate.hsCodePrefix &&
          generalInfo.hsCode.startsWith(rate.hsCodePrefix) &&
          (rate.originCountry === generalInfo.originCountry ||
            rate.originCountry === 'GLOBAL'),
      )?.rate ||
      adminConfig.adValoremRates.find(
        (r) => r.hsCodePrefix === '' && r.originCountry === 'GLOBAL',
      )?.rate ||
      0.06;

    const effectiveIvaRate = adminConfig.defaultIvaRate;

    newCalculations.dutiesClp = Math.round(
      newCalculations.cifClp * effectiveAdValoremRate,
    );
    newCalculations.ivaAduaneroClp = Math.round(
      (newCalculations.cifClp + newCalculations.dutiesClp) * effectiveIvaRate,
    );

    const vatTaxableServiceItemsClp = chileCustoms.serviceItems.reduce(
      (sum, item) => sum + (item.vatTaxable ? item.amountClp : 0),
      0,
    );
    const nationalDeliveryTaxableClp = chileCustoms.nationalDeliveryVatTaxable
      ? chileCustoms.nationalDeliveryClp
      : 0;

    newCalculations.ivaServiciosClp = Math.round(
      (vatTaxableServiceItemsClp + nationalDeliveryTaxableClp) *
        effectiveIvaRate,
    );

    newCalculations.totalGcpClp =
      newCalculations.dutiesClp + newCalculations.ivaAduaneroClp;

    newCalculations.totalDesembolsosClp =
      chileCustoms.serviceItems.reduce((sum, item) => sum + item.amountClp, 0) +
      chileCustoms.nationalDeliveryClp +
      newCalculations.ivaServiciosClp;

    newCalculations.totalProvisionFondosClp =
      newCalculations.totalGcpClp + newCalculations.totalDesembolsosClp;

    // --- Totals & Unit Economics ---
    newCalculations.totalCostChileClp =
      newCalculations.totalGcpClp + newCalculations.totalDesembolsosClp;

    newCalculations.totalCostChileUsd =
      newCalculations.totalCostChileClp / newCalculations.tcUsdClp;

    newCalculations.unitCostUsd =
      generalInfo.quantity > 0
        ? newCalculations.totalCostChileUsd / generalInfo.quantity
        : 0;
    newCalculations.unitCostClp =
      generalInfo.quantity > 0
        ? newCalculations.totalCostChileClp / generalInfo.quantity
        : 0;

    // --- Markup & Profit ---
    newCalculations.totalSalesPriceUsd =
      newCalculations.totalCostChileUsd * (1 + markup.markupPercentage);
    newCalculations.totalSalesPriceClp = Math.round(
      newCalculations.totalSalesPriceUsd * newCalculations.tcUsdClp,
    );

    newCalculations.unitSalesPriceUsd =
      generalInfo.quantity > 0
        ? newCalculations.totalSalesPriceUsd / generalInfo.quantity
        : 0;
    newCalculations.unitSalesPriceClp =
      generalInfo.quantity > 0
        ? newCalculations.totalSalesPriceClp / generalInfo.quantity
        : 0;

    newCalculations.totalProfitUsd =
      newCalculations.totalSalesPriceUsd - newCalculations.totalCostChileUsd;
    newCalculations.totalProfitClp = Math.round(
      newCalculations.totalProfitUsd * newCalculations.tcUsdClp,
    );

    newCalculations.unitProfitUsd =
      generalInfo.quantity > 0
        ? newCalculations.totalProfitUsd / generalInfo.quantity
        : 0;
    newCalculations.unitProfitClp =
      generalInfo.quantity > 0
        ? newCalculations.totalProfitClp / generalInfo.quantity
        : 0;

    return { newCalculations, effectiveAdValoremRate, effectiveIvaRate };
  },

  // Helper function for currency conversion
  convertCurrency: (
    amount: number,
    fromCurrency: Currency,
    toCurrency: Currency,
    fxRateFromOriginToUsd: number, // fxRate from the origin currency to USD
    fxSpreadPercentage: number,
  ): number => {
    if (fromCurrency === toCurrency) {
      return amount;
    }

    // Convert everything to USD first for consistency
    let amountInUsd: number;
    if (fromCurrency === Currency.USD) {
      amountInUsd = amount;
    } else {
      // If fromCurrency is not USD, we need its rate to USD.
      // We assume fxRateFromOriginToUsd already includes the spread if needed for EXW -> USD.
      // For courier rates, we generally don't want to double-apply the spread
      // so we might need a raw FX rate. For this context, we'll assume the provided
      // fxRateFromOriginToUsd is the one to use for converting the courier's original currency price to USD.
      amountInUsd = amount * (1 / fxRateFromOriginToUsd); // Invert the rate to convert from Origin to USD
    }

    if (toCurrency === Currency.USD) {
      return amountInUsd;
    }

    // If converting from USD to another currency, we would need a rate from USD to that currency
    // which is not directly provided by fxRateFromOriginToUsd.
    // This function primarily supports conversion TO USD or FROM USD to CLP (handled by TC).
    // For general purpose, a more robust FX service lookup would be needed.
    console.warn(
      `Unsupported currency conversion: ${fromCurrency} to ${toCurrency}. Returning USD value.`,
    );
    return amountInUsd;
  },
};
