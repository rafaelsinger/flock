import React, { useState, useCallback, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FilterPanel } from '@/components/FilterPanel';
import { UserGrid } from '@/components/UserGrid';
import { MdClear, MdSearch, MdRefresh } from 'react-icons/md';
import { FaGraduationCap, FaBriefcase, FaHome, FaMapMarkerAlt } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { useDebounce } from '@/hooks/useDebounce';
import { useSession } from 'next-auth/react';
import { PostGradType } from '@prisma/client';

interface FilterOptions {
  postGradType?: 'work' | 'school' | 'all';
  country?: string;
  state?: string;
  city?: string;
  savedFilter?: string;
  lookingForRoommate?: boolean;
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

interface DirectoryContentProps {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  savedFilters: Record<string, FilterOptions>;
  onSaveFilter: (name: string, filter: FilterOptions) => void;
  onDeleteFilter: (name: string) => void;
  onSelectFilter: (name: string) => void;
}

export const DirectoryContent: React.FC<DirectoryContentProps> = ({
  filters,
  onFiltersChange,
  savedFilters,
  onSaveFilter,
  onDeleteFilter,
  onSelectFilter,
}) => {
  const { data: session } = useSession();
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTypeFilter, setActiveTypeFilter] = useState<'all' | 'work' | 'school'>('all');
  const [isMapFullscreen, setIsMapFullscreen] = useState(false);
  const [showRoommateOnly, setShowRoommateOnly] = useState(false);

  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const isSeeking = session?.user.postGradType === PostGradType.seeking;

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

      // Add post grad type filter - from filters object or active filter button
      const postGradType =
        filters.postGradType || (activeTypeFilter !== 'all' ? activeTypeFilter : undefined);

      if (postGradType && postGradType !== 'all') {
        params.postGradType = postGradType;
      }
      console.log({ filters });
      // Add location filters
      if (filters.country) {
        params.country = filters.country;
      }

      if (filters.state) {
        params.state = filters.state;
      }

      if (filters.city) {
        params.city = filters.city;
      }

      // Add roommate filter - from filters object or roommate button
      if (filters.lookingForRoommate || showRoommateOnly) {
        params.lookingForRoommate = 'true';
      }

