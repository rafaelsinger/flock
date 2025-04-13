import React, { useEffect, useState } from "react";
import { Search } from "lucide-react";

export interface SearchBarProps {
  placeholder?: string;
  className?: string;
  onChange: (value: string) => void;
  value: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = "Search...",
  className = "",
  onChange,
  value,
}) => {
  const [localValue, setLocalValue] = useState(value);

  // Debounce the search input
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localValue !== value) {
        onChange(localValue);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [localValue, onChange, value]);

  return (
    <div className={`relative ${className}`}>
      <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
      <input
        type="text"
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-2.5 pl-10 rounded-lg border border-gray-200 
                  focus:border-[#F9C5D1] focus:ring-2 focus:ring-[#F9C5D1]/20 
                  outline-none transition-colors hover:border-[#F9C5D1]/50 
                  text-[#333333] placeholder:text-gray-400"
      />
    </div>
  );
}; 