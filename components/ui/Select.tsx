import React from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export function Select({ label, error, options, className = '', ...props }: SelectProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-medium text-[var(--primary-text)]">
          {label}
        </label>
      )}
      <select
        className={`
          px-4 py-2 rounded-lg 
          bg-[var(--background)] 
          border border-[var(--border)] 
          text-[var(--primary-text)]
          focus:outline-none focus:border-[var(--primary-green)]
          transition-colors
          ${error ? 'border-[var(--error)]' : ''}
          ${className}
        `}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <span className="text-xs text-[var(--error)]">{error}</span>
      )}
    </div>
  );
}

