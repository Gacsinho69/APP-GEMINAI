
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
  const [inputValue, setInputValue] = React.useState(value.toFixed(precision));

  // Update input value when prop value changes
  React.useEffect(() => {
    setInputValue(value.toFixed(precision));
  }, [value, precision]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    setInputValue(rawValue);

    let newValue = parseFloat(rawValue);
    if (isNaN(newValue) || rawValue === '') {
      onChange(0);
    } else {
      if (!allowNegative && newValue < 0) newValue = 0;
      if (max !== undefined && newValue > max) newValue = max;
      if (min !== undefined && newValue < min) newValue = min;
      onChange(newValue);
    }
  };

  const handleBlur = () => {
    // Format the value on blur
    setInputValue(value.toFixed(precision));
  };

  return (
    <div className="relative">
      <Input
        label={label}
        id={id}
        type="number"
        value={inputValue}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder={placeholder}
        min={min}
        max={max}
        step={step}
        error={error}
        className={`${currencySymbol ? 'pl-10' : ''}`}
        // FIX: Pass disabled prop to Input component
        disabled={disabled}
      />
      {currencySymbol && (
        <span className="absolute left-3 top-[34px] text-slate-500 pointer-events-none font-medium">
          {currencySymbol}
        </span>
      )}
    </div>
  );
};

export default CurrencyInput;