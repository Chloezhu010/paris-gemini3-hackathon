import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({
    className = '',
    label,
    error,
    helperText,
    icon,
    iconPosition = 'right',
    ...props
  }, ref) => {
    const hasIcon = !!icon;

    return (
      <div className="w-full space-y-sm">
        {label && (
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            {label}
          </label>
        )}

        <div className="relative">
          <input
            ref={ref}
            className={`
              input-base
              ${hasIcon && iconPosition === 'left' ? 'pl-10' : ''}
              ${hasIcon && iconPosition === 'right' ? 'pr-10' : ''}
              ${error ? 'border-error focus:ring-error focus:border-transparent' : ''}
              ${className}
            `}
            {...props}
          />

          {icon && (
            <div
              className={`
                absolute top-1/2 -translate-y-1/2
                ${iconPosition === 'left' ? 'left-3' : 'right-3'}
                text-slate-400 pointer-events-none
              `}
            >
              {icon}
            </div>
          )}
        </div>

        {error && (
          <p className="text-xs font-medium text-error">{error}</p>
        )}

        {helperText && !error && (
          <p className="text-xs text-slate-500 dark:text-slate-400">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
