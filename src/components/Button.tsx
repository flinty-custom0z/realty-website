import React from 'react';
import { Loader2 } from 'lucide-react';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'link';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-gray-900 text-white hover:bg-gray-800 border border-transparent',
  secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200 border border-transparent',
  outline: 'bg-transparent text-gray-700 hover:bg-gray-50 border border-gray-200',
  ghost: 'bg-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900 border border-transparent',
  link: 'bg-transparent text-gray-600 hover:text-gray-900 hover:underline border-none p-0 shadow-none',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-5 py-2.5 text-base',
};

export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  fullWidth = false,
  className = '',
  children,
  icon,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-gray-200 ${
        variantClasses[variant]
      } ${
        sizeClasses[size]
      } ${fullWidth ? 'w-full' : ''} ${
        disabled || loading ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''
      } ${
        variant !== 'link' ? 'shadow-sm' : ''
      } ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 className="animate-spin mr-2" size={size === 'sm' ? 14 : size === 'lg' ? 20 : 16} />}
      {icon && !loading && <span className="mr-2">{icon}</span>}
      {children}
    </button>
  );
} 