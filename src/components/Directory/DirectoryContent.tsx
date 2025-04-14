import React, { useState, useCallback, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FilterPanel } from '@/components/FilterPanel';
import { UserGrid } from '@/components/UserGrid';
import { MdFilterList, MdClear, MdSearch, MdRefresh } from 'react-icons/md';
import { FaGraduationCap, FaBriefcase } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { useDebounce } from '@/hooks/useDebounce';

interface FilterOptions {
  postGradType?: 'work' | 'school' | 'all';
  country?: string;
  state?: string;
  city?: string;
  industry?: string;
}

const ITEMS_PER_PAGE = 12;

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 },
};

export const DirectoryContent: React.FC = () => {
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FilterOptions>({});
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [activeTypeFilter, setActiveTypeFilter] = useState<'all' | 'work' | 'school'>('all');

  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Helper function to build query parameters
  const buildQueryParams = useCallback(
    (pageNum: number) => {
      const params: Record<string, string> = {
        page: pageNum.toString(),
        limit: ITEMS_PER_PAGE.toString(),
      };

      // Add search query if present
      if (debouncedSearchQuery) {
        params.search = debouncedSearchQuery;
      }

      // Add filters if present
      if (filters.postGradType && filters.postGradType !== 'all') {
        params.postGradType = filters.postGradType;
      } else if (activeTypeFilter !== 'all') {
        params.postGradType = activeTypeFilter;
      }

      if (filters.country) {
        params.country = filters.country;
      }

      if (filters.state) {
        params.state = filters.state;
      }

      if (filters.city) {
        params.city = filters.city;
      }

      if (filters.industry && filters.industry !== 'all') {
        params.industry = filters.industry;
      }

      return new URLSearchParams(params);
    },
    [debouncedSearchQuery, filters, activeTypeFilter]
  );

  // Reset to page 1 when search or filters change
  useEffect(() => {
    setPage(1);
  }, [debouncedSearchQuery, filters, activeTypeFilter]);

  // Use React Query to fetch users
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['users', page, debouncedSearchQuery, filters, activeTypeFilter],
    queryFn: async () => {
      const queryParams = buildQueryParams(page);
      const response = await fetch(`/api/users?${queryParams}`);
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      return response.json();
    },
  });

  const users = data?.users || [];
  const totalUsers = data?.total || 0;
  const totalPages = data ? Math.ceil(data.total / ITEMS_PER_PAGE) : 1;
  const hasFiltersActive =
    Object.keys(filters).length > 0 || searchQuery || activeTypeFilter !== 'all';

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleFilter = (newFilters: FilterOptions) => {
    setFilters(newFilters);
    setIsFilterOpen(false);
  };

  // Modify the handleClearFilters function
  const handleClearFilters = () => {
    setSearchQuery('');
    setFilters({});
    setActiveTypeFilter('all');
  };

  const handleTypeFilterChange = (type: 'all' | 'work' | 'school') => {
    setActiveTypeFilter(type);
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Search and Filters */}
      <motion.div
        className="bg-white rounded-xl p-5 shadow-sm border border-gray-100"
        variants={itemVariants}
      >
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search Bar */}
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <MdSearch className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by name, company, school, location..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-200 focus:border-[#F9C5D1] focus:ring-2 focus:ring-[#F9C5D1]/20 outline-none transition-all"
            />
            {searchQuery && (
              <button
                className="absolute inset-y-0 right-4 flex items-center"
                onClick={() => setSearchQuery('')}
              >
                <MdClear className="h-5 w-5 text-gray-400 hover:text-[#F28B82]" />
              </button>
            )}
          </div>

          {/* Quick filters */}
          <div className="flex flex-wrap gap-2 items-center">
            <motion.button
              onClick={() => handleTypeFilterChange('all')}
              className={`px-4 py-2 rounded-full border ${
                activeTypeFilter === 'all'
                  ? 'bg-[#F9C5D1]/10 border-[#F28B82] text-[#F28B82]'
                  : 'border-gray-200 text-gray-600 hover:border-[#F9C5D1]'
              } transition-all flex items-center gap-2`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span>All</span>
            </motion.button>

            <motion.button
              onClick={() => handleTypeFilterChange('work')}
              className={`px-4 py-2 rounded-full border ${
                activeTypeFilter === 'work'
                  ? 'bg-[#F9C5D1]/10 border-[#F28B82] text-[#F28B82]'
                  : 'border-gray-200 text-gray-600 hover:border-[#F9C5D1]'
              } transition-all flex items-center gap-2`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FaBriefcase className="text-sm" />
              <span>Working</span>
            </motion.button>

            <motion.button
              onClick={() => handleTypeFilterChange('school')}
              className={`px-4 py-2 rounded-full border ${
                activeTypeFilter === 'school'
                  ? 'bg-[#A7D7F9]/10 border-[#A7D7F9] text-[#A7D7F9]'
                  : 'border-gray-200 text-gray-600 hover:border-[#A7D7F9]'
              } transition-all flex items-center gap-2`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FaGraduationCap className="text-sm" />
              <span>Studying</span>
            </motion.button>

            <motion.button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={`px-4 py-2 rounded-full border ${
                isFilterOpen || Object.keys(filters).length > 0
                  ? 'bg-[#F9C5D1]/10 border-[#F28B82] text-[#F28B82]'
                  : 'border-gray-200 text-gray-600 hover:border-[#F9C5D1]'
              } transition-all flex items-center gap-2`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <MdFilterList />
              <span>
                More Filters {Object.keys(filters).length > 0 && `(${Object.keys(filters).length})`}
              </span>
            </motion.button>
          </div>
        </div>

        {/* Advanced Filters Panel */}
        <AnimatePresence>
          {isFilterOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden mt-4 pt-4 border-t border-gray-100"
            >
              <FilterPanel onFilter={handleFilter} currentFilters={filters} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Active filters summary */}
        {hasFiltersActive && (
          <motion.div
            className="mt-4 pt-4 border-t border-gray-100 flex flex-wrap items-center gap-2"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <span className="text-sm text-gray-500">Active filters:</span>

            {activeTypeFilter !== 'all' && (
              <span className="px-2 py-1 bg-gray-100 rounded-md text-xs text-gray-700 flex items-center">
                {activeTypeFilter === 'work' ? 'Working' : 'Studying'}
                <button
                  onClick={() => setActiveTypeFilter('all')}
                  className="ml-1 text-gray-500 hover:text-[#F28B82]"
                >
                  <MdClear size={14} />
                </button>
              </span>
            )}

            {searchQuery && (
              <span className="px-2 py-1 bg-gray-100 rounded-md text-xs text-gray-700 flex items-center">
                Search:{' '}
                {searchQuery.length > 15 ? `${searchQuery.substring(0, 15)}...` : searchQuery}
                <button
                  onClick={() => setSearchQuery('')}
                  className="ml-1 text-gray-500 hover:text-[#F28B82]"
                >
                  <MdClear size={14} />
                </button>
              </span>
            )}

            {Object.entries(filters).map(([key, value]) => {
              if (!value || value === 'all') return null;
              return (
                <span
                  key={key}
                  className="px-2 py-1 bg-gray-100 rounded-md text-xs text-gray-700 flex items-center"
                >
                  {key}: {value}
                  <button
                    onClick={() => setFilters({ ...filters, [key]: undefined })}
                    className="ml-1 text-gray-500 hover:text-[#F28B82]"
                  >
                    <MdClear size={14} />
                  </button>
                </span>
              );
            })}

            <button
              onClick={handleClearFilters}
              className="ml-auto text-xs px-3 py-1 text-[#F28B82] hover:text-[#E67C73] transition-colors flex items-center gap-1"
            >
              <MdClear size={14} />
              Clear all
            </button>
          </motion.div>
        )}
      </motion.div>

      {/* Results Stats */}
      <motion.div variants={itemVariants} className="flex justify-between items-center px-2">
        <div className="text-sm text-[#666666]">
          <span className="font-medium">{totalUsers}</span> graduates found
          {hasFiltersActive && ' with current filters'}
        </div>

        <motion.button
          onClick={() => refetch()}
          className="text-sm flex items-center gap-1 text-[#666666] hover:text-[#F28B82] transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <MdRefresh />
          <span>Refresh</span>
        </motion.button>
      </motion.div>

      {/* Directory Content */}
      <motion.div
        className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 min-h-[50vh] flex flex-col"
        variants={itemVariants}
      >
        {error ? (
          <div className="text-center py-12 flex-1 flex flex-col items-center justify-center">
            <div className="text-[#F28B82] text-5xl mb-4">😢</div>
            <h3 className="text-xl font-medium text-[#333333] mb-2">Oops! Something went wrong</h3>
            <p className="text-[#666666] mb-6">
              We couldn&apos;t load the directory. Please try again later.
            </p>
            <motion.button
              onClick={() => refetch()}
              className="px-4 py-2 bg-[#F9C5D1]/10 text-[#F28B82] rounded-lg hover:bg-[#F9C5D1]/20 transition-all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="flex items-center gap-2">
                <MdRefresh />
                <span>Try Again</span>
              </div>
            </motion.button>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={`${debouncedSearchQuery}-${JSON.stringify(filters)}-${activeTypeFilter}-${page}`}
              className="flex flex-col flex-grow justify-between"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <UserGrid
                users={users}
                loading={isLoading}
                page={page}
                totalPages={totalPages}
                onPageChange={setPage}
              />
            </motion.div>
          </AnimatePresence>
        )}
      </motion.div>
    </motion.div>
  );
};
