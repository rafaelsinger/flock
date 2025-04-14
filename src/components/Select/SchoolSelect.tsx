import { Combobox, ComboboxInput, ComboboxOption, ComboboxOptions } from '@headlessui/react';
import { schools } from '@/constants/schools';

interface SchoolSelectProps {
  value: string;
  onChange: (school: string) => void;
}

export const SchoolSelect: React.FC<SchoolSelectProps> = ({ value, onChange }) => {
  return (
    <Combobox value={value} onChange={onChange}>
      <ComboboxInput className="input" />
      <ComboboxOptions>
        {schools.map((school) => (
          <ComboboxOption key={school.name} value={school.name}>
            {school.name}
          </ComboboxOption>
        ))}
      </ComboboxOptions>
    </Combobox>
  );
};