      return new URLSearchParams(params);
    },
    [debouncedSearchQuery, filters, activeTypeFilter, showRoommateOnly]
  );

  // Reset to page 1 when search or filters change
  useEffect(() => {
    setPage(1);
  }, [debouncedSearchQuery, filters, activeTypeFilter, showRoommateOnly]);

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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    Object.entries(filters).some(([_, value]) => value && value !== 'all') ||
    searchQuery ||
    activeTypeFilter !== 'all' ||
    showRoommateOnly;

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleFilter = (newFilters: FilterOptions) => {
    onFiltersChange(newFilters);
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    onFiltersChange({});
    setActiveTypeFilter('all');
    setShowRoommateOnly(false);
  };

  const handleTypeFilterChange = (type: 'all' | 'work' | 'school') => {
    // If already active, toggle off by setting back to 'all'
    if (activeTypeFilter === type && type !== 'all') {
      setActiveTypeFilter('all');
      // Also update the filters object to ensure consistency
      onFiltersChange({ ...filters, postGradType: undefined });
    } else {
      setActiveTypeFilter(type);
      // Also update the filters object to ensure consistency
      onFiltersChange({ ...filters, postGradType: type === 'all' ? undefined : type });
    }
  };

  const handleRoommateFilterChange = () => {
    const newValue = !showRoommateOnly;
    setShowRoommateOnly(newValue);

    // Update the filters object to match the UI state
    onFiltersChange({
      ...filters,
      lookingForRoommate: newValue ? true : undefined,
    });
  };

  const handleMyCityFilterChange = () => {
    // If already active, toggle off
    if (isSeeking) return;
    if (isMyCityActive) {
      onFiltersChange({
        ...filters,
        country: undefined,
        state: undefined,
        city: undefined,
      });
    } else {
      // Set to user's location
      onFiltersChange({
        ...filters,
        city: userCity,
        state: userState,
        country: 'USA',
      });
    }
  };

  // Get user's general location (city & state) if available
  const userCity = !isSeeking ? session?.user?.location.city : undefined;
  const userState = !isSeeking ? session?.user?.location.state : undefined;
  const hasUserLocation = !!(userCity && userState);

  // Check if My City filter is active
  const isMyCityActive =
    filters.city === userCity && filters.state === userState && filters.country === 'USA';

  // Determine content to render based on fullscreen state
  const renderContent = () => {
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
                placeholder="Search by name, company, school, or location..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-200 focus:border-[#F9C5D1] focus:ring-2 focus:ring-[#F9C5D1]/20 outline-none transition-all text-gray-700"
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

              <motion.button
                onClick={handleRoommateFilterChange}
                className={`px-4 py-2 rounded-full border ${
                  showRoommateOnly
                    ? 'bg-[#8FC9A9]/10 border-[#8FC9A9] text-[#8FC9A9]'
                    : 'border-gray-200 text-gray-600 hover:border-[#8FC9A9]'
                } transition-all flex items-center gap-2`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <FaHome className="text-sm" />
                <span>Roommates</span>
              </motion.button>

              {hasUserLocation && (
                <motion.button
                  onClick={handleMyCityFilterChange}
                  className={`px-4 py-2 rounded-full border ${
                    isMyCityActive
                      ? 'bg-[#A7D7F9]/10 border-[#A7D7F9] text-[#A7D7F9]'
                      : 'border-gray-200 text-gray-600 hover:border-[#F9C5D1]'
                  } transition-all flex items-center gap-2`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FaMapMarkerAlt className="text-sm" />
                  <span>My City</span>
                </motion.button>
              )}

              <div className="flex-grow md:flex-grow-0 text-right md:text-left">
                <FilterPanel
                  onFilter={handleFilter}
                  currentFilters={filters}
                  savedFilters={savedFilters}
                  onSaveFilter={onSaveFilter}
                  onDeleteFilter={onDeleteFilter}
                  onSelectFilter={onSelectFilter}
                />
              </div>
            </div>
          </div>

          {/* Active filters section - always visible with border */}
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex flex-wrap items-center gap-2 min-h-[28px]">
              {hasFiltersActive && (
                <>
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
                        onClick={() => {
                          setActiveTypeFilter('all');
                          onFiltersChange({ ...filters, postGradType: undefined });
                        }}
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
                      className="px-2 py-1 bg-gray-100 rounded-md text-xs text-gray-700 flex items-center"
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.8, opacity: 0 }}
                      whileHover={{ scale: 1.05 }}
                    >
                      Saved: {filters.savedFilter}
                      <button
                        onClick={() => onFiltersChange({ ...filters, savedFilter: undefined })}
                        className="ml-1 text-gray-500 hover:text-[#F28B82]"
                      >
                        <MdClear size={14} />
                      </button>
                    </motion.span>
                  )}

                  {/* My City filter pill */}
                  {isMyCityActive && (
                    <motion.span
                      className="px-2 py-1 bg-gray-100 rounded-md text-xs text-gray-700 flex items-center"
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.8, opacity: 0 }}
                      whileHover={{ scale: 1.05 }}
                    >
                      My City: {userCity}, {userState}
                      <button
                        onClick={() =>
                          onFiltersChange({
                            ...filters,
                            country: undefined,
                            state: undefined,
                            city: undefined,
                          })
                        }
                        className="ml-1 text-gray-500 hover:text-[#F28B82]"
                      >
                        <MdClear size={14} />
                      </button>
                    </motion.span>
                  )}

                  {/* Only show country/state/city filters if My City filter is not active */}
                  {filters.country && !isMyCityActive && (
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
                          onFiltersChange({
                            ...filters,
                            country: undefined,
                            state: undefined,
                            city: undefined,
                          })
                        }
                        className="ml-1 text-gray-500 hover:text-[#F28B82]"
                      >
                        <MdClear size={14} />
                      </button>
                    </motion.span>
                  )}

                  {filters.state && !isMyCityActive && (
                    <motion.span
                      className="px-2 py-1 bg-gray-100 rounded-md text-xs text-gray-700 flex items-center"
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.8, opacity: 0 }}
                      whileHover={{ scale: 1.05 }}
                    >
                      State: {filters.state}
                      <button
                        onClick={() =>
                          onFiltersChange({ ...filters, state: undefined, city: undefined })
                        }
                        className="ml-1 text-gray-500 hover:text-[#F28B82]"
                      >
                        <MdClear size={14} />
                      </button>
                    </motion.span>
                  )}

                  {filters.city && !isMyCityActive && (
                    <motion.span
                      className="px-2 py-1 bg-gray-100 rounded-md text-xs text-gray-700 flex items-center"
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.8, opacity: 0 }}
                      whileHover={{ scale: 1.05 }}
                    >
                      City: {filters.city}
                      <button
                        onClick={() => onFiltersChange({ ...filters, city: undefined })}
                        className="ml-1 text-gray-500 hover:text-[#F28B82]"
                      >
                        <MdClear size={14} />
                      </button>
                    </motion.span>
                  )}

                  {/* Roommate filter pill */}
                  {(showRoommateOnly || filters.lookingForRoommate) && (
                    <motion.span
                      className="px-2 py-1 bg-gray-100 rounded-md text-xs text-gray-700 flex items-center"
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.8, opacity: 0 }}
                      whileHover={{ scale: 1.05 }}
                    >
                      Looking for Roommates
                      <button
                        onClick={() => {
                          setShowRoommateOnly(false);
                          onFiltersChange({ ...filters, lookingForRoommate: undefined });
                        }}
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
                </>
              )}
            </div>
          </div>
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
