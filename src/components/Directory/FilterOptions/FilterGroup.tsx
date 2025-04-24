import React from 'react';

interface FilterGroupProps {
  title: string;
  children: React.ReactNode;
  isMobile?: boolean;
  className?: string;
}

export const FilterGroup: React.FC<FilterGroupProps> = ({
  title,
  children,
  isMobile = false,
  className = '',
}) => {
  return (
    <div className={`space-y-2 ${className}`}>
      <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider px-1">{title}</h4>
      <div
        className={`${isMobile ? 'flex flex-wrap' : 'flex items-center'} bg-gray-50 p-1 rounded-lg`}
      >
        {children}
      </div>
    </div>
  );
};
