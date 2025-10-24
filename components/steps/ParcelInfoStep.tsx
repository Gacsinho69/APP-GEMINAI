
import React, { useEffect, useState } from 'react';
import { CourierQuote, CourierType, ParcelInfo, Scenario, Currency } from '../../types';
import Input from '../common/Input';
import Select from '../common/Select';
import { DEFAULT_COURIER_OPTIONS } from '../../constants';
import { useScenario } from '../../hooks/useScenario.tsx';
import { courierService } from '../../services/courierService';
import CurrencyDisplay from '../common/CurrencyDisplay';
import Tooltip from '../common/Tooltip';
import LoadingSpinner from '../common/LoadingSpinner';

interface ParcelInfoStepProps {
  scenario: Scenario;
  updateScenario: (scenario: Scenario) => void;
}

const ParcelInfoStep: React.FC<ParcelInfoStepProps> = ({
  scenario,
  updateScenario,
}) => {
  const { adminConfig, calculateScenario } = useScenario();
  const [loadingQuotes, setLoadingQuotes] = useState(false);
  const [quotesError, setQuotesError] = useState<string | null>(null);

  const handleParcelInfoChange = (
    key: keyof ParcelInfo,
    value: string | number,
  ) => {
    updateScenario({
      ...scenario,
      parcelInfo: { ...scenario.parcelInfo, [key]: value },
    });
  };

  const fetchCourierQuotes = async () => {
    setLoadingQuotes(true);
    setQuotesError(null);
    try {
      const quotes = await courierService.getQuotes(
        scenario.parcelInfo,
        scenario.calculations.chargeableWeightKg,
        scenario.generalInfo.originCurrency,
        adminConfig.courierDivisors,
      );
      updateScenario({
        ...scenario,
        calculations: { ...scenario.calculations, courierQuotes: quotes },
        parcelInfo: { ...scenario.parcelInfo, selectedCourierRateId: undefined }, // Clear selection
      });
    } catch (error: any) {
      console.error('Failed to fetch courier quotes:', error);
      setQuotesError(error.message || 'Failed to fetch courier quotes.');
    } finally {
      setLoadingQuotes(false);
    }
  };

  // Recalculate on every change in this step
  useEffect(() => {
    calculateScenario();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    scenario.parcelInfo.lengthCm,
    scenario.parcelInfo.widthCm,
    scenario.parcelInfo.heightCm,
    scenario.parcelInfo.actualWeightKg,
    scenario.parcelInfo.courier,
    scenario.parcelInfo.selectedCourierRateId,
    adminConfig.courierDivisors,
  ]);

  const { parcelInfo, calculations } = scenario;

  const currentDivisor = adminConfig.courierDivisors.find(
    (cd) => cd.courier === parcelInfo.courier,
  )?.divisor || 5000; // Fallback to 5000 if not found

  const volumetricWeightCalcTooltip = `Calculated as (Length * Width * Height) / ${currentDivisor}. For ${parcelInfo.courier}.`;
  const chargeableWeightTooltip = `The higher of Actual Weight (${parcelInfo.actualWeightKg.toFixed(2)} kg) and Volumetric Weight (${calculations.volumetricWeightKg.toFixed(2)} kg).`;

  return (
    <div>
      <h3 className="text-xl font-semibold mb-4 text-gray-700">Parcel Information</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          id="lengthCm"
          label="Length (cm)"
          value={parcelInfo.lengthCm}
          onChange={(e) => handleParcelInfoChange('lengthCm', parseFloat(e.target.value) || 0)}
          type="number"
          min={0}
        />
        <Input
          id="widthCm"
          label="Width (cm)"
          value={parcelInfo.widthCm}
          onChange={(e) => handleParcelInfoChange('widthCm', parseFloat(e.target.value) || 0)}
          type="number"
          min={0}
        />
        <Input
          id="heightCm"
          label="Height (cm)"
          value={parcelInfo.heightCm}
          onChange={(e) => handleParcelInfoChange('heightCm', parseFloat(e.target.value) || 0)}
          type="number"
          min={0}
        />
        <Input
          id="actualWeightKg"
          label="Actual Weight (kg)"
          value={parcelInfo.actualWeightKg}
          onChange={(e) => handleParcelInfoChange('actualWeightKg', parseFloat(e.target.value) || 0)}
          type="number"
          min={0}
        />
        <Select
          id="courier"
          label="Courier"
          value={parcelInfo.courier}
          onChange={(e) => handleParcelInfoChange('courier', e.target.value as CourierType)}
          options={DEFAULT_COURIER_OPTIONS.map((c) => ({ value: c, label: c }))}
        />
        <Input
          id="originCityPostcode"
          label="Origin City/Postcode"
          value={parcelInfo.originCityPostcode}
          onChange={(e) => handleParcelInfoChange('originCityPostcode', e.target.value)}
          type="text"
          placeholder="e.g., Shanghai, 200000"
        />
        <Input
          id="destinationCityPostcode"
          label="Destination City/Postcode (Chile)"
          value={parcelInfo.destinationCityPostcode}
          onChange={(e) => handleParcelInfoChange('destinationCityPostcode', e.target.value)}
          type="text"
          placeholder="e.g., Santiago, 8320000"
          disabled // Assuming fixed destination for now
        />
        <Input
          id="shipmentDate"
          label="Shipment Date"
          value={parcelInfo.shipmentDate}
          onChange={(e) => handleParcelInfoChange('shipmentDate', e.target.value)}
          type="date"
        />
      </div>

      <div className="mt-8 p-4 bg-gray-50 rounded-md shadow-sm">
        <h4 className="text-lg font-semibold text-gray-700 mb-4">Derived Weights</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Tooltip text={volumetricWeightCalcTooltip}>
            <div className="bg-white p-3 rounded-md shadow-sm border border-gray-200 cursor-help">
              <p className="text-sm font-medium text-gray-600">Volumetric Weight (kg)</p>
              <p className="text-lg font-bold text-gray-800">
                {calculations.volumetricWeightKg.toFixed(2)} kg
              </p>
            </div>
          </Tooltip>
          <Tooltip text={chargeableWeightTooltip}>
            <div className="bg-white p-3 rounded-md shadow-sm border border-gray-200 cursor-help">
              <p className="text-sm font-medium text-gray-600">Chargeable Weight (kg)</p>
              <p className="text-lg font-bold text-gray-800">
                {calculations.chargeableWeightKg.toFixed(2)} kg
                {calculations.chargeableWeightKg === calculations.volumetricWeightKg && (
                  <span className="text-xs text-blue-600 ml-2">(Volumétrico)</span>
                )}
                {calculations.chargeableWeightKg === parcelInfo.actualWeightKg &&
                  parcelInfo.actualWeightKg > 0 && (
                    <span className="text-xs text-blue-600 ml-2">(Real)</span>
                  )}
              </p>
            </div>
          </Tooltip>
        </div>
      </div>

      <div className="mt-8 p-4 bg-slate-50 rounded-lg shadow-sm border border-slate-200">
        <h4 className="text-lg font-semibold text-slate-700 mb-4">Tarifas de Courier</h4>
        <button
          onClick={fetchCourierQuotes}
          disabled={loadingQuotes || calculations.chargeableWeightKg <= 0}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md mb-4 font-medium"
        >
          {loadingQuotes ? <LoadingSpinner /> : 'Obtener Tarifas de Courier'}
        </button>

        {quotesError && <p className="text-red-500 mb-4">{quotesError}</p>}

        {calculations.courierQuotes.length > 0 && (
          <div className="space-y-4">
            {calculations.courierQuotes.map((quote: CourierQuote) => (
              <div
                key={quote.id}
                className={`p-4 border rounded-lg shadow-sm transition-all
                  ${parcelInfo.selectedCourierRateId === quote.id
                    ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-slate-800 text-lg">
                      {quote.provider} - {quote.serviceLevel}
                    </p>
                    <p className="text-sm text-slate-600">
                      Tiempo de tránsito: {quote.transitTimeDays} días
                    </p>
                  </div>
                  <div className="text-right">
                    <CurrencyDisplay
                      amount={quote.price}
                      // FIX: Remove unnecessary and incorrect type cast
                      currency={quote.currency}
                      className="text-xl"
                    />
                    <button
                      onClick={() => handleParcelInfoChange('selectedCourierRateId', quote.id)}
                      className={`ml-4 px-3 py-1 text-sm rounded-md font-medium
                        ${parcelInfo.selectedCourierRateId === quote.id
                          ? 'bg-emerald-500 text-white'
                          : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                        }`}
                    >
                      {parcelInfo.selectedCourierRateId === quote.id ? 'Seleccionado' : 'Seleccionar'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ParcelInfoStep;
