
import React from 'react';
import { Currency } from '../../types';

interface CurrencyDisplayProps {
  amount: number;
  currency: Currency;
  className?: string;
  label?: string;
}

const CurrencyDisplay: React.FC<CurrencyDisplayProps> = ({
  amount,
  currency,
  className = '',
  label,
}) => {
  const formatAmount = (value: number, curr: Currency) => {
    if (curr === 'USD') {
      return value.toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    } else if (curr === 'CLP') {
      return Math.round(value).toLocaleString('es-CL', {
        style: 'currency',
        currency: 'CLP',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      });
    }
    const options: Intl.NumberFormatOptions = {
      style: 'currency',
      currency: curr,
    };
    if (curr === 'JPY') {
      options.minimumFractionDigits = 0;
      options.maximumFractionDigits = 0;
    } else {
      options.minimumFractionDigits = 2;
      options.maximumFractionDigits = 2;
    }
    return value.toLocaleString('en-US', options);
  };

  return (
    <div className={className}>
      {label && <span className="text-sm font-medium text-gray-600">{label}: </span>}
      <span className="font-semibold text-gray-800">
        {formatAmount(amount, currency)}
      </span>
    </div>
  );
};

export default CurrencyDisplay;