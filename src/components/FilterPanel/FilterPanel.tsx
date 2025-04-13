"use client";
import React, { useState } from "react";
import { Filter } from "lucide-react";

// Constants from onboarding step3
const US_STATES = [
  { value: "AL", label: "Alabama" },
  { value: "AK", label: "Alaska" },
  // ... other states
  { value: "WY", label: "Wyoming" },
].sort((a, b) => a.label.localeCompare(b.label));

// TODO: should be consistent across application
const COUNTRIES = [
  { value: "USA", label: "United States" },
  { value: "CAN", label: "Canada" },
  { value: "GBR", label: "United Kingdom" },
  { value: "AUS", label: "Australia" },
  { value: "DEU", label: "Germany" },
  { value: "FRA", label: "France" },
  { value: "JPN", label: "Japan" },
  { value: "CHN", label: "China" },
  { value: "IND", label: "India" },
  { value: "BRA", label: "Brazil" },
].sort((a, b) => a.label.localeCompare(b.label));

// TODO: should pull from Industries table
const INDUSTRIES = [
  { value: "tech", label: "Technology" },
  { value: "finance", label: "Finance" },
  { value: "consulting", label: "Consulting" },
  { value: "healthcare", label: "Healthcare" },
  { value: "education", label: "Education" },
  { value: "retail", label: "Retail" },
  { value: "manufacturing", label: "Manufacturing" },
  { value: "media", label: "Media & Entertainment" },
  { value: "nonprofit", label: "Non-Profit" },
  { value: "other", label: "Other" },
];

interface FilterOptions {
  postGradType?: "work" | "school" | "all";
  country?: string;
  state?: string;
  city?: string;
  industry?: string;
}

interface FilterPanelProps {
  onFilter: (filters: FilterOptions) => void;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({ onFilter }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    postGradType: "all",
    country: "",
    state: "",
    city: "",
    industry: "",
  });

  const handleFilterChange = (newFilters: Partial<FilterOptions>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    onFilter(updatedFilters);
  };

  const selectClasses =
    "w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-[#F9C5D1] focus:ring-2 focus:ring-[#F9C5D1]/20 outline-none transition-colors hover:border-[#F9C5D1]/50 cursor-pointer text-[#333333]";
  const labelClasses = "block text-sm font-medium text-[#333333] mb-2";

  const showStateField = filters.country === "USA";

  return (
    <div className="relative">
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
                value={filters.postGradType}
                onChange={(e) =>
                  handleFilterChange({
                    postGradType: e.target.value as "work" | "school" | "all",
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
                value={filters.country}
                onChange={(e) =>
                  handleFilterChange({
                    country: e.target.value,
                    state: "", // Reset state when country changes
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
                  value={filters.state}
                  onChange={(e) =>
                    handleFilterChange({
                      state: e.target.value,
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
                value={filters.city}
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
                value={filters.industry}
                onChange={(e) =>
                  handleFilterChange({
                    industry: e.target.value,
                  })
                }
                className={selectClasses}
              >
                <option value="">All Industries</option>
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
