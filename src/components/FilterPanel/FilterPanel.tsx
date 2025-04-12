"use client"
import React from 'react';
import { Filter } from 'lucide-react';
import { Button } from '@/components/Button';

export const FilterPanel: React.FC = () => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div className="relative">
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-white border border-gray-200 text-[#333333] 
                  hover:bg-gray-50 transition-all duration-200 cursor-pointer
                  hover:border-gray-300 active:scale-[0.98]"
      >
        <Filter className="h-4 w-4" />
        Filters
      </Button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-[300px] bg-white rounded-lg shadow-lg 
                      border border-gray-100 p-4 animate-in fade-in slide-in-from-top-2">
          <div className="space-y-4">
            {['Country', 'State', 'City', 'Industry', 'Company'].map((filter) => (
              <div key={filter} className="space-y-2">
                <label className="text-sm font-medium text-[#333333]">{filter}</label>
                <select className="w-full p-2 rounded border border-gray-200 text-sm
                                cursor-pointer hover:border-gray-300 transition-all">
                  <option value="">Select {filter}</option>
                </select>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}; 