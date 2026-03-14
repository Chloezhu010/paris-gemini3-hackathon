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
      success: 'bg-success bg-opacity-10 text-success dark:text-success',
      warning: 'bg-warning bg-opacity-10 text-warning dark:text-warning',
      error: 'bg-error bg-opacity-10 text-error dark:text-error',
    };

    const sizeClasses = {
      sm: 'px-2 py-0.5 text-xs font-medium',
      md: 'px-2.5 py-1 text-sm font-medium',
    };

    return (
      <span
        ref={ref}
        className={`
          inline-flex items-center justify-center rounded-full whitespace-nowrap
          ${variantClasses[variant]}
          ${sizeClasses[size]}
          ${className}
        `}
        {...props}
      >
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';
