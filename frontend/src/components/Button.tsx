import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'outline' | 'success';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  className = '',
  children,
  disabled,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center rounded-xl font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variants = {
    primary: 'bg-teal-600 text-white hover:bg-teal-700 focus:ring-teal-500',
    secondary: 'bg-slate-200 text-slate-900 hover:bg-slate-300 focus:ring-slate-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500',
    outline: 'border-2 border-teal-600 text-teal-700 hover:bg-teal-50 focus:ring-teal-500',
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 min-h-[48px] text-base',
    lg: 'px-8 py-4 min-h-[56px] text-lg',
  };

  const isDisabled = disabled || loading;

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
      disabled={isDisabled}
      {...props}
    >
      {loading && <Loader2 className="w-5 h-5 mr-2 animate-spin" />}
      {children}
    </button>
  );
};
