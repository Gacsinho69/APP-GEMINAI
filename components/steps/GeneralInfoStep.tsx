
import React, { useEffect } from 'react';
import { Currency, GeneralInfo, Scenario } from '../../types';
import Input from '../common/Input';
import Select from '../common/Select';
import CurrencyInput from '../common/CurrencyInput';
import CurrencyDisplay from '../common/CurrencyDisplay';
import { DEFAULT_CURRENCY_OPTIONS } from '../../constants';
import { useScenario } from '../../hooks/useScenario.tsx';
import Tooltip from '../common/Tooltip';

interface GeneralInfoStepProps {
  scenario: Scenario;
  updateScenario: (scenario: Scenario) => void;
}

const GeneralInfoStep: React.FC<GeneralInfoStepProps> = ({
  scenario,
  updateScenario,
}) => {
  const { adminConfig, calculateScenario } = useScenario();

  const handleGeneralInfoChange = (
    key: keyof GeneralInfo,
    value: string | number,
  ) => {
    updateScenario({
      ...scenario,
      generalInfo: { ...scenario.generalInfo, [key]: value },
    });
  };

  // Recalculate on every change in this step
  useEffect(() => {
    calculateScenario();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scenario.generalInfo, adminConfig]);

  const currencyOptions = DEFAULT_CURRENCY_OPTIONS.map((c) => ({
    value: c,
    label: c,
  }));

  const { generalInfo, calculations } = scenario;

  return (
    <div>
      <h3 className="text-xl font-semibold mb-4 text-gray-700">General Information</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          id="nameOfGoods"
          label="Name of Goods"
          value={generalInfo.nameOfGoods}
          onChange={(e) =>
            handleGeneralInfoChange('nameOfGoods', e.target.value)
          }
          type="text"
          placeholder="e.g., Laptop, T-shirts"
        />
        <Input
          id="hsCode"
          label="HS Code (Optional)"
          value={generalInfo.hsCode}
          onChange={(e) => handleGeneralInfoChange('hsCode', e.target.value)}
          type="text"
          placeholder="e.g., 8471.30.00"
        />
        <Input
          id="originCountry"
          label="Origin Country"
          value={generalInfo.originCountry}
          onChange={(e) =>
            handleGeneralInfoChange('originCountry', e.target.value)
          }
          type="text"
          placeholder="e.g., China, USA"
        />
        <Select
          id="originCurrency"
          label="Origin Currency"
          value={generalInfo.originCurrency}
          onChange={(e) =>
            handleGeneralInfoChange(
              'originCurrency',
              e.target.value as Currency,
            )
          }
          options={currencyOptions}
        />
        <CurrencyInput
          id="exwUnitPriceOrigin"
          label={`EX-Works Unit Price (${generalInfo.originCurrency})`}
          value={generalInfo.exwUnitPriceOrigin}
          onChange={(val) => handleGeneralInfoChange('exwUnitPriceOrigin', val)}
          currencySymbol={generalInfo.originCurrency}
          min={0}
          precision={2}
        />
        <Input
          id="quantity"
          label="Quantity"
          value={generalInfo.quantity}
          onChange={(e) => {
            const val = parseInt(e.target.value, 10);
            handleGeneralInfoChange('quantity', isNaN(val) || val < 1 ? 1 : val);
          }}
          type="number"
          min={1}
        />
      </div>

      <div className="mt-8 p-4 bg-gray-50 rounded-md shadow-sm">
        <h4 className="text-lg font-semibold text-gray-700 mb-4">Derived Values</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <CurrencyDisplay
            label="EXW Unit Price (USD)"
            amount={calculations.exwUnitUsd}
            // FIX: Type '"USD"' is not assignable to type 'Currency'.
            currency={Currency.USD}
          />
          <CurrencyDisplay
            label="EXW Total Price (USD)"
            amount={calculations.exwTotalUsd}
            // FIX: Type '"USD"' is not assignable to type 'Currency'.
            currency={Currency.USD}
          />
          <Tooltip text={`Exchange Rate (FX) used: 1 ${generalInfo.originCurrency} = ${calculations.fxRateToUsd?.toFixed(4)} USD (with ${adminConfig.fxSpreadPercentage * 100}% spread).`}>
            <div className="cursor-help">
              <CurrencyDisplay
                label="USD/CLP T/C (Aduanas)"
                amount={calculations.tcUsdClp}
                // FIX: Type '"CLP"' is not assignable to type 'Currency'.
                currency={Currency.CLP} // Displaying rate, not actual CLP amount
              />
            </div>
          </Tooltip>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          <CurrencyDisplay
            label="EXW Unit Price (CLP)"
            amount={calculations.exwUnitClp}
            // FIX: Type '"CLP"' is not assignable to type 'Currency'.
            currency={Currency.CLP}
          />
          <CurrencyDisplay
            label="EXW Total Price (CLP)"
            amount={calculations.exwTotalClp}
            // FIX: Type '"CLP"' is not assignable to type 'Currency'.
            currency={Currency.CLP}
          />
        </div>
      </div>
    </div>
  );
};

export default GeneralInfoStep;
