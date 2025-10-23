
import React, { useEffect } from 'react';
// FIX: Import Currency enum
import { Scenario, Currency } from '../../types';
import CurrencyDisplay from '../common/CurrencyDisplay';
import { useScenario } from '../../hooks/useScenario.tsx';
import Tooltip from '../common/Tooltip';

interface TotalsUnitEconomicsStepProps {
  scenario: Scenario;
  updateScenario: (scenario: Scenario) => void;
}

const TotalsUnitEconomicsStep: React.FC<TotalsUnitEconomicsStepProps> = ({
  scenario,
  updateScenario,
}) => {
  const { calculateScenario } = useScenario();

  useEffect(() => {
    calculateScenario();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    scenario.chileCustoms.nationalDeliveryClp,
    scenario.chileCustoms.serviceItems,
    scenario.chileCustoms.ivaRate,
    scenario.chileCustoms.adValoremRate,
  ]);

  const { calculations, generalInfo } = scenario;

  const totalCostChileTooltip = `Total Cost Chile (CLP) = Total G.C.P. (${calculations.totalGcpClp.toFixed(0)} CLP) + Total Desembolsos (${calculations.totalDesembolsosClp.toFixed(0)} CLP) + National Delivery (${scenario.chileCustoms.nationalDeliveryClp.toFixed(0)} CLP).`;
  const totalCostUsdTooltip = `Total Cost Chile (USD) = Total Cost Chile (CLP) / USD/CLP T/C (${calculations.tcUsdClp.toFixed(2)}).`;
  const unitCostUsdTooltip = `Unit Cost (USD) = Total Cost Chile (USD) / Quantity (${generalInfo.quantity}).`;
  const unitCostClpTooltip = `Unit Cost (CLP) = Total Cost Chile (CLP) / Quantity (${generalInfo.quantity}).`;

  return (
    <div>
      <h3 className="text-xl font-semibold mb-4 text-gray-700">Totals & Unit Economics</h3>

      <div className="mt-8 p-4 bg-gray-50 rounded-md shadow-sm">
        <h4 className="text-lg font-semibold text-gray-700 mb-4">Overall Costs</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <CurrencyDisplay
            label="CIF Price (USD)"
            amount={calculations.cifUsd}
            // FIX: Type '"USD"' is not assignable to type 'Currency'.
            currency={Currency.USD}
          />
          <CurrencyDisplay
            label="Total G.C.P. (Impuestos)"
            amount={calculations.totalGcpClp}
            // FIX: Type '"CLP"' is not assignable to type 'Currency'.
            currency={Currency.CLP}
          />
          <CurrencyDisplay
            label="Total Desembolsos (Servicios)"
            amount={calculations.totalDesembolsosClp}
            // FIX: Type '"CLP"' is not assignable to type 'Currency'.
            currency={Currency.CLP}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          <Tooltip text={totalCostChileTooltip}>
            <div className="cursor-help">
              <CurrencyDisplay
                label="TOTAL COST CHILE (CLP)"
                amount={calculations.totalCostChileClp}
                // FIX: Type '"CLP"' is not assignable to type 'Currency'.
                currency={Currency.CLP}
                className="font-bold text-xl text-indigo-700"
              />
            </div>
          </Tooltip>
          <Tooltip text={totalCostUsdTooltip}>
            <div className="cursor-help">
              <CurrencyDisplay
                label="TOTAL COST CHILE (USD)"
                amount={calculations.totalCostChileUsd}
                // FIX: Type '"USD"' is not assignable to type 'Currency'.
                currency={Currency.USD}
                className="font-bold text-xl text-indigo-700"
              />
            </div>
          </Tooltip>
        </div>
      </div>

      <div className="mt-8 p-4 bg-gray-50 rounded-md shadow-sm">
        <h4 className="text-lg font-semibold text-gray-700 mb-4">Unit Costs</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Tooltip text={unitCostUsdTooltip}>
            <div className="cursor-help">
              <CurrencyDisplay
                label="Unit Cost (USD)"
                amount={calculations.unitCostUsd}
                // FIX: Type '"USD"' is not assignable to type 'Currency'.
                currency={Currency.USD}
                className="font-bold text-lg"
              />
            </div>
          </Tooltip>
          <Tooltip text={unitCostClpTooltip}>
            <div className="cursor-help">
              <CurrencyDisplay
                label="Unit Cost (CLP)"
                amount={calculations.unitCostClp}
                // FIX: Type '"CLP"' is not assignable to type 'Currency'.
                currency={Currency.CLP}
                className="font-bold text-lg"
              />
            </div>
          </Tooltip>
          <div className="bg-white p-3 rounded-md shadow-sm border border-gray-200">
            <p className="text-sm font-medium text-gray-600">Quantity</p>
            <p className="text-lg font-bold text-gray-800">{generalInfo.quantity}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TotalsUnitEconomicsStep;
