import React from 'react';
import classNames from 'classnames';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

export const Button: React.FC<ButtonProps> = ({
  size = 'medium',
  className,
  children,
  ...props
}) => {
  return (
    <button
      className={classNames(
        'rounded-lg font-medium transition-all',
        {
          'px-8 py-4 text-lg': size === 'large',
          'px-6 py-3 text-base': size === 'medium',
          'px-4 py-2 text-sm': size === 'small',
        },
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}; 