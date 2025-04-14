import React, { useState, useCallback, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FilterPanel } from '@/components/FilterPanel';
import { UserGrid } from '@/components/UserGrid';
import { MdClear, MdSearch, MdRefresh, MdFullscreen, MdFullscreenExit } from 'react-icons/md';
import { FaGraduationCap, FaBriefcase } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { useDebounce } from '@/hooks/useDebounce';
import { Map } from '@/components/Map';
import { useSession } from 'next-auth/react';

interface FilterOptions {
  postGradType?: 'work' | 'school' | 'all';
  country?: string;
  state?: string;
  city?: string;
  savedFilter?: string;
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
  const { data: session } = useSession();
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FilterOptions>({});
  const [activeTypeFilter, setActiveTypeFilter] = useState<'all' | 'work' | 'school'>('all');
  const [isMapFullscreen, setIsMapFullscreen] = useState(false);

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

      return new URLSearchParams(params);
    },
    [debouncedSearchQuery, filters, activeTypeFilter]
  );

  // Reset to page 1 when search or filters change
  useEffect(() => {
    setPage(1);
  }, [debouncedSearchQuery, filters, activeTypeFilter]);

  // Handle escape key to exit fullscreen map
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isMapFullscreen) {
        setIsMapFullscreen(false);
      }
    };

    window.addEventListener('keydown', handleEscKey);
    return () => window.removeEventListener('keydown', handleEscKey);
  }, [isMapFullscreen]);

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

  // Get user's general location (city & state) if available
  const userCity = session?.user?.city;
  const userState = session?.user?.state;
  const hasUserLocation = !!(userCity && userState);

  // Determine content to render based on fullscreen state
  const renderContent = () => {
    if (isMapFullscreen) {
      return (
        <motion.div
          className="fixed inset-0 z-50 bg-white"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="h-full relative">
            <Map />

            <motion.button
              onClick={() => setIsMapFullscreen(false)}
              className="absolute top-4 right-4 z-10 bg-white p-2 rounded-full shadow-md hover:shadow-lg transition-all text-gray-800"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <MdFullscreenExit size={24} />
            </motion.button>
          </div>
        </motion.div>
      );
    }

    return (
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        {/* Map Section */}
        <motion.div
          className="h-[500px] rounded-xl overflow-hidden bg-white shadow-sm border border-gray-100 relative"
          variants={itemVariants}
          whileHover={{ boxShadow: '0 10px 25px -5px rgba(167, 215, 249, 0.15)' }}
        >
          <Map />

          <motion.button
            onClick={() => setIsMapFullscreen(true)}
            className="absolute top-4 right-4 z-10 bg-white p-2 rounded-full shadow-md hover:shadow-lg transition-all text-gray-800"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <MdFullscreen size={24} />
          </motion.button>
        </motion.div>

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
                placeholder="Search by name, company, school, location, or email..."
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

            {/* Quick filter buttons */}
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

              {hasUserLocation && (
                <motion.button
                  onClick={() =>
                    handleFilter({
                      ...filters,
                      city: userCity,
                      state: userState,
                      country: 'USA',
                    })
                  }
                  className="px-4 py-2 rounded-full border border-gray-200 text-gray-600 hover:border-[#F9C5D1] transition-all flex items-center gap-2"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span>My City</span>
                </motion.button>
              )}

              <div className="flex-grow md:flex-grow-0 text-right md:text-left">
                <FilterPanel onFilter={handleFilter} currentFilters={filters} />
              </div>
            </div>
          </div>

          {/* Active filters summary */}
          <AnimatePresence>
            {hasFiltersActive && (
              <motion.div
                className="mt-4 pt-4 border-t border-gray-100 flex flex-wrap items-center gap-2"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <span className="text-sm text-gray-500">Active filters:</span>

                {activeTypeFilter !== 'all' && (
                  <motion.span
                    className="px-2 py-1 bg-gray-100 rounded-md text-xs text-gray-700 flex items-center"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    whileHover={{ scale: 1.05 }}
                  >
                    {activeTypeFilter === 'work' ? 'Working' : 'Studying'}
                    <button
                      onClick={() => setActiveTypeFilter('all')}
                      className="ml-1 text-gray-500 hover:text-[#F28B82]"
                    >
                      <MdClear size={14} />
                    </button>
                  </motion.span>
                )}

                {searchQuery && (
                  <motion.span
                    className="px-2 py-1 bg-gray-100 rounded-md text-xs text-gray-700 flex items-center"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    whileHover={{ scale: 1.05 }}
                  >
                    Search:{' '}
                    {searchQuery.length > 15 ? `${searchQuery.substring(0, 15)}...` : searchQuery}
                    <button
                      onClick={() => setSearchQuery('')}
                      className="ml-1 text-gray-500 hover:text-[#F28B82]"
                    >
                      <MdClear size={14} />
                    </button>
                  </motion.span>
                )}

                {filters.savedFilter && (
                  <motion.span
                    className="px-2 py-1 bg-[#F9C5D1]/10 rounded-md text-xs text-[#F28B82] flex items-center"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    whileHover={{ scale: 1.05 }}
                  >
                    Saved: {filters.savedFilter}
                    <button
                      onClick={() => setFilters({})}
                      className="ml-1 text-gray-500 hover:text-[#F28B82]"
                    >
                      <MdClear size={14} />
                    </button>
                  </motion.span>
                )}

                {filters.country && (
                  <motion.span
                    className="px-2 py-1 bg-gray-100 rounded-md text-xs text-gray-700 flex items-center"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    whileHover={{ scale: 1.05 }}
                  >
                    Country: {filters.country}
                    <button
                      onClick={() =>
                        setFilters({ ...filters, country: undefined, state: undefined })
                      }
                      className="ml-1 text-gray-500 hover:text-[#F28B82]"
                    >
                      <MdClear size={14} />
                    </button>
                  </motion.span>
                )}

                {filters.state && (
                  <motion.span
                    className="px-2 py-1 bg-gray-100 rounded-md text-xs text-gray-700 flex items-center"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    whileHover={{ scale: 1.05 }}
                  >
                    State: {filters.state}
                    <button
                      onClick={() => setFilters({ ...filters, state: undefined })}
                      className="ml-1 text-gray-500 hover:text-[#F28B82]"
                    >
                      <MdClear size={14} />
                    </button>
                  </motion.span>
                )}

                {filters.city && (
                  <motion.span
                    className="px-2 py-1 bg-gray-100 rounded-md text-xs text-gray-700 flex items-center"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    whileHover={{ scale: 1.05 }}
                  >
                    City: {filters.city}
                    <button
                      onClick={() => setFilters({ ...filters, city: undefined })}
                      className="ml-1 text-gray-500 hover:text-[#F28B82]"
                    >
                      <MdClear size={14} />
                    </button>
                  </motion.span>
                )}

                <button
                  onClick={handleClearFilters}
                  className="ml-auto text-xs px-3 py-1 text-[#F28B82] hover:text-[#E67C73] transition-colors flex items-center gap-1"
                >
                  <MdClear size={14} />
                  Clear all
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Stats Bar */}
        <motion.div className="flex justify-between items-center px-2" variants={itemVariants}>
          <div className="text-sm font-medium text-[#666666]">
            <span className="text-[#F28B82]">{totalUsers}</span> graduates found
            {hasFiltersActive && ' with current filters'}
          </div>

          <motion.button
            onClick={() => refetch()}
            className="text-sm flex items-center gap-1 text-[#666666] hover:text-[#F28B82] transition-colors px-3 py-2 rounded-lg hover:bg-white"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <MdRefresh />
            <span className="hidden sm:inline">Refresh</span>
          </motion.button>
        </motion.div>

        {/* Directory Content (Grid) */}
        <motion.div
          className="bg-white rounded-xl shadow-sm border border-gray-100 min-h-[50vh] flex flex-col relative overflow-hidden"
          variants={itemVariants}
        >
          <AnimatePresence mode="wait">
            {error ? (
              <motion.div
                key="error"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-12 flex-1 flex flex-col items-center justify-center p-6"
              >
                <div className="text-[#F28B82] text-5xl mb-4">😢</div>
                <h3 className="text-xl font-medium text-[#333333] mb-2">
                  Oops! Something went wrong
                </h3>
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
              </motion.div>
            ) : (
              <div className="p-6">
                <UserGrid
                  users={users}
                  loading={isLoading}
                  page={page}
                  totalPages={totalPages}
                  onPageChange={setPage}
                />
              </div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    );
  };

  return <AnimatePresence mode="wait">{renderContent()}</AnimatePresence>;
};
