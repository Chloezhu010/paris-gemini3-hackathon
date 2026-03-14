import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', label, error, helperText, ...props }, ref) => {
    return (
      <div className="w-full space-y-2">
        {label && (
          <label className="block text-xs uppercase tracking-widest text-[#6b7280] font-semibold">
            {label}
          </label>
        )}
        <div className={`border-2 bg-white transition-colors ${error ? 'border-[#dc2626]' : 'border-[#e5e7eb] focus-within:border-[#6d28d9]'}`}>
          <input
            ref={ref}
            className={`input-base ${className}`}
            {...props}
          />
        </div>
        {error && <p className="text-xs font-medium text-[#dc2626]">{error}</p>}
        {helperText && !error && <p className="text-xs text-[#6b7280]">{helperText}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
