import React from 'react';
import { Search } from 'lucide-react';

interface SearchBarProps {
  placeholder?: string;
  className?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({ 
  placeholder = "Search...",
  className 
}) => {
  return (
    <div className={`relative ${className}`}>
      <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
      <input
        type="text"
        placeholder={placeholder}
        className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-200 
                 focus:outline-none focus:border-[#F28B82] focus:ring-1 focus:ring-[#F28B82]
                 placeholder:text-gray-400 text-[#333333] transition-all duration-200
                 hover:border-gray-300 cursor-text"
      />
    </div>
  );
}; 