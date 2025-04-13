'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Filter } from 'lucide-react';
import { US_STATES, COUNTRIES } from '@/constants/location';
import { INDUSTRIES } from '@/constants/industries';

interface FilterOptions {
  postGradType?: 'work' | 'school' | 'all';
  country?: string;
  state?: string;
  city?: string;
  industry?: string;
}

interface FilterPanelProps {
  onFilter: (filters: FilterOptions) => void;
  currentFilters?: FilterOptions;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({ onFilter, currentFilters = {} }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [postGradType, setPostGradType] = useState(currentFilters.postGradType || 'all');
  const [country, setCountry] = useState(currentFilters.country || '');
  const [state, setState] = useState(currentFilters.state || '');
  const [city, setCity] = useState(currentFilters.city || '');
  const [industry, setIndustry] = useState(currentFilters.industry || '');

  // Create a ref for the filter panel container
  const filterPanelRef = useRef<HTMLDivElement>(null);

  // Handle click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (filterPanelRef.current && !filterPanelRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    // Add event listener when panel is open
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    // Clean up the event listener
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  useEffect(() => {
    setPostGradType(currentFilters.postGradType || 'all');
    setCountry(currentFilters.country || '');
    setState(currentFilters.state || '');
    setCity(currentFilters.city || '');
    setIndustry(currentFilters.industry || '');
  }, [currentFilters]);

  const handleFilterChange = (newFilters: Partial<FilterOptions>) => {
    const updatedFilters = { ...currentFilters, ...newFilters };
    setPostGradType(updatedFilters.postGradType || 'all');
    setCountry(updatedFilters.country || '');
    setState(updatedFilters.state || '');
    setCity(updatedFilters.city || '');
    setIndustry(updatedFilters.industry || '');
    onFilter(updatedFilters);
  };

  const selectClasses =
    'w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-[#F9C5D1] focus:ring-2 focus:ring-[#F9C5D1]/20 outline-none transition-colors hover:border-[#F9C5D1]/50 cursor-pointer text-[#333333]';
  const labelClasses = 'block text-sm font-medium text-[#333333] mb-2';

  const showStateField = country === 'USA';

  return (
    <div className="relative" ref={filterPanelRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex cursor-pointer items-center gap-2 px-4 py-2.5 rounded-lg border border-gray-200 
                  hover:border-[#F9C5D1]/50 transition-colors text-[#333333]"
      >
        <Filter className="h-4 w-4" />
        <span>Filters</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-12 w-80 bg-white rounded-lg shadow-lg border border-gray-200 p-4 z-20">
          <div className="space-y-4">
            <div>
              <label className={labelClasses}>Post-Grad Path</label>
              <select
                value={postGradType}
                onChange={(e) =>
                  handleFilterChange({
                    postGradType: e.target.value as 'work' | 'school' | 'all',
                  })
                }
                className={selectClasses}
              >
                <option value="all">All</option>
                <option value="work">Work</option>
                <option value="school">School</option>
              </select>
            </div>

            <div>
              <label className={labelClasses}>Country</label>
              <select
                value={country}
                onChange={(e) =>
                  handleFilterChange({
                    country: e.target.value,
                    state: '', // Reset state when country changes
                  })
                }
                className={selectClasses}
              >
                <option value="">All Countries</option>
                {COUNTRIES.map(({ value, label }) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            {showStateField && (
              <div>
                <label className={labelClasses}>State</label>
                <select
                  value={state}
                  onChange={(e) =>
                    handleFilterChange({
                      state: e.target.value,
                      city: '',
                    })
                  }
                  className={selectClasses}
                >
                  <option value="">All States</option>
                  {US_STATES.map(({ value, label }) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className={labelClasses}>City</label>
              <input
                type="text"
                value={city}
                onChange={(e) =>
                  handleFilterChange({
                    city: e.target.value,
                  })
                }
                placeholder="Enter city name"
                className={selectClasses}
              />
            </div>

            <div>
              <label className={labelClasses}>Industry</label>
              <select
                value={industry}
                onChange={(e) =>
                  handleFilterChange({
                    industry: e.target.value,
                  })
                }
                className={selectClasses}
              >
                <option value="all">All Industries</option>
                {INDUSTRIES.map(({ value, label }) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
