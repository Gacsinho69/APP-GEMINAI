
import { INITIAL_SCENARIO } from '../constants';
import { Scenario } from '../types';

interface StoredScenarioMeta {
  id: string;
  name: string;
  date: string;
}

export const scenarioService = {
  // Saves the current scenario to local storage
  saveScenario: (scenario: Scenario, name: string): string => {
    const id = `scenario-${Date.now()}`;
    const storedScenario = { ...scenario, id, name, date: new Date().toISOString() };
    localStorage.setItem(id, JSON.stringify(storedScenario));

    // Update the list of saved scenarios
    const scenarioList = scenarioService.getScenarioList();
    const existingIndex = scenarioList.findIndex((s) => s.id === id);
    if (existingIndex !== -1) {
      scenarioList[existingIndex] = { id, name, date: storedScenario.date };
    } else {
      scenarioList.push({ id, name, date: storedScenario.date });
    }
    localStorage.setItem('scenarioList', JSON.stringify(scenarioList));
    return id;
  },

  // Retrieves a scenario by its ID from local storage
  getScenarioById: (id: string): Scenario | undefined => {
    const item = localStorage.getItem(id);
    if (item) {
      return JSON.parse(item) as Scenario;
    }
    return undefined;
  },

  // Retrieves the list of all saved scenario metadata
  getScenarioList: (): StoredScenarioMeta[] => {
    const list = localStorage.getItem('scenarioList');
    return list ? (JSON.parse(list) as StoredScenarioMeta[]) : [];
  },

  // Deletes a scenario by its ID
  deleteScenario: (id: string): void => {
    localStorage.removeItem(id);
    let scenarioList = scenarioService.getScenarioList();
    scenarioList = scenarioList.filter((s) => s.id !== id);
    localStorage.setItem('scenarioList', JSON.stringify(scenarioList));
  },

  // Clears all saved scenarios (for development/reset)
  clearAllScenarios: (): void => {
    const scenarioList = scenarioService.getScenarioList();
    scenarioList.forEach((s) => localStorage.removeItem(s.id));
    localStorage.removeItem('scenarioList');
  },

  // Exports a scenario as a human-readable text string
  exportScenarioAsText: (scenario: Scenario): string => {
    let output = `--- Customs Cost Scenario: ${scenario.generalInfo.nameOfGoods || 'Unnamed Scenario'} ---\n`;
    output += `Date: ${new Date().toLocaleString()}\n\n`;

    output += '--- General Info ---\n';
    output += `Name of Goods: ${scenario.generalInfo.nameOfGoods}\n`;
    output += `HS Code: ${scenario.generalInfo.hsCode}\n`;
    output += `Origin Country: ${scenario.generalInfo.originCountry}\n`;
    output += `Origin Currency: ${scenario.generalInfo.originCurrency}\n`;
    output += `EX-Works Unit Price (${scenario.generalInfo.originCurrency}): ${scenario.generalInfo.exwUnitPriceOrigin.toFixed(2)}\n`;
    output += `Quantity: ${scenario.generalInfo.quantity}\n`;
    output += `FX Rate (Origin to USD, with spread): ${scenario.calculations.fxRateToUsd.toFixed(4)}\n`;
    output += `Aduana USD/CLP T/C: ${scenario.calculations.tcUsdClp.toFixed(2)}\n`;
    output += `EX-Works Total (USD): ${scenario.calculations.exwTotalUsd.toFixed(2)}\n`;
    output += `EX-Works Total (CLP): ${Math.round(scenario.calculations.exwTotalClp).toLocaleString('es-CL')}\n\n`;

    output += '--- Parcel Info ---\n';
    output += `Dimensions (L/W/H cm): ${scenario.parcelInfo.lengthCm} / ${scenario.parcelInfo.widthCm} / ${scenario.parcelInfo.heightCm}\n`;
    output += `Actual Weight (kg): ${scenario.parcelInfo.actualWeightKg.toFixed(2)}\n`;
    output += `Volumetric Weight (kg): ${scenario.calculations.volumetricWeightKg.toFixed(2)}\n`;
    output += `Chargeable Weight (kg): ${scenario.calculations.chargeableWeightKg.toFixed(2)}\n`;
    output += `Courier: ${scenario.parcelInfo.courier}\n`;
    output += `Origin City/Postcode: ${scenario.parcelInfo.originCityPostcode}\n`;
    output += `Destination City/Postcode: ${scenario.parcelInfo.destinationCityPostcode}\n`;
    output += `Shipment Date: ${scenario.parcelInfo.shipmentDate}\n`;
    const selectedQuote = scenario.calculations.courierQuotes.find(q => q.id === scenario.parcelInfo.selectedCourierRateId);
    if (selectedQuote) {
      output += `Selected Freight Quote: ${selectedQuote.provider} - ${selectedQuote.serviceLevel} (${selectedQuote.price.toFixed(2)} ${selectedQuote.currency}, ${selectedQuote.transitTimeDays} days)\n\n`;
    } else {
      output += 'No freight quote selected.\n\n';
    }


    output += '--- CIF Price ---\n';
    output += `Freight (USD): ${scenario.calculations.freightUsd.toFixed(2)}\n`;
    output += `Insurance Rate (%): ${(scenario.cifPrice.insuranceRate * 100).toFixed(2)}\n`;
    output += `Insurance (USD): ${scenario.calculations.insuranceUsd.toFixed(2)}\n`;
    output += `CIF Price (USD): ${scenario.calculations.cifUsd.toFixed(2)}\n`;
    output += `CIF Price (CLP): ${Math.round(scenario.calculations.cifClp).toLocaleString('es-CL')}\n\n`;

    output += '--- Chile Customs + Other Costs ---\n';
    output += `Ad Valorem Rate (%): ${(scenario.chileCustoms.adValoremRate * 100).toFixed(2)}\n`;
    output += `IVA Rate (%): ${(scenario.chileCustoms.ivaRate * 100).toFixed(2)}\n`;
    output += `Duties (Ad Valorem) (CLP): ${Math.round(scenario.calculations.dutiesClp).toLocaleString('es-CL')}\n`;
    output += `IVA Aduanero (CLP): ${Math.round(scenario.calculations.ivaAduaneroClp).toLocaleString('es-CL')}\n`;
    output += `Total G.C.P. (Impuestos) (CLP): ${Math.round(scenario.calculations.totalGcpClp).toLocaleString('es-CL')}\n\n`;

    output += 'Service Items:\n';
    scenario.chileCustoms.serviceItems.forEach(item => {
      output += `- ${item.name} (${item.vatTaxable ? 'VAT Taxable' : 'Non-Taxable'}): ${Math.round(item.amountClp).toLocaleString('es-CL')} CLP\n`;
    });
    output += `National Delivery (CLP): ${Math.round(scenario.chileCustoms.nationalDeliveryClp).toLocaleString('es-CL')} (${scenario.chileCustoms.nationalDeliveryVatTaxable ? 'VAT Taxable' : 'Non-Taxable'})\n`;
    output += `IVA Servicios (CLP): ${Math.round(scenario.calculations.ivaServiciosClp).toLocaleString('es-CL')}\n`;
    output += `Total Desembolsos (Servicios) (CLP): ${Math.round(scenario.calculations.totalDesembolsosClp).toLocaleString('es-CL')}\n`;
    output += `Total Provisión Fondos (CLP): ${Math.round(scenario.calculations.totalProvisionFondosClp).toLocaleString('es-CL')}\n\n`;

    output += '--- Totals & Unit Economics ---\n';
    output += `TOTAL COST CHILE (CLP): ${Math.round(scenario.calculations.totalCostChileClp).toLocaleString('es-CL')}\n`;
    output += `TOTAL COST CHILE (USD): ${scenario.calculations.totalCostChileUsd.toFixed(2)}\n`;
    output += `Unit Cost (CLP): ${Math.round(scenario.calculations.unitCostClp).toLocaleString('es-CL')}\n`;
    output += `Unit Cost (USD): ${scenario.calculations.unitCostUsd.toFixed(2)}\n\n`;

    output += '--- Markup & Profit ---\n';
    output += `Markup Percentage (%): ${(scenario.markup.markupPercentage * 100).toFixed(2)}\n`;
    output += `Total Sales Price (USD): ${scenario.calculations.totalSalesPriceUsd.toFixed(2)}\n`;
    output += `Total Sales Price (CLP): ${Math.round(scenario.calculations.totalSalesPriceClp).toLocaleString('es-CL')}\n`;
    output += `Unit Sales Price (USD): ${scenario.calculations.unitSalesPriceUsd.toFixed(2)}\n`;
    output += `Unit Sales Price (CLP): ${Math.round(scenario.calculations.unitSalesPriceClp).toLocaleString('es-CL')}\n`;
    output += `Total Profit (USD): ${scenario.calculations.totalProfitUsd.toFixed(2)}\n`;
    output += `Total Profit (CLP): ${Math.round(scenario.calculations.totalProfitClp).toLocaleString('es-CL')}\n`;
    output += `Unit Profit (USD): ${scenario.calculations.unitProfitUsd.toFixed(2)}\n`;
    output += `Unit Profit (CLP): ${Math.round(scenario.calculations.unitProfitClp).toLocaleString('es-CL')}\n\n`;

    output += '--- End of Scenario ---';

    return output;
  }
};
