import { Combobox, ComboboxInput, ComboboxOption, ComboboxOptions } from '@headlessui/react';
import { disciplines } from '@/constants/schools';

interface DisciplineSelectProps {
  value: string;
  onChange: (discipline: string) => void;
}

export const DisciplineSelect: React.FC<DisciplineSelectProps> = ({ value, onChange }) => {
  return (
    <Combobox value={value} onChange={onChange}>
      <ComboboxInput className="input" placeholder="Select or type a discipline" />
      <ComboboxOptions>
        {disciplines.map((discipline) => (
          <ComboboxOption key={discipline} value={discipline}>
            {discipline}
          </ComboboxOption>
        ))}
      </ComboboxOptions>
    </Combobox>
  );
};
