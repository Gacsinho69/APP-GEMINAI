
import React from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  id: string;
  options: { value: string; label: string }[];
  error?: string;
  containerClassName?: string;
  labelClassName?: string;
}

const Select: React.FC<SelectProps> = ({
  label,
  id,
  options,
  error,
  containerClassName = '',
  labelClassName = '',
  className = '',
  ...props
}) => {
  return (
    <div className={`mb-4 ${containerClassName}`}>
      {label && (
        <label htmlFor={id} className={`block text-sm font-medium text-slate-700 mb-1 ${labelClassName}`}>
          {label}
        </label>
      )}
      <select
        id={id}
        className={`mt-1 block w-full px-3 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors
          ${error ? 'border-red-500' : 'border-slate-300'} ${className}
          disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed`}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};

export default Select;
