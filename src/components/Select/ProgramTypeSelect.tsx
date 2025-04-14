import React from 'react';
import { programTypes } from '@/constants/schools';

interface ProgramTypeSelectProps {
  value: string;
  onChange: (programType: string) => void;
}

export const ProgramTypeSelect: React.FC<ProgramTypeSelectProps> = ({ value, onChange }) => {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} className="input">
      <option value="">Select a program type</option>
      {programTypes.map((type) => (
        <option key={type} value={type}>
          {type}
        </option>
      ))}
    </select>
  );
};
