import React from 'react';
import { motion } from 'framer-motion';

interface FilterButtonProps {
  isActive: boolean;
  onClick: () => void;
  label: string;
  icon?: React.ReactNode;
  isMobile?: boolean;
  className?: string;
}

export const FilterButton: React.FC<FilterButtonProps> = ({
  isActive,
  onClick,
  label,
  icon,
  isMobile = false,
  className = '',
}) => {
  return (
    <motion.button
      onClick={onClick}
      className={`
        px-3 py-1.5 rounded-md
        ${
          isActive
            ? 'bg-[#F9C5D1]/10 text-[#F28B82] font-medium'
            : isMobile
              ? 'text-gray-600 hover:bg-gray-100'
              : 'text-gray-600 hover:bg-gray-100'
        }
        ${isMobile ? 'flex-1' : ''}
        transition-all text-sm flex items-center justify-center gap-1.5 h-[34px]
        ${className}
      `}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {icon}
      {label}
    </motion.button>
  );
};
