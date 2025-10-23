
import React, { useEffect } from 'react';
// FIX: Import Currency enum
import { Markup, Scenario, Currency } from '../../types';
import CurrencyInput from '../common/CurrencyInput';
import CurrencyDisplay from '../common/CurrencyDisplay';
import { useScenario } from '../../hooks/useScenario.tsx';
import Tooltip from '../common/Tooltip';

interface MarkupProfitStepProps {
  scenario: Scenario;
  updateScenario: (scenario: Scenario) => void;
}

const MarkupProfitStep: React.FC<MarkupProfitStepProps> = ({
  scenario,
  updateScenario,
}) => {
  const { calculateScenario } = useScenario();

  const handleMarkupChange = (key: keyof Markup, value: number) => {
    updateScenario({
      ...scenario,
      markup: { ...scenario.markup, [key]: value },
    });
  };

  useEffect(() => {
    calculateScenario();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scenario.markup.markupPercentage, scenario.calculations.totalCostChileUsd]);

  const { markup, calculations, generalInfo } = scenario;

  const totalSalesPriceUsdTooltip = `Total Sales Price (USD) = Total Cost Chile (USD) * (1 + Markup (${markup.markupPercentage * 100}%)).`;
  const unitSalesPriceUsdTooltip = `Unit Sales Price (USD) = Total Sales Price (USD) / Quantity (${generalInfo.quantity}).`;
  const totalProfitUsdTooltip = `Total Profit (USD) = Total Sales Price (USD) - Total Cost Chile (USD).`;
  const unitProfitUsdTooltip = `Unit Profit (USD) = Total Profit (USD) / Quantity (${generalInfo.quantity}).`;

  return (
    <div>
      <h3 className="text-xl font-semibold mb-4 text-gray-700">Markup & Profit</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <CurrencyInput
          id="markupPercentage"
          label="Markup Percentage (%)"
          value={markup.markupPercentage * 100}
          onChange={(val) => handleMarkupChange('markupPercentage', val / 100)}
          currencySymbol="%"
          min={0}
          precision={2}
        />
      </div>

      <div className="mt-8 p-4 bg-gray-50 rounded-md shadow-sm">
        <h4 className="text-lg font-semibold text-gray-700 mb-4">Sales Price</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <CurrencyDisplay
            label="Total Cost Chile (USD)"
            amount={calculations.totalCostChileUsd}
            // FIX: Type '"USD"' is not assignable to type 'Currency'.
            currency={Currency.USD}
          />
          <Tooltip text={totalSalesPriceUsdTooltip}>
            <div className="cursor-help">
              <CurrencyDisplay
                label="Total Sales Price (USD)"
                amount={calculations.totalSalesPriceUsd}
                // FIX: Type '"USD"' is not assignable to type 'Currency'.
                currency={Currency.USD}
                className="font-bold text-lg"
              />
            </div>
          </Tooltip>
          <CurrencyDisplay
            label="Total Sales Price (CLP)"
            amount={calculations.totalSalesPriceClp}
            // FIX: Type '"CLP"' is not assignable to type 'Currency'.
            currency={Currency.CLP}
            className="font-bold text-lg"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          <CurrencyDisplay
            label="Unit Cost (USD)"
            amount={calculations.unitCostUsd}
            // FIX: Type '"USD"' is not assignable to type 'Currency'.
            currency={Currency.USD}
          />
          <Tooltip text={unitSalesPriceUsdTooltip}>
            <div className="cursor-help">
              <CurrencyDisplay
                label="Unit Sales Price (USD)"
                amount={calculations.unitSalesPriceUsd}
                // FIX: Type '"USD"' is not assignable to type 'Currency'.
                currency={Currency.USD}
                className="font-bold text-lg"
              />
            </div>
          </Tooltip>
          <CurrencyDisplay
            label="Unit Sales Price (CLP)"
            amount={calculations.unitSalesPriceClp}
            // FIX: Type '"CLP"' is not assignable to type 'Currency'.
            currency={Currency.CLP}
            className="font-bold text-lg"
          />
        </div>
      </div>

      <div className="mt-8 p-4 bg-gray-50 rounded-md shadow-sm">
        <h4 className="text-lg font-semibold text-gray-700 mb-4">Profit</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Tooltip text={totalProfitUsdTooltip}>
            <div className="cursor-help">
              <CurrencyDisplay
                label="Total Profit (USD)"
                amount={calculations.totalProfitUsd}
                // FIX: Type '"USD"' is not assignable to type 'Currency'.
                currency={Currency.USD}
                className="font-bold text-xl text-green-700"
              />
            </div>
          </Tooltip>
          <CurrencyDisplay
            label="Total Profit (CLP)"
            amount={calculations.totalProfitClp}
            // FIX: Type '"CLP"' is not assignable to type 'Currency'.
            currency={Currency.CLP}
            className="font-bold text-xl text-green-700"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          <Tooltip text={unitProfitUsdTooltip}>
            <div className="cursor-help">
              <CurrencyDisplay
                label="Unit Profit (USD)"
                amount={calculations.unitProfitUsd}
                // FIX: Type '"USD"' is not assignable to type 'Currency'.
                currency={Currency.USD}
                className="font-bold text-lg text-green-600"
              />
            </div>
          </Tooltip>
          <CurrencyDisplay
            label="Unit Profit (CLP)"
            amount={calculations.unitProfitClp}
            // FIX: Type '"CLP"' is not assignable to type 'Currency'.
            currency={Currency.CLP}
            className="font-bold text-lg text-green-600"
          />
        </div>
      </div>
    </div>
  );
};

export default MarkupProfitStep;
