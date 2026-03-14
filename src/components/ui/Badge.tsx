import React from 'react';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'primary' | 'accent' | 'secondary' | 'success' | 'warning' | 'error';
  size?: 'sm' | 'md';
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className = '', variant = 'secondary', size = 'md', children, ...props }, ref) => {
    const variantClasses = {
      primary: 'badge-primary',
      accent: 'badge-accent',
      secondary: 'badge-secondary',
      success: 'bg-[#d1fae5] text-[#065f46] border border-[#10b981]',
      warning: 'bg-[#fef3c7] text-[#92400e] border border-[#f59e0b]',
      error: 'bg-[#fee2e2] text-[#991b1b] border border-[#dc2626]',
    };

    const sizeClasses = {
      sm: 'px-2 py-0.5 text-xs font-semibold',
      md: 'px-3 py-1 text-sm font-semibold',
    };

    return (
      <span
        ref={ref}
        className={`inline-flex items-center justify-center whitespace-nowrap ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
        {...props}
      >
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';
