
import React, { useEffect } from 'react';
// FIX: Import Currency enum
import { CIFPrice, Scenario, Currency } from '../../types';
import Input from '../common/Input';
import CurrencyInput from '../common/CurrencyInput';
import CurrencyDisplay from '../common/CurrencyDisplay';
import { useScenario } from '../../hooks/useScenario.tsx';
import Tooltip from '../common/Tooltip';

interface CIFPriceStepProps {
  scenario: Scenario;
  updateScenario: (scenario: Scenario) => void;
}

const CIFPriceStep: React.FC<CIFPriceStepProps> = ({
  scenario,
  updateScenario,
}) => {
  const { calculateScenario } = useScenario();

  const handleCIFPriceChange = (key: keyof CIFPrice, value: number) => {
    updateScenario({
      ...scenario,
      cifPrice: { ...scenario.cifPrice, [key]: value },
    });
  };

  // Recalculate on every change in this step
  useEffect(() => {
    calculateScenario();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    scenario.cifPrice.insuranceRate,
    scenario.parcelInfo.selectedCourierRateId,
    scenario.generalInfo.quantity,
    scenario.generalInfo.exwUnitPriceOrigin,
  ]);

  const { cifPrice, calculations, generalInfo } = scenario;

  const insuranceTooltip = `Insurance calculated as ${cifPrice.insuranceRate * 100}% of EXW Total (${calculations.exwTotalUsd.toFixed(2)} USD).`;

  return (
    <div>
      <h3 className="text-xl font-semibold mb-4 text-gray-700">CIF Price Calculation</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <CurrencyInput
          id="freightUsd"
          label="Freight Cost (USD)"
          value={calculations.freightUsd}
          onChange={(val) => { /* Freight is derived, so no direct onChange from user input */ }}
          currencySymbol="USD"
          min={0}
          precision={2}
          disabled // Derived from courier rates
        />
        <CurrencyInput
          id="insuranceRate"
          label="Insurance Rate (%)"
          value={cifPrice.insuranceRate * 100}
          onChange={(val) => handleCIFPriceChange('insuranceRate', val / 100)}
          currencySymbol="%"
          min={0}
          precision={2}
        />
      </div>

      <div className="mt-8 p-4 bg-gray-50 rounded-md shadow-sm">
        <h4 className="text-lg font-semibold text-gray-700 mb-4">Derived CIF Values</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <CurrencyDisplay
            label="EXW Total Price (USD)"
            amount={calculations.exwTotalUsd}
            // FIX: Type '"USD"' is not assignable to type 'Currency'.
            currency={Currency.USD}
          />
          <CurrencyDisplay
            label="Freight (USD)"
            amount={calculations.freightUsd}
            // FIX: Type '"USD"' is not assignable to type 'Currency'.
            currency={Currency.USD}
          />
          <Tooltip text={insuranceTooltip}>
            <div className="cursor-help">
              <CurrencyDisplay
                label="Insurance (USD)"
                amount={calculations.insuranceUsd}
                // FIX: Type '"USD"' is not assignable to type 'Currency'.
                currency={Currency.USD}
              />
            </div>
          </Tooltip>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          <CurrencyDisplay
            label="CIF Price (USD)"
            amount={calculations.cifUsd}
            // FIX: Type '"USD"' is not assignable to type 'Currency'.
            currency={Currency.USD}
            className="col-span-1 md:col-span-2 lg:col-span-1"
          />
          <CurrencyDisplay
            label="CIF Price (CLP)"
            amount={calculations.cifClp}
            // FIX: Type '"CLP"' is not assignable to type 'Currency'.
            currency={Currency.CLP}
            className="col-span-1 md:col-span-2 lg:col-span-1"
          />
        </div>
      </div>
    </div>
  );
};

export default CIFPriceStep;
