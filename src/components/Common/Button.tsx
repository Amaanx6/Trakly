import React, { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'ghost' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  className,
  disabled,
  ...props
}) => {
  // Size classes
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2',
    lg: 'px-5 py-2.5 text-lg',
  };

  // Variant classes
  const variantClasses = {
    primary: 'bg-primary-600 hover:bg-primary-700 text-white',
    secondary: 'bg-secondary-600 hover:bg-secondary-700 text-white',
    accent: 'bg-accent-600 hover:bg-accent-700 text-white',
    ghost: 'bg-transparent hover:bg-dark-800 text-dark-200 border border-dark-700',
    danger: 'bg-error-600 hover:bg-error-700 text-white',
    outline: 'bg-transparent border-2 border-primary-500 text-primary-500 hover:bg-primary-500 hover:text-white',
  };

  // Disabled state
  const disabledClasses = disabled || isLoading
    ? 'opacity-50 cursor-not-allowed'
    : '';

  // Full width
  const widthClasses = fullWidth ? 'w-full' : '';

  return (
    <button
      className={`
        rounded-md font-medium transition-all duration-200 ease-in-out
        flex items-center justify-center gap-2
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        ${disabledClasses}
        ${widthClasses}
        ${className || ''}
      `}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <span className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full"></span>
      )}
      {!isLoading && leftIcon && <span>{leftIcon}</span>}
      {children}
      {!isLoading && rightIcon && <span>{rightIcon}</span>}
    </button>
  );
};

export default Button;