import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, className = '', ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-medium text-[var(--primary-text)]">
          {label}
        </label>
      )}
      <input
        className={`
          px-4 py-2 rounded-lg 
          bg-[var(--background)] 
          border border-[var(--border)] 
          text-[var(--primary-text)]
          placeholder:text-[var(--secondary-text)]
          focus:outline-none focus:border-[var(--primary-green)]
          transition-colors
          ${error ? 'border-[var(--error)]' : ''}
          ${className}
        `}
        {...props}
      />
      {error && (
        <span className="text-xs text-[var(--error)]">{error}</span>
      )}
    </div>
  );
}

