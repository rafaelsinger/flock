import { Combobox, ComboboxInput, ComboboxOption, ComboboxOptions } from '@headlessui/react';
import { disciplines } from '@/constants/schools';
import { useState } from 'react';

interface DisciplineSelectProps {
  value: string;
  onChange: (discipline: string) => void;
}

export const DisciplineSelect: React.FC<DisciplineSelectProps> = ({ value, onChange }) => {
  const [query, setQuery] = useState('');

  const filteredDisciplines =
    query === ''
      ? disciplines
      : disciplines.filter((discipline) => discipline.toLowerCase().includes(query.toLowerCase()));

  return (
    <Combobox value={value} onChange={onChange}>
      <ComboboxInput
        className="input w-full text-[#333] border border-gray-200 px-4 py-3 rounded-lg focus:border-[#A7D7F9] focus:ring-2 focus:ring-[#A7D7F9]/20 outline-none"
        placeholder="Select or type a discipline"
        onChange={(event) => setQuery(event.target.value)}
      />
      <ComboboxOptions className="absolute z-10 w-full mt-1 max-h-60 overflow-auto bg-white border border-gray-200 rounded-lg shadow-lg">
        {filteredDisciplines.length === 0 && query !== '' ? (
          <div className="px-4 py-2 text-[#666] text-sm">Nothing found.</div>
        ) : (
          filteredDisciplines.map((discipline) => (
            <ComboboxOption
              key={discipline}
              value={discipline}
              className={({ active }) =>
                `px-4 py-2 cursor-pointer text-[#333] ${active ? 'bg-[#A7D7F9]/10' : ''}`
              }
            >
              {discipline}
            </ComboboxOption>
          ))
        )}
      </ComboboxOptions>
    </Combobox>
  );
};
