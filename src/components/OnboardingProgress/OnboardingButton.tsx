import React from 'react';
import { motion } from 'framer-motion';

type ButtonVariant = 'primary' | 'secondary';
type ButtonSize = 'default' | 'large';

interface OnboardingButtonProps {
  type?: 'button' | 'submit' | 'reset';
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  isLoading?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
}

export const OnboardingButton: React.FC<OnboardingButtonProps> = ({
  type = 'button',
  variant = 'primary',
  size = 'default',
  disabled = false,
  isLoading = false,
  onClick,
  children,
  className = '',
}) => {
  const baseClasses = 'rounded-xl font-medium transition-all';

  const variantClasses = {
    primary: `${
      disabled || isLoading
        ? 'bg-[#F9C5D1]/50 text-white/70 cursor-not-allowed'
        : 'bg-gradient-to-r from-[#F28B82] to-[#E67C73] text-white shadow-md hover:shadow-lg cursor-pointer'
    }`,
    secondary: `border ${
      disabled || isLoading
        ? 'border-gray-200 text-gray-300 cursor-not-allowed'
        : 'border-[#F9C5D1] text-[#F28B82] hover:bg-[#F9C5D1]/5 cursor-pointer'
    }`,
  };

  const sizeClasses = {
    default: 'px-6 py-3 text-base',
    large: 'px-8 py-4 text-lg',
  };

  const mobileClasses = 'w-full md:w-auto md:min-w-[180px] md:max-w-[200px] mx-auto md:mx-0';

  const buttonClasses = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${mobileClasses} ${className}`;

  const loadingSpinner = (
    <span className="flex items-center justify-center">
      {variant === 'primary' ? (
        <svg
          className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      ) : (
        <div className="w-5 h-5 border-2 border-[#F28B82] border-t-transparent rounded-full animate-spin mr-2"></div>
      )}
      Processing...
    </span>
  );

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      whileHover={!disabled && !isLoading ? { scale: 1.02 } : {}}
      whileTap={!disabled && !isLoading ? { scale: 0.98 } : {}}
      className={buttonClasses}
    >
      {isLoading ? loadingSpinner : children}
    </motion.button>
  );
};
