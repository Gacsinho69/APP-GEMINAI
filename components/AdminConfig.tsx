
import React, { useState } from 'react';
import { useScenario } from '../hooks/useScenario.tsx';
import {
  AdminConfigState,
  AdValoremRateConfig,
  CourierDivisorConfig,
  CourierType,
  ServiceFeeBracket,
  ServiceFeeConfig,
} from '../types';
import { DEFAULT_COURIER_OPTIONS } from '../constants';
import Tooltip from './common/Tooltip';

const AdminConfig: React.FC = () => {
  const { adminConfig, updateAdminConfig } = useScenario();
  const [currentConfig, setCurrentConfig] =
    useState<AdminConfigState>(adminConfig);

  const handleNumericChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    key: keyof AdminConfigState,
    isPercentage: boolean = false,
  ) => {
    let value = parseFloat(e.target.value);
    if (isNaN(value)) value = 0;
    if (isPercentage) value /= 100; // Store as decimal

    setCurrentConfig((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleAdValoremChange = (
    index: number,
    key: keyof AdValoremRateConfig,
    value: string | number,
  ) => {
    const updatedRates = [...currentConfig.adValoremRates];
    if (key === 'rate' && typeof value === 'string') {
      let numValue = parseFloat(value);
      if (isNaN(numValue)) numValue = 0;
      numValue /= 100; // Store as decimal
      updatedRates[index] = { ...updatedRates[index], [key]: numValue };
    } else {
      updatedRates[index] = { ...updatedRates[index], [key]: value };
    }
    setCurrentConfig((prev) => ({ ...prev, adValoremRates: updatedRates }));
  };

  const addAdValoremRate = () => {
    setCurrentConfig((prev) => ({
      ...prev,
      adValoremRates: [
        ...prev.adValoremRates,
        {
          id: `av-${Date.now()}`,
          hsCodePrefix: '',
          originCountry: '',
          rate: 0.06,
        },
      ],
    }));
  };

  const removeAdValoremRate = (id: string) => {
    setCurrentConfig((prev) => ({
      ...prev,
      adValoremRates: prev.adValoremRates.filter((rate) => rate.id !== id),
    }));
  };

  const handleServiceFeeChange = (
    index: number,
    key: keyof ServiceFeeConfig,
    value: string | number | boolean,
  ) => {
    const updatedFees = [...currentConfig.serviceFees];
    updatedFees[index] = { ...updatedFees[index], [key]: value };
    setCurrentConfig((prev) => ({ ...prev, serviceFees: updatedFees }));
  };

  const addServiceFee = () => {
    setCurrentConfig((prev) => ({
      ...prev,
      serviceFees: [
        ...prev.serviceFees,
        {
          id: `sf-${Date.now()}`,
          name: 'New Service',
          baseAmountClp: 0,
          perKgRateClp: 0,
          brackets: [],
          vatTaxable: false,
        },
      ],
    }));
  };

  const removeServiceFee = (id: string) => {
    setCurrentConfig((prev) => ({
      ...prev,
      serviceFees: prev.serviceFees.filter((fee) => fee.id !== id),
    }));
  };

  const handleServiceFeeBracketChange = (
    feeIndex: number,
    bracketIndex: number,
    key: keyof ServiceFeeBracket,
    value: string | number,
  ) => {
    const updatedFees = [...currentConfig.serviceFees];
    const updatedBrackets = [...updatedFees[feeIndex].brackets];
    updatedBrackets[bracketIndex] = {
      ...updatedBrackets[bracketIndex],
      [key]: parseFloat(value as string) || 0,
    };
    updatedFees[feeIndex] = { ...updatedFees[feeIndex], brackets: updatedBrackets };
    setCurrentConfig((prev) => ({ ...prev, serviceFees: updatedFees }));
  };

  const addServiceFeeBracket = (feeIndex: number) => {
    const updatedFees = [...currentConfig.serviceFees];
    updatedFees[feeIndex] = {
      ...updatedFees[feeIndex],
      brackets: [
        ...updatedFees[feeIndex].brackets,
        { minChargeableWeightKg: 0, maxChargeableWeightKg: 0, amountClp: 0 },
      ],
    };
    setCurrentConfig((prev) => ({ ...prev, serviceFees: updatedFees }));
  };

  const removeServiceFeeBracket = (feeIndex: number, bracketIndex: number) => {
    const updatedFees = [...currentConfig.serviceFees];
    updatedFees[feeIndex] = {
      ...updatedFees[feeIndex],
      brackets: updatedFees[feeIndex].brackets.filter(
        (_, i) => i !== bracketIndex,
      ),
    };
    setCurrentConfig((prev) => ({ ...prev, serviceFees: updatedFees }));
  };

  const handleCourierDivisorChange = (
    index: number,
    key: keyof CourierDivisorConfig,
    value: string | number,
  ) => {
    const updatedDivisors = [...currentConfig.courierDivisors];
    updatedDivisors[index] = { ...updatedDivisors[index], [key]: value };
    setCurrentConfig((prev) => ({ ...prev, courierDivisors: updatedDivisors }));
  };

  const addCourierDivisor = () => {
    setCurrentConfig((prev) => ({
      ...prev,
      courierDivisors: [
        ...prev.courierDivisors,
        {
          id: `cd-${Date.now()}`,
          courier: CourierType.DHL,
          divisor: 5000,
          description: '',
        },
      ],
    }));
  };

  const removeCourierDivisor = (id: string) => {
    setCurrentConfig((prev) => ({
      ...prev,
      courierDivisors: prev.courierDivisors.filter((divisor) => divisor.id !== id),
    }));
  };

  const handleSave = () => {
    updateAdminConfig(currentConfig);
    alert('Admin configuration saved!');
  };

  return (
    <div className="p-4 space-y-8">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Admin Configuration</h2>

      {/* General Rates */}
      <section className="bg-gray-50 p-6 rounded-lg shadow-sm">
        <h3 className="text-xl font-semibold text-gray-700 mb-4">General Rates</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Default IVA Rate (%)
            </label>
            <input
              type="number"
              value={(currentConfig.defaultIvaRate * 100).toFixed(2)}
              onChange={(e) => handleNumericChange(e, 'defaultIvaRate', true)}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              min="0"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Default Insurance Rate (%)
            </label>
            <input
              type="number"
              value={(currentConfig.defaultInsuranceRate * 100).toFixed(2)}
              onChange={(e) => handleNumericChange(e, 'defaultInsuranceRate', true)}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              min="0"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              FX Spread Percentage (%)
            </label>
            <input
              type="number"
              value={(currentConfig.fxSpreadPercentage * 100).toFixed(2)}
              onChange={(e) => handleNumericChange(e, 'fxSpreadPercentage', true)}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              min="0"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Aduana USD/CLP Rate (Manual Override)
              <Tooltip text="This rate is used as a fallback or override for the daily official customs rate.">
                <span className="ml-1 text-gray-400 cursor-help">ℹ️</span>
              </Tooltip>
            </label>
            <input
              type="number"
              value={currentConfig.aduanaUsdClpRate.toFixed(2)}
              onChange={(e) => handleNumericChange(e, 'aduanaUsdClpRate')}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              min="0"
            />
          </div>
        </div>
      </section>

      {/* Ad Valorem Rates */}
      <section className="bg-gray-50 p-6 rounded-lg shadow-sm">
        <h3 className="text-xl font-semibold text-gray-700 mb-4">
          Ad Valorem Rates (Duties)
          <Tooltip text="Configure duty rates based on HS Code prefixes and origin countries. A global rule (HS Code empty, Origin 'GLOBAL') acts as a default.">
            <span className="ml-1 text-gray-400 cursor-help">ℹ️</span>
          </Tooltip>
        </h3>
        <div className="space-y-4">
          {currentConfig.adValoremRates.map((rate, index) => (
            <div
              key={rate.id}
              className="flex items-end space-x-2 border-b pb-4 last:border-b-0"
            >
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700">
                  HS Code Prefix (e.g., 85)
                </label>
                <input
                  type="text"
                  value={rate.hsCodePrefix}
                  onChange={(e) =>
                    handleAdValoremChange(index, 'hsCodePrefix', e.target.value)
                  }
                  className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700">
                  Origin Country (e.g., US, CN, GLOBAL)
                </label>
                <input
                  type="text"
                  value={rate.originCountry}
                  onChange={(e) =>
                    handleAdValoremChange(index, 'originCountry', e.target.value)
                  }
                  className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700">
                  Rate (%)
                </label>
                <input
                  type="number"
                  value={(rate.rate * 100).toFixed(2)}
                  onChange={(e) =>
                    handleAdValoremChange(index, 'rate', e.target.value)
                  }
                  className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                  min="0"
                />
              </div>
              <button
                onClick={() => removeAdValoremRate(rate.id)}
                className="px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
              >
                Remove
              </button>
            </div>
          ))}
          <button
            onClick={addAdValoremRate}
            className="mt-4 px-4 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600 transition-colors"
          >
            Add Ad Valorem Rate
          </button>
        </div>
      </section>

      {/* Service Fees */}
      <section className="bg-gray-50 p-6 rounded-lg shadow-sm">
        <h3 className="text-xl font-semibold text-gray-700 mb-4">
          Service Fees
          <Tooltip text="Define various service fees, including fixed amounts, per-kg rates, and bracketed pricing based on chargeable weight. Specify if VAT is applicable.">
            <span className="ml-1 text-gray-400 cursor-help">ℹ️</span>
          </Tooltip>
        </h3>
        <div className="space-y-6">
          {currentConfig.serviceFees.map((fee, feeIndex) => (
            <div
              key={fee.id}
              className="border border-gray-200 p-4 rounded-lg bg-white shadow-sm space-y-3"
            >
              <div className="flex items-center space-x-3">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Service Name
                  </label>
                  <input
                    type="text"
                    value={fee.name}
                    onChange={(e) =>
                      handleServiceFeeChange(feeIndex, 'name', e.target.value)
                    }
                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Base Amount (CLP)
                  </label>
                  <input
                    type="number"
                    value={fee.baseAmountClp.toFixed(0)}
                    onChange={(e) =>
                      handleServiceFeeChange(
                        feeIndex,
                        'baseAmountClp',
                        parseFloat(e.target.value) || 0,
                      )
                    }
                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Per Kg Rate (CLP)
                  </label>
                  <input
                    type="number"
                    value={fee.perKgRateClp.toFixed(0)}
                    onChange={(e) =>
                      handleServiceFeeChange(
                        feeIndex,
                        'perKgRateClp',
                        parseFloat(e.target.value) || 0,
                      )
                    }
                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                    min="0"
                  />
                </div>
                <div className="flex items-center self-end pb-1">
                  <input
                    id={`vat-taxable-${fee.id}`}
                    type="checkbox"
                    checked={fee.vatTaxable}
                    onChange={(e) =>
                      handleServiceFeeChange(
                        feeIndex,
                        'vatTaxable',
                        e.target.checked,
                      )
                    }
                    className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                  />
                  <label
                    htmlFor={`vat-taxable-${fee.id}`}
                    className="ml-2 block text-sm text-gray-900"
                  >
                    VAT Taxable
                  </label>
                </div>
                <button
                  onClick={() => removeServiceFee(fee.id)}
                  className="px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors self-end"
                >
                  Remove
                </button>
              </div>

              {/* Brackets for this service fee */}
              <h4 className="text-md font-medium text-gray-700 mt-4">
                Pricing Brackets
              </h4>
              <div className="space-y-2">
                {fee.brackets.map((bracket, bracketIndex) => (
                  <div
                    key={bracketIndex}
                    className="flex items-end space-x-2 bg-gray-100 p-2 rounded-md"
                  >
                    <div className="flex-1">
                      <label className="block text-sm text-gray-600">
                        Min Weight (kg)
                      </label>
                      <input
                        type="number"
                        value={bracket.minChargeableWeightKg.toFixed(2)}
                        onChange={(e) =>
                          handleServiceFeeBracketChange(
                            feeIndex,
                            bracketIndex,
                            'minChargeableWeightKg',
                            e.target.value,
                          )
                        }
                        className="mt-1 block w-full p-1 border border-gray-300 rounded-md text-sm"
                        min="0"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm text-gray-600">
                        Max Weight (kg)
                      </label>
                      <input
                        type="number"
                        value={bracket.maxChargeableWeightKg.toFixed(2)}
                        onChange={(e) =>
                          handleServiceFeeBracketChange(
                            feeIndex,
                            bracketIndex,
                            'maxChargeableWeightKg',
                            e.target.value,
                          )
                        }
                        className="mt-1 block w-full p-1 border border-gray-300 rounded-md text-sm"
                        min="0"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm text-gray-600">
                        Amount (CLP)
                      </label>
                      <input
                        type="number"
                        value={bracket.amountClp.toFixed(0)}
                        onChange={(e) =>
                          handleServiceFeeBracketChange(
                            feeIndex,
                            bracketIndex,
                            'amountClp',
                            e.target.value,
                          )
                        }
                        className="mt-1 block w-full p-1 border border-gray-300 rounded-md text-sm"
                        min="0"
                      />
                    </div>
                    <button
                      onClick={() => removeServiceFeeBracket(feeIndex, bracketIndex)}
                      className="px-2 py-1 bg-red-400 text-white rounded-md hover:bg-red-500 transition-colors text-sm"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => addServiceFeeBracket(feeIndex)}
                  className="mt-2 px-3 py-1 bg-blue-400 text-white rounded-md hover:bg-blue-500 transition-colors text-sm"
                >
                  Add Bracket
                </button>
              </div>
            </div>
          ))}
          <button
            onClick={addServiceFee}
            className="mt-4 px-4 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600 transition-colors"
          >
            Add Service Fee
          </button>
        </div>
      </section>

      {/* Courier Divisors */}
      <section className="bg-gray-50 p-6 rounded-lg shadow-sm">
        <h3 className="text-xl font-semibold text-gray-700 mb-4">
          Courier Divisors for Volumetric Weight
          <Tooltip text="Volumetric weight is calculated as (Length * Width * Height) / Divisor. Configure the divisor for each courier.">
            <span className="ml-1 text-gray-400 cursor-help">ℹ️</span>
          </Tooltip>
        </h3>
        <div className="space-y-4">
          {currentConfig.courierDivisors.map((divisor, index) => (
            <div
              key={divisor.id}
              className="flex items-end space-x-2 border-b pb-4 last:border-b-0"
            >
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700">
                  Courier
                </label>
                <select
                  value={divisor.courier}
                  onChange={(e) =>
                    handleCourierDivisorChange(
                      index,
                      'courier',
                      e.target.value as CourierType,
                    )
                  }
                  className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                >
                  {DEFAULT_COURIER_OPTIONS.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700">
                  Divisor
                </label>
                <input
                  type="number"
                  value={divisor.divisor.toFixed(0)}
                  onChange={(e) =>
                    handleCourierDivisorChange(
                      index,
                      'divisor',
                      parseFloat(e.target.value) || 0,
                    )
                  }
                  className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                  min="1"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <input
                  type="text"
                  value={divisor.description}
                  onChange={(e) =>
                    handleCourierDivisorChange(
                      index,
                      'description',
                      e.target.value,
                    )
                  }
                  className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
              <button
                onClick={() => removeCourierDivisor(divisor.id)}
                className="px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
              >
                Remove
              </button>
            </div>
          ))}
          <button
            onClick={addCourierDivisor}
            className="mt-4 px-4 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600 transition-colors"
          >
            Add Courier Divisor
          </button>
        </div>
      </section>

      <button
        onClick={handleSave}
        className="w-full px-6 py-3 bg-green-600 text-white rounded-md text-lg font-semibold hover:bg-green-700 transition-colors"
      >
        Save All Configurations
      </button>
    </div>
  );
};

export default AdminConfig;
