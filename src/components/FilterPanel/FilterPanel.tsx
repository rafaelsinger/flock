'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Filter, Check, X, BookmarkPlus, Bookmark, Trash2 } from 'lucide-react';
import { US_STATES, COUNTRIES } from '@/constants/location';
import { motion, AnimatePresence } from 'framer-motion';

interface FilterOptions {
  postGradType?: 'work' | 'school' | 'all';
  country?: string;
  state?: string;
  city?: string;
  savedFilter?: string;
  lookingForRoommate?: boolean;
}

interface FilterPanelProps {
  onFilter: (filters: FilterOptions) => void;
  currentFilters: FilterOptions;
  savedFilters: Record<string, FilterOptions>;
  onSaveFilter: (name: string, filter: FilterOptions) => void;
  onDeleteFilter: (name: string) => void;
  onSelectFilter: (name: string) => void;
}

// Animation variants
const containerVariants = {
  hidden: { opacity: 0, y: -10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      staggerChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: { opacity: 1, x: 0 },
};

const SavedFilter = ({
  name,
  onSelect,
  onDelete,
}: {
  name: string;
  onSelect: () => void;
  onDelete: () => void;
}) => {
  return (
    <motion.div
      className="flex items-center gap-2 bg-[#F9C5D1]/10 rounded-lg px-3 py-2 mb-2"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <button
        onClick={onSelect}
        className="flex-1 text-left text-sm font-medium text-[#333333] hover:text-[#F28B82] transition-colors"
      >
        {name}
      </button>
      <button onClick={onDelete} className="text-gray-400 hover:text-[#F28B82] transition-colors">
        <Trash2 className="h-4 w-4" />
      </button>
    </motion.div>
  );
};

export const FilterPanel: React.FC<FilterPanelProps> = ({
  onFilter,
  currentFilters,
  savedFilters,
  onSaveFilter,
  onDeleteFilter,
  onSelectFilter,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [postGradType, setPostGradType] = useState(currentFilters.postGradType || 'all');
  const [country, setCountry] = useState(currentFilters.country || '');
  const [state, setState] = useState(currentFilters.state || '');
  const [city, setCity] = useState(currentFilters.city || '');
  const [lookingForRoommate, setLookingForRoommate] = useState(
    currentFilters.lookingForRoommate || false
  );
  const [filterName, setFilterName] = useState('');
  const [showSaveForm, setShowSaveForm] = useState(false);

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

  // Update local state when filters change
  useEffect(() => {
    setPostGradType(currentFilters.postGradType || 'all');
    setCountry(currentFilters.country || '');
    setState(currentFilters.state || '');
    setCity(currentFilters.city || '');
    setLookingForRoommate(currentFilters.lookingForRoommate || false);
  }, [currentFilters]);

  const handleFilterChange = (newFilters: Partial<FilterOptions>) => {
    const updatedFilters = { ...currentFilters, ...newFilters };
    setPostGradType(updatedFilters.postGradType || 'all');
    setCountry(updatedFilters.country || '');
    setState(updatedFilters.state || '');
    setCity(updatedFilters.city || '');
    setLookingForRoommate(updatedFilters.lookingForRoommate || false);
    onFilter(updatedFilters);
  };

  const handleSaveFilter = () => {
    if (!filterName) return;

    onSaveFilter(filterName, {
      postGradType,
      country,
      state,
      city,
      lookingForRoommate,
    });

    setFilterName('');
    setShowSaveForm(false);
  };

  const handleDeleteFilter = (name: string) => {
    onDeleteFilter(name);
  };

  const handleSelectFilter = (name: string) => {
    onSelectFilter(name);
  };

  const selectClasses =
    'w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-[#F9C5D1] focus:ring-2 focus:ring-[#F9C5D1]/20 outline-none transition-colors hover:border-[#F9C5D1]/50 cursor-pointer text-[#333333]';
  const labelClasses = 'block text-sm font-medium text-[#333333] mb-2';

  const showStateField = country === 'USA';

  return (
    <div className="relative" ref={filterPanelRef}>
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="flex cursor-pointer items-center gap-2 px-4 py-3 rounded-lg border border-gray-200 
                  hover:border-[#F9C5D1]/50 transition-colors text-[#333333]"
        whileHover={{ scale: 1.02, borderColor: 'rgba(249, 197, 209, 0.8)' }}
        whileTap={{ scale: 0.98 }}
      >
        <Filter className="h-4 w-4" />
        <span>Advanced Filters</span>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="absolute right-0 top-12 w-96 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden z-30"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit={{ opacity: 0, y: -10, transition: { duration: 0.2 } }}
          >
            <div className="p-5 max-h-[80vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-medium text-lg text-[#333333]">Advanced Filters</h3>
                <motion.button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-[#F28B82] transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X className="h-5 w-5" />
                </motion.button>
              </div>

              {/* Saved Filters Section */}
              {Object.keys(savedFilters).length > 0 && (
                <motion.div variants={itemVariants} className="mb-6">
                  <h4 className="text-sm font-medium text-[#333333] mb-2 flex items-center">
                    <Bookmark className="h-4 w-4 mr-2" />
                    Saved Filters
                  </h4>
                  <div className="space-y-2">
                    {Object.keys(savedFilters).map((name) => (
                      <SavedFilter
                        key={name}
                        name={name}
                        onSelect={() => handleSelectFilter(name)}
                        onDelete={() => handleDeleteFilter(name)}
                      />
                    ))}
                  </div>
                </motion.div>
              )}

              <div className="space-y-5">
                <motion.div variants={itemVariants}>
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
                      <option key={value} value={label}>
                        {label}
                      </option>
                    ))}
                  </select>
                </motion.div>

                {showStateField && (
                  <motion.div variants={itemVariants}>
                    <label className={labelClasses}>State</label>
                    <select
                      value={state}
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
                  </motion.div>
                )}

                <motion.div variants={itemVariants}>
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
                </motion.div>

                {/* Save Filter Form */}
                <AnimatePresence>
                  {showSaveForm && (
                    <motion.div
                      variants={itemVariants}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="pt-2"
                    >
                      <label className={labelClasses}>Filter Name</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={filterName}
                          onChange={(e) => setFilterName(e.target.value)}
                          placeholder="My favorite filter"
                          className="flex-1 px-4 py-2 rounded-lg border border-gray-200 focus:border-[#F9C5D1] focus:ring-2 focus:ring-[#F9C5D1]/20 outline-none"
                        />
                        <motion.button
                          onClick={handleSaveFilter}
                          disabled={!filterName}
                          className={`px-4 py-2 rounded-lg ${!filterName ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-[#F28B82] text-white hover:bg-[#F28B82]/90'}`}
                          whileHover={filterName ? { scale: 1.03 } : {}}
                          whileTap={filterName ? { scale: 0.97 } : {}}
                        >
                          Save
                        </motion.button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="pt-4 flex justify-between items-center border-t border-gray-100">
                  <motion.button
                    onClick={() => setShowSaveForm(!showSaveForm)}
                    className="flex items-center gap-2 text-sm text-[#F28B82] hover:text-[#E67C73] transition-colors"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    {showSaveForm ? (
                      <X className="h-4 w-4" />
                    ) : (
                      <BookmarkPlus className="h-4 w-4" />
                    )}
                    {showSaveForm ? 'Cancel' : 'Save This Filter'}
                  </motion.button>

                  <motion.button
                    onClick={() => {
                      handleFilterChange({
                        ...currentFilters,
                        postGradType: currentFilters.postGradType,
                        country: '',
                        state: '',
                        city: '',
                        lookingForRoommate: currentFilters.lookingForRoommate,
                      });
                    }}
                    className="flex items-center gap-2 text-sm text-gray-500 hover:text-[#333333] transition-colors"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <Trash2 className="h-4 w-4" />
                    Reset Location Filters
                  </motion.button>
                </div>
              </div>
            </div>

            <div className="p-4 bg-gray-50 border-t border-gray-100">
              <motion.button
                onClick={() => {
                  onFilter({
                    ...currentFilters,
                    postGradType: currentFilters.postGradType,
                    country,
                    state,
                    city,
                    lookingForRoommate: currentFilters.lookingForRoommate,
                  });
                  setIsOpen(false);
                }}
                className="w-full bg-gradient-to-r from-[#F9C5D1] to-[#F28B82] text-white py-3 rounded-lg font-medium flex items-center justify-center gap-2"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Check className="h-4 w-4" />
                Apply Filters
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
