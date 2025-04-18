import React from 'react';
import { programTypes } from '@/constants/schools';
import { ProgramType } from '@prisma/client';

// Helper function to convert program type string to enum value
const stringToProgramType = (program: string): ProgramType | undefined => {
  switch (program) {
    case "Bachelor's":
      return 'Bachelors' as ProgramType;
    case "Master's":
      return 'Masters' as ProgramType;
    case 'Ph.D.':
      return 'PhD' as ProgramType;
    case 'J.D.':
      return 'JD' as ProgramType;
    case 'M.D.':
      return 'MD' as ProgramType;
    case 'M.B.A.':
      return 'MBA' as ProgramType;
    case 'Ed.D.':
      return 'EdD' as ProgramType;
    case 'M.P.H.':
      return 'MPH' as ProgramType;
    case 'Professional Certificate':
      return 'ProfessionalCertificate' as ProgramType;
    case 'Postdoctoral Fellowship':
      return 'PostdoctoralFellowship' as ProgramType;
    case 'Residency Program':
      return 'ResidencyProgram' as ProgramType;
    case "Associate's Degree":
      return 'AssociatesDegree' as ProgramType;
    case 'Trade School / Vocational':
      return 'TradeSchoolVocational' as ProgramType;
    case 'Gap Year':
      return 'GapYear' as ProgramType;
    case 'Undecided':
      return 'Undecided' as ProgramType;
    case 'Other':
      return 'Other' as ProgramType;
    default:
      return undefined;
  }
};

// Helper function to convert enum value to display text
const programTypeToString = (program?: ProgramType): string => {
  if (!program) return '';

  switch (program) {
    case 'Bachelors':
      return "Bachelor's";
    case 'Masters':
      return "Master's";
    case 'PhD':
      return 'Ph.D.';
    case 'JD':
      return 'J.D.';
    case 'MD':
      return 'M.D.';
    case 'MBA':
      return 'M.B.A.';
    case 'EdD':
      return 'Ed.D.';
    case 'MPH':
      return 'M.P.H.';
    case 'ProfessionalCertificate':
      return 'Professional Certificate';
    case 'PostdoctoralFellowship':
      return 'Postdoctoral Fellowship';
    case 'ResidencyProgram':
      return 'Residency Program';
    case 'AssociatesDegree':
      return "Associate's Degree";
    case 'TradeSchoolVocational':
      return 'Trade School / Vocational';
    case 'GapYear':
      return 'Gap Year';
    case 'Undecided':
      return 'Undecided';
    case 'Other':
      return 'Other';
    default:
      return '';
  }
};

interface ProgramTypeSelectProps {
  value: ProgramType | string | undefined | null;
  onChange: (programType: ProgramType | undefined) => void;
}

export const ProgramTypeSelect: React.FC<ProgramTypeSelectProps> = ({ value, onChange }) => {
  // Convert enum value to string for display
  const displayValue =
    typeof value === 'string'
      ? Object.values(ProgramType).includes(value as ProgramType)
        ? programTypeToString(value as ProgramType)
        : value
      : programTypeToString(value as ProgramType);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = e.target.value;
    if (!selectedValue) {
      onChange(undefined);
    } else {
      onChange(stringToProgramType(selectedValue));
    }
  };

  return (
    <select
      value={displayValue}
      onChange={handleChange}
      className="w-full text-[#333] border border-gray-200 px-4 py-3 rounded-lg focus:border-[#A7D7F9] focus:ring-2 focus:ring-[#A7D7F9]/20 outline-none transition-all"
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
