import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
  variant?: 'default' | 'elevated' | 'outlined';
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className = '', hoverable = true, variant = 'default', children, ...props }, ref) => {
    const baseClasses = 'rounded-xl bg-white dark:bg-slate-800 transition-all duration-normal';

    const variantClasses = {
      default: 'border border-slate-200 dark:border-slate-700 shadow-sm p-6',
      elevated: 'shadow-md p-6',
      outlined: 'border-2 border-slate-200 dark:border-slate-700 p-6',
    };

    const hoverClasses = hoverable ? 'hover:shadow-md hover:border-slate-300 dark:hover:border-slate-600' : '';

    return (
      <div
        ref={ref}
        className={`${baseClasses} ${variantClasses[variant]} ${hoverClasses} ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

// Card header, content, footer subcomponents
export const CardHeader = ({ className = '', ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={`mb-lg ${className}`} {...props} />
);

export const CardContent = ({ className = '', ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={`space-y-md ${className}`} {...props} />
);

export const CardFooter = ({ className = '', ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={`mt-lg pt-lg border-t border-slate-200 dark:border-slate-700 ${className}`} {...props} />
);
