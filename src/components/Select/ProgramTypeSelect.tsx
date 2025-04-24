import React from 'react';
import { programTypes } from '@/constants/schools';

interface ProgramTypeSelectProps {
  value: string;
  onChange: (programType: string) => void;
}

export const ProgramTypeSelect: React.FC<ProgramTypeSelectProps> = ({ value, onChange }) => {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full text-[#333] border border-gray-200 px-4 py-3 rounded-lg focus:border-[#A7D7F9] focus:ring-2 focus:ring-[#A7D7F9]/20 outline-none transition-all cursor-pointer"
    >
      <option value="">Select a program type</option>
      {programTypes.map((type) => (
        <option key={type} value={type} className="text-[#333]">
          {type}
        </option>
      ))}
    </select>
  );
};
