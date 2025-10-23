
import React from 'react';
import Input from './Input';

interface CurrencyInputProps {
  label: string;
  id: string;
  value: number;
  onChange: (value: number) => void;
  currencySymbol?: string;
  placeholder?: string;
  min?: number;
  max?: number;
  step?: number;
  error?: string;
  precision?: number; // Number of decimal places
  allowNegative?: boolean;
  // FIX: Add disabled prop
  disabled?: boolean;
}

const CurrencyInput: React.FC<CurrencyInputProps> = ({
  label,
  id,
  value,
  onChange,
  currencySymbol = '',
  placeholder = '0.00',
  min = 0,
  max,
  step = 0.01,
  error,
  precision = 2,
  allowNegative = false,
  // FIX: Add disabled prop
  disabled = false,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newValue = parseFloat(e.target.value);
    if (isNaN(newValue)) {
      onChange(0); // Or handle as invalid input
    } else {
      if (!allowNegative && newValue < 0) newValue = 0;
      onChange(newValue);
    }
  };

  return (
    <div className="relative">
      <Input
        label={label}
        id={id}
        type="number"
        value={value.toFixed(precision)}
        onChange={handleChange}
        placeholder={placeholder}
        min={min}
        max={max}
        step={step}
        error={error}
        className="pl-8" // Make space for the currency symbol
        // FIX: Pass disabled prop to Input component
        disabled={disabled}
      />
      {currencySymbol && (
        <span className="absolute left-3 top-[37px] text-gray-500 pointer-events-none">
          {currencySymbol}
        </span>
      )}
    </div>
  );
};

export default CurrencyInput;