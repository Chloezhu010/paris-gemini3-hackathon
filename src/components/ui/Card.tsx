import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
  variant?: 'default' | 'elevated' | 'outlined';
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className = '', hoverable = true, variant = 'default', children, ...props }, ref) => {
    const baseClasses = 'bg-white transition-all duration-normal';

    const variantClasses = {
      default: 'border-2 border-[#e5e7eb] p-6',
      elevated: 'border-2 border-[#6d28d9] p-6 shadow-lg shadow-[rgba(109,40,217,0.1)]',
      outlined: 'border-2 border-[#e5e7eb] p-6',
    };

    const hoverClasses = hoverable ? 'hover:border-[#6d28d9] hover:shadow-md hover:shadow-[rgba(109,40,217,0.1)]' : '';

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
