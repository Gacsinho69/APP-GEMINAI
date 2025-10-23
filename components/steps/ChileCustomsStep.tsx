
import React, { useEffect } from 'react';
// FIX: Import Currency enum
import { ChileCustoms, Scenario, ServiceItem, Currency } from '../../types';
import CurrencyInput from '../common/CurrencyInput';
import Input from '../common/Input';
import CurrencyDisplay from '../common/CurrencyDisplay';
import { useScenario } from '../../hooks/useScenario.tsx';
import Tooltip from '../common/Tooltip';

interface ChileCustomsStepProps {
  scenario: Scenario;
  updateScenario: (scenario: Scenario) => void;
}

const ChileCustomsStep: React.FC<ChileCustomsStepProps> = ({
  scenario,
  updateScenario,
}) => {
  const { adminConfig, calculateScenario } = useScenario();

  const handleChileCustomsChange = (
    key: keyof ChileCustoms,
    value: number | boolean,
  ) => {
    updateScenario({
      ...scenario,
      chileCustoms: { ...scenario.chileCustoms, [key]: value },
    });
  };

  const handleServiceItemAmountChange = (id: string, amount: number) => {
    const updatedServiceItems = scenario.chileCustoms.serviceItems.map((item) =>
      item.id === id ? { ...item, amountClp: amount } : item,
    );
    updateScenario({
      ...scenario,
      chileCustoms: { ...scenario.chileCustoms, serviceItems: updatedServiceItems },
    });
  };

  const handleNationalDeliveryVatTaxableChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    handleChileCustomsChange('nationalDeliveryVatTaxable', e.target.checked);
  };

  // Recalculate on every change in this step
  useEffect(() => {
    // Ensure service items are initialized from adminConfig if they are missing or outdated
    const currentServiceItemsMap = new Map(
      scenario.chileCustoms.serviceItems.map((item) => [item.id, item]),
    );
    const updatedServiceItems: ServiceItem[] = adminConfig.serviceFees.map(
      (sf) => {
        const existingItem = currentServiceItemsMap.get(sf.id);
        return {
          id: sf.id,
          name: sf.name,
          // Fix: Explicitly cast existingItem to ServiceItem to resolve 'unknown' type error.
          amountClp: (existingItem as ServiceItem)?.amountClp || 0,
          vatTaxable: sf.vatTaxable, // Use admin config's VAT taxable status
        };
      },
    );

    let needsUpdate = false;
    if (updatedServiceItems.length !== scenario.chileCustoms.serviceItems.length) {
      needsUpdate = true;
    } else {
      for (let i = 0; i < updatedServiceItems.length; i++) {
        if (
          updatedServiceItems[i].name !== scenario.chileCustoms.serviceItems[i].name ||
          updatedServiceItems[i].vatTaxable !== scenario.chileCustoms.serviceItems[i].vatTaxable
        ) {
          needsUpdate = true;
          break;
        }
      }
    }

    if (needsUpdate) {
      updateScenario({
        ...scenario,
        chileCustoms: { ...scenario.chileCustoms, serviceItems: updatedServiceItems },
      });
    }

    calculateScenario();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scenario.chileCustoms, scenario.generalInfo.hsCode, scenario.generalInfo.originCountry, adminConfig]);

  const { chileCustoms, calculations } = scenario;

  const adValoremTooltip = `Duties calculated as ${chileCustoms.adValoremRate * 100}% of CIF Price (${calculations.cifClp.toFixed(0)} CLP).`;
  const ivaAduaneroTooltip = `IVA Aduanero calculated as ${chileCustoms.ivaRate * 100}% of (CIF Price + Duties) (${calculations.cifClp.toFixed(0)} CLP + ${calculations.dutiesClp.toFixed(0)} CLP).`;
  const ivaServiciosTooltip = `IVA Servicios calculated as ${chileCustoms.ivaRate * 100}% of VAT-taxable service items.`;

  return (
    <div>
      <h3 className="text-xl font-semibold mb-4 text-gray-700">Chile Customs & Other Costs</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <CurrencyInput
          id="adValoremRate"
          label="Ad Valorem Rate (%)"
          value={chileCustoms.adValoremRate * 100}
          onChange={(val) => handleChileCustomsChange('adValoremRate', val / 100)}
          currencySymbol="%"
          min={0}
          precision={2}
        />
        <CurrencyInput
          id="ivaRate"
          label="IVA Rate (%)"
          value={chileCustoms.ivaRate * 100}
          onChange={(val) => handleChileCustomsChange('ivaRate', val / 100)}
          currencySymbol="%"
          min={0}
          precision={2}
        />
      </div>

      <div className="mt-8 p-4 bg-gray-50 rounded-md shadow-sm">
        <h4 className="text-lg font-semibold text-gray-700 mb-4">Service Items (CLP)</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {chileCustoms.serviceItems.map((item) => (
            <CurrencyInput
              key={item.id}
              id={`service-${item.id}`}
              label={`${item.name} ${item.vatTaxable ? '(VAT Taxable)' : '(Non-Taxable)'}`}
              value={item.amountClp}
              onChange={(val) => handleServiceItemAmountChange(item.id, val)}
              currencySymbol="CLP"
              min={0}
              precision={0}
            />
          ))}
          <div className="col-span-1 md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
            <CurrencyInput
              id="nationalDeliveryClp"
              label="National Delivery (CLP)"
              value={chileCustoms.nationalDeliveryClp}
              onChange={(val) => handleChileCustomsChange('nationalDeliveryClp', val)}
              currencySymbol="CLP"
              min={0}
              precision={0}
            />
            <div className="flex items-center self-end mb-4">
              <input
                id="nationalDeliveryVatTaxable"
                type="checkbox"
                checked={chileCustoms.nationalDeliveryVatTaxable}
                onChange={handleNationalDeliveryVatTaxableChange}
                className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
              />
              <label
                htmlFor="nationalDeliveryVatTaxable"
                className="ml-2 block text-sm text-gray-900"
              >
                National Delivery is VAT Taxable
              </label>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 p-4 bg-gray-50 rounded-md shadow-sm">
        <h4 className="text-lg font-semibold text-gray-700 mb-4">Derived Chile Customs & Costs</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Tooltip text={adValoremTooltip}>
            <div className="cursor-help">
              <CurrencyDisplay
                label="Duties (Ad Valorem)"
                amount={calculations.dutiesClp}
                // FIX: Type '"CLP"' is not assignable to type 'Currency'.
                currency={Currency.CLP}
              />
            </div>
          </Tooltip>
          <Tooltip text={ivaAduaneroTooltip}>
            <div className="cursor-help">
              <CurrencyDisplay
                label="IVA Aduanero"
                amount={calculations.ivaAduaneroClp}
                // FIX: Type '"CLP"' is not assignable to type 'Currency'.
                currency={Currency.CLP}
              />
            </div>
          </Tooltip>
          <CurrencyDisplay
            label="Total G.C.P. (Impuestos)"
            amount={calculations.totalGcpClp}
            // FIX: Type '"CLP"' is not assignable to type 'Currency'.
            currency={Currency.CLP}
            className="font-bold text-lg"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          <Tooltip text={ivaServiciosTooltip}>
            <div className="cursor-help">
              <CurrencyDisplay
                label="IVA Servicios"
                amount={calculations.ivaServiciosClp}
                // FIX: Type '"CLP"' is not assignable to type 'Currency'.
                currency={Currency.CLP}
              />
            </div>
          </Tooltip>
          <CurrencyDisplay
            label="Total Desembolsos (Servicios)"
            amount={calculations.totalDesembolsosClp}
            // FIX: Type '"CLP"' is not assignable to type 'Currency'.
            currency={Currency.CLP}
            className="font-bold text-lg"
          />
          <CurrencyDisplay
            label="Total Provisión Fondos"
            amount={calculations.totalProvisionFondosClp}
            // FIX: Type '"CLP"' is not assignable to type 'Currency'.
            currency={Currency.CLP}
            className="font-bold text-xl text-indigo-700"
          />
        </div>
      </div>
    </div>
  );
};

export default ChileCustomsStep;
