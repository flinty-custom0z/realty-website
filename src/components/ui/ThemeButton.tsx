'use client';

import { ButtonHTMLAttributes, forwardRef } from 'react';
import { useDealType } from '@/contexts/DealTypeContext';
import { cva, type VariantProps } from 'class-variance-authority';

// Define button variants using class-variance-authority
const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none',
  {
    variants: {
      variant: {
        default: 'deal-accent-bg text-white hover:deal-accent-bg-hover',
        outline: 'border border-input bg-transparent hover:bg-accent-light deal-accent-text',
        ghost: 'hover:bg-accent-light deal-accent-text',
        link: 'underline-offset-4 hover:underline deal-accent-text bg-transparent',
      },
      size: {
        default: 'h-10 px-4 py-2 text-sm',
        sm: 'h-8 px-3 py-1 text-xs',
        lg: 'h-12 px-6 py-3 text-base',
        icon: 'h-9 w-9 p-0'
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  icon?: React.ReactNode;
}

// Create the ThemeButton component
const ThemeButton = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, icon, children, ...props }, ref) => {
    const { dealType } = useDealType();
    
    // Add deal type indicator class to focus ring
    const focusRingClass = `focus-visible:ring-${dealType === 'sale' ? 'blue' : 'green'}-500`;
    
    return (
      <button
        className={`${buttonVariants({ variant, size })} ${focusRingClass} ${className || ''}`}
        ref={ref}
        {...props}
      >
        {icon && <span className="mr-2">{icon}</span>}
        {children}
      </button>
    );
  }
);

ThemeButton.displayName = 'ThemeButton';

export { ThemeButton, buttonVariants }; 