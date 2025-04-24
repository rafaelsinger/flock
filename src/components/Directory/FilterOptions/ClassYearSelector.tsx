import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaUserGraduate, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { getAvailableYears } from '@/lib/utils';

interface ClassYearSelectorProps {
  selectedYear?: number | null;
  onChange: (year: number | null) => void;
  isMobile?: boolean;
}

export const ClassYearSelector: React.FC<ClassYearSelectorProps> = ({
  selectedYear,
  onChange,
  isMobile = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const availableYears = getAvailableYears();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleSelectYear = (year: number | null) => {
    onChange(year);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <motion.button
        onClick={toggleDropdown}
        className={`
          px-3 py-1.5 rounded-md
          ${selectedYear ? 'bg-[#F9C5D1]/10 text-[#F28B82] font-medium' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}
          ${isMobile ? 'w-full' : ''}
          transition-all text-sm flex items-center justify-center gap-1.5 h-[34px]
        `}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <FaUserGraduate className="text-xs" />
        {selectedYear ? `Class of ${selectedYear}` : 'All Classes'}
        {isOpen ? (
          <FaChevronUp className="text-xs ml-1" />
        ) : (
          <FaChevronDown className="text-xs ml-1" />
        )}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className={`
              absolute z-10 mt-1 w-full bg-white rounded-md shadow-lg border border-gray-100 py-1
              ${isMobile ? 'w-full' : 'min-w-[140px]'}
            `}
          >
            <div className="max-h-[200px] overflow-y-auto">
              <button
                onClick={() => handleSelectYear(null)}
                className={`
                  w-full text-left px-4 py-2 text-sm
                  ${!selectedYear ? 'bg-[#F9C5D1]/10 text-[#F28B82]' : 'text-gray-700'}
                  hover:bg-gray-50
                `}
              >
                All Classes
              </button>

              {availableYears.map((year) => (
                <button
                  key={year}
                  onClick={() => handleSelectYear(year)}
                  className={`
                    w-full text-left px-4 py-2 text-sm
                    ${selectedYear === year ? 'bg-[#F9C5D1]/10 text-[#F28B82]' : 'text-gray-700'}
                    hover:bg-gray-50
                  `}
                >
                  Class of {year}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
