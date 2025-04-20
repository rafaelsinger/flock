import { Combobox, ComboboxInput, ComboboxOption, ComboboxOptions } from '@headlessui/react';
import { schools } from '@/constants/schools';
import { useState } from 'react';

interface SchoolSelectProps {
  value: string;
  onChange: (school: string) => void;
}

export const SchoolSelect: React.FC<SchoolSelectProps> = ({ value, onChange }) => {
  const [query, setQuery] = useState('');

  const filteredSchools =
    query === ''
      ? schools
      : schools.filter((school) => school.name.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="relative w-full">
      <Combobox value={value} onChange={onChange}>
        <div className="relative w-full">
          <ComboboxInput
            className="w-full text-[#333] border border-gray-200 px-4 py-3 rounded-lg focus:border-[#A7D7F9] focus:ring-2 focus:ring-[#A7D7F9]/20 outline-none"
            placeholder="Start typing to search for a school"
            onChange={(event) => setQuery(event.target.value)}
            autoComplete="off"
          />
        </div>
        <div className="relative">
          <ComboboxOptions className="absolute z-10 w-full mt-1 max-h-60 overflow-auto bg-white border border-gray-200 rounded-lg shadow-lg left-0 right-0">
            {filteredSchools.length === 0 && query !== '' ? (
              <div className="px-4 py-2 text-[#666] text-sm">Nothing found.</div>
            ) : (
              filteredSchools.map((school) => (
                <ComboboxOption
                  key={school.name}
                  value={school.name}
                  className={({ active }) =>
                    `px-4 py-2 cursor-pointer text-[#333] ${active ? 'bg-[#A7D7F9]/10' : ''}`
                  }
                >
                  {school.name}
                </ComboboxOption>
              ))
            )}
          </ComboboxOptions>
        </div>
      </Combobox>
    </div>
  );
};
