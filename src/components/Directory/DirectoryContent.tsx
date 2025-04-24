import React, { useState, useCallback, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { UserGrid } from '@/components/UserGrid';
import { MdClear, MdSearch, MdRefresh, MdFilterList } from 'react-icons/md';
import {
  FaGraduationCap,
  FaBriefcase,
  FaHome,
  FaMapMarkerAlt,
  FaUserGraduate,
  FaChevronDown,
  FaChevronUp,
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { useDebounce } from '@/hooks/useDebounce';
import { useSession } from 'next-auth/react';
import { PostGradType } from '@prisma/client';

interface FilterOptions {
  postGradType?: 'work' | 'school' | 'internship' | 'all';
  country?: string;
  state?: string;
  city?: string;
  lookingForRoommate?: boolean;
  showAllClassYears?: boolean;
  classYear?: number;
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

// Mobile filter drawer animation variants
const mobileFilterVariants = {
  hidden: { height: 0, opacity: 0, overflow: 'hidden' },
  visible: {
    height: 'auto',
    opacity: 1,
    transition: {
      height: { type: 'spring', stiffness: 300, damping: 30 },
      opacity: { duration: 0.2 },
    },
  },
};

interface DirectoryContentProps {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
}

export const DirectoryContent: React.FC<DirectoryContentProps> = ({ filters, onFiltersChange }) => {
  const { data: session } = useSession();
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTypeFilter, setActiveTypeFilter] = useState<
    'all' | 'work' | 'school' | 'internship'
  >('all');
  const [isMapFullscreen, setIsMapFullscreen] = useState(false);
  const [showRoommateOnly, setShowRoommateOnly] = useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [windowWidth, setWindowWidth] = useState(0);
  const isMobile = windowWidth < 768; // md breakpoint

  // Initialize window width after component mounts to avoid hydration mismatch
  useEffect(() => {
    setWindowWidth(window.innerWidth);
  }, []);

  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const isSeeking = session?.user.postGradType === PostGradType.seeking;
  const userClassYear = session?.user?.classYear;

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

      // Add class year filter if user is not showing all class years
      if (filters.showAllClassYears) {
        params.showAllClassYears = 'true';
      } else if (userClassYear) {
        params.classYear = userClassYear.toString();
      }

      return new URLSearchParams(params);
    },
    [debouncedSearchQuery, filters, activeTypeFilter, showRoommateOnly, userClassYear]
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

  // Track window size for responsive behavior
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      // Close mobile filters if screen becomes larger than mobile breakpoint
      if (window.innerWidth >= 768 && mobileFiltersOpen) {
        setMobileFiltersOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [mobileFiltersOpen]);

  // Use React Query to fetch users
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: [
      'users',
      page,
      debouncedSearchQuery,
      filters,
      activeTypeFilter,
      showRoommateOnly,
      userClassYear,
    ],
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
    Object.entries(filters).some(
      ([key, value]) =>
        key !== 'showAllClassYears' && key !== 'classYear' && value && value !== 'all'
    ) ||
    searchQuery ||
    activeTypeFilter !== 'all' ||
    showRoommateOnly;

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    onFiltersChange({
      showAllClassYears: filters.showAllClassYears,
      classYear: filters.classYear,
    });
    setActiveTypeFilter('all');
    setShowRoommateOnly(false);
  };

  const handleTypeFilterChange = (type: 'all' | 'work' | 'school' | 'internship') => {
    // If already active, toggle off by setting back to 'all'
    if (activeTypeFilter === type && type !== 'all') {
      setActiveTypeFilter('all');
      // Also update the filters object to ensure consistency
      onFiltersChange({ ...filters, postGradType: undefined });
    } else {
      setActiveTypeFilter(type);
      // Also update the filters object to ensure consistency
      onFiltersChange({
        ...filters,
        postGradType: type === 'all' ? undefined : type,
      });
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

  const handleClassYearFilterChange = () => {
    // If showing all class years, toggle to just my class year
    onFiltersChange({
      ...filters,
      showAllClassYears: !filters.showAllClassYears,
    });
  };

  const toggleMobileFilters = () => {
    setMobileFiltersOpen((prev) => !prev);
  };

  // Get user's general location (city & state) if available
  const userCity = !isSeeking ? session?.user?.location.city : undefined;
  const userState = !isSeeking ? session?.user?.location.state : undefined;
  const hasUserLocation = !!(userCity && userState);

  // Check if My City filter is active
  const isMyCityActive =
    filters.city === userCity && filters.state === userState && filters.country === 'USA';

  const regionType = filters.state === 'DC' ? 'District' : 'State'; // handling edge case

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
          {/* Search Bar and Mobile Filter Toggle */}
          <div className="flex gap-2 items-center mb-3 md:mb-2">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <MdSearch className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search by name, company, school..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 focus:border-[#F9C5D1] focus:ring-2 focus:ring-[#F9C5D1]/20 outline-none transition-all text-gray-700 text-sm"
              />
              {searchQuery && (
                <button
                  className="absolute inset-y-0 right-3 flex items-center cursor-pointer"
                  onClick={() => setSearchQuery('')}
                >
                  <MdClear className="h-4 w-4 text-gray-400 hover:text-[#F28B82]" />
                </button>
              )}
            </div>

            {/* Mobile Filter Toggle Button */}
            <motion.button
              onClick={toggleMobileFilters}
              className="md:hidden flex items-center justify-center px-3 py-2.5 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-700 transition-all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Toggle filters"
            >
              <MdFilterList className="h-5 w-5" />
              <span className="ml-1 text-sm font-medium">
                Filters
                {mobileFiltersOpen ? (
                  <FaChevronUp className="inline-block ml-1 text-xs" />
                ) : (
                  <FaChevronDown className="inline-block ml-1 text-xs" />
                )}
              </span>
              {hasFiltersActive && (
                <span className="ml-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#F28B82] text-xs text-white">
                  {/* Count active filters */}
                  {(activeTypeFilter !== 'all' ? 1 : 0) +
                    (!!searchQuery ? 1 : 0) +
                    (isMyCityActive ? 1 : 0) +
                    (!isMyCityActive && !!filters.country ? 1 : 0) +
                    (!isMyCityActive && !!filters.state ? 1 : 0) +
                    (!isMyCityActive && !!filters.city ? 1 : 0) +
                    (showRoommateOnly || filters.lookingForRoommate ? 1 : 0)}
                </span>
              )}
            </motion.button>
          </div>

          {/* Desktop Filter UI - Always visible on md+ screens, animated drawer on mobile */}
          <div className="md:block">
            {/* For desktop: always visible - optimized for horizontal layout */}
            <div className="hidden md:block">
              <div className="flex items-start gap-4">
                {/* Desktop Filter Groups - Horizontal layout with reduced vertical space */}
                <div className="flex-1 flex gap-3">
                  {/* Status filter group */}
                  <div className="flex flex-col">
                    <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5 px-0.5">
                      Status
                    </h4>
                    <div className="flex items-center bg-gray-50 p-1 rounded-lg">
                      <motion.button
                        onClick={() => handleTypeFilterChange('all')}
                        className={`px-3 py-1.5 rounded-md ${
                          activeTypeFilter === 'all'
                            ? 'bg-[#F9C5D1]/10 text-[#F28B82] font-medium'
                            : 'text-gray-600 hover:bg-gray-100'
                        } transition-all text-sm flex items-center justify-center h-[34px]`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        All
                      </motion.button>

                      <motion.button
                        onClick={() => handleTypeFilterChange('work')}
                        className={`px-3 py-1.5 rounded-md ${
                          activeTypeFilter === 'work'
                            ? 'bg-[#F9C5D1]/10 text-[#F28B82] font-medium'
                            : 'text-gray-600 hover:bg-gray-100'
                        } transition-all text-sm flex items-center justify-center gap-1.5 h-[34px]`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <FaBriefcase className="text-xs" />
                        Working
                      </motion.button>

                      <motion.button
                        onClick={() => handleTypeFilterChange('school')}
                        className={`px-3 py-1.5 rounded-md ${
                          activeTypeFilter === 'school'
                            ? 'bg-[#F9C5D1]/10 text-[#F28B82] font-medium'
                            : 'text-gray-600 hover:bg-gray-100'
                        } transition-all text-sm flex items-center justify-center gap-1.5 h-[34px]`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <FaGraduationCap className="text-xs" />
                        Studying
                      </motion.button>

                      <motion.button
                        onClick={() => handleTypeFilterChange('internship')}
                        className={`px-3 py-1.5 rounded-md ${
                          activeTypeFilter === 'internship'
                            ? 'bg-[#F9C5D1]/10 text-[#F28B82] font-medium'
                            : 'text-gray-600 hover:bg-gray-100'
                        } transition-all text-sm flex items-center justify-center gap-1.5 h-[34px]`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <FaBriefcase className="text-xs" />
                        Intern
                      </motion.button>
                    </div>
                  </div>

                  {/* Secondary filters */}
                  <div className="flex flex-col">
                    <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5 px-0.5">
                      More Filters
                    </h4>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <motion.button
                        onClick={handleRoommateFilterChange}
                        className={`px-3 py-1.5 rounded-md ${
                          showRoommateOnly
                            ? 'bg-[#F9C5D1]/10 text-[#F28B82] font-medium'
                            : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                        } transition-all text-sm flex items-center justify-center gap-1.5 h-[34px]`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <FaHome className="text-xs" />
                        Roommates
                      </motion.button>

                      {hasUserLocation && (
                        <motion.button
                          onClick={handleMyCityFilterChange}
                          className={`px-3 py-1.5 rounded-md ${
                            isMyCityActive
                              ? 'bg-[#F9C5D1]/10 text-[#F28B82] font-medium'
                              : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                          } transition-all text-sm flex items-center justify-center gap-1.5 h-[34px]`}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <FaMapMarkerAlt className="text-xs" />
                          My City
                        </motion.button>
                      )}

                      {/* Class Year Toggle Button */}
                      {userClassYear && (
                        <motion.button
                          onClick={handleClassYearFilterChange}
                          className={`px-3 py-1.5 rounded-md ${
                            !filters.showAllClassYears
                              ? 'bg-[#F9C5D1]/10 text-[#F28B82] font-medium'
                              : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                          } transition-all text-sm flex items-center justify-center gap-1.5 h-[34px]`}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <FaUserGraduate className="text-xs" />
                          Class of {userClassYear}
                        </motion.button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* For mobile: animated drawer */}
            <AnimatePresence>
              {(mobileFiltersOpen || !isMobile) && (
                <motion.div
                  className="md:hidden"
                  variants={mobileFilterVariants}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                >
                  <div className="flex flex-col gap-4 py-2">
                    {/* Close button for mobile */}
                    <div className="flex justify-between items-center mb-1">
                      <h3 className="text-sm font-medium text-gray-700">Filters</h3>
                      <motion.button
                        onClick={toggleMobileFilters}
                        className="p-1 rounded-full hover:bg-gray-100 text-gray-500"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <MdClear size={20} />
                      </motion.button>
                    </div>

                    {/* Filter Groups - Redesigned for better mobile experience */}
                    <div className="flex flex-col gap-3 w-full">
                      {/* Status filter group with label */}
                      <div className="space-y-2">
                        <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider px-1">
                          Status
                        </h4>
                        <div className="flex flex-wrap items-center bg-gray-50 p-1 rounded-lg">
                          <motion.button
                            onClick={() => handleTypeFilterChange('all')}
                            className={`flex-1 px-3 py-1.5 rounded-md ${
                              activeTypeFilter === 'all'
                                ? 'bg-[#F9C5D1]/10 text-[#F28B82] font-medium'
                                : 'text-gray-600 hover:bg-gray-100'
                            } transition-all text-sm cursor-pointer`}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            All
                          </motion.button>

                          <motion.button
                            onClick={() => handleTypeFilterChange('work')}
                            className={`flex-1 px-3 py-1.5 rounded-md ${
                              activeTypeFilter === 'work'
                                ? 'bg-[#F9C5D1]/10 text-[#F28B82] font-medium'
                                : 'text-gray-600 hover:bg-gray-100'
                            } transition-all text-sm flex items-center justify-center gap-1.5 cursor-pointer`}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <FaBriefcase className="text-xs" />
                            Working
                          </motion.button>

                          <motion.button
                            onClick={() => handleTypeFilterChange('school')}
                            className={`flex-1 px-3 py-1.5 rounded-md ${
                              activeTypeFilter === 'school'
                                ? 'bg-[#F9C5D1]/10 text-[#F28B82] font-medium'
                                : 'text-gray-600 hover:bg-gray-100'
                            } transition-all text-sm flex items-center justify-center gap-1.5 cursor-pointer`}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <FaGraduationCap className="text-xs" />
                            Studying
                          </motion.button>

                          <motion.button
                            onClick={() => handleTypeFilterChange('internship')}
                            className={`flex-1 px-3 py-1.5 rounded-md ${
                              activeTypeFilter === 'internship'
                                ? 'bg-[#F9C5D1]/10 text-[#F28B82] font-medium'
                                : 'text-gray-600 hover:bg-gray-100'
                            } transition-all text-sm flex items-center justify-center gap-1.5 cursor-pointer`}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <FaBriefcase className="text-xs" />
                            Intern
                          </motion.button>
                        </div>
                      </div>

                      {/* Secondary filters with label */}
                      <div className="space-y-2">
                        <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider px-1">
                          More Filters
                        </h4>
                        <div className="grid grid-cols-2 md:flex flex-wrap gap-2">
                          <motion.button
                            onClick={handleRoommateFilterChange}
                            className={`px-3 py-1.5 rounded-md ${
                              showRoommateOnly
                                ? 'bg-[#F9C5D1]/10 text-[#F28B82] font-medium'
                                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                            } transition-all text-sm flex items-center justify-center gap-1.5 cursor-pointer`}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <FaHome className="text-xs" />
                            Roommates
                          </motion.button>

                          {hasUserLocation && (
                            <motion.button
                              onClick={handleMyCityFilterChange}
                              className={`px-3 py-1.5 rounded-md ${
                                isMyCityActive
                                  ? 'bg-[#F9C5D1]/10 text-[#F28B82] font-medium'
                                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                              } transition-all text-sm flex items-center justify-center gap-1.5 cursor-pointer`}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              <FaMapMarkerAlt className="text-xs" />
                              My City
                            </motion.button>
                          )}

                          {/* Class Year Toggle Button */}
                          {userClassYear && (
                            <motion.button
                              onClick={handleClassYearFilterChange}
                              className={`px-3 py-1.5 rounded-md ${
                                !filters.showAllClassYears
                                  ? 'bg-[#F9C5D1]/10 text-[#F28B82] font-medium'
                                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                              } transition-all text-sm flex items-center justify-center gap-1.5 cursor-pointer`}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              <FaUserGraduate className="text-xs" />
                              Class of {userClassYear}
                            </motion.button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Active filters section - enhanced for mobile with animations */}
          <AnimatePresence>
            {(hasFiltersActive || (userClassYear && !hasFiltersActive)) && (
              <motion.div
                className={`mt-3 pt-3 md:mt-2 md:pt-2 border-t border-gray-100 ${
                  isMobile && !mobileFiltersOpen ? 'hidden md:block' : 'block'
                }`}
                variants={mobileFilterVariants}
                initial={isMobile ? 'hidden' : 'visible'}
                animate="visible"
                exit="hidden"
              >
                <div className="flex flex-wrap items-center gap-2 min-h-[28px]">
                  {hasFiltersActive && (
                    <>
                      {/* Label - Mobile only */}
                      <span className="text-xs font-medium text-gray-500 uppercase tracking-wider w-full mb-2 md:hidden">
                        Active filters
                      </span>

                      {/* Desktop layout - label inline with filters */}
                      <span className="hidden md:inline-block text-sm font-medium text-gray-500 mr-1">
                        Active:
                      </span>

                      <div className="flex flex-wrap gap-2 w-full md:w-auto md:flex-1">
                        {activeTypeFilter !== 'all' && (
                          <motion.span
                            className="px-2 py-0.5 md:px-2.5 md:py-1 bg-gray-100 rounded-md text-xs md:text-sm text-gray-700 flex items-center"
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            whileHover={{ scale: 1.05 }}
                          >
                            {activeTypeFilter === 'work'
                              ? 'Working'
                              : activeTypeFilter === 'school'
                                ? 'Studying'
                                : 'Internship'}
                            <button
                              onClick={() => {
                                setActiveTypeFilter('all');
                                onFiltersChange({ ...filters, postGradType: undefined });
                              }}
                              className="ml-1 text-gray-500 hover:text-[#F28B82] cursor-pointer"
                            >
                              <MdClear size={12} className="md:h-4 md:w-4" />
                            </button>
                          </motion.span>
                        )}

                        {searchQuery && (
                          <motion.span
                            className="px-2 py-0.5 md:px-2.5 md:py-1 bg-gray-100 rounded-md text-xs md:text-sm text-gray-700 flex items-center"
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            whileHover={{ scale: 1.05 }}
                          >
                            Search:{' '}
                            {searchQuery.length > 15
                              ? `${searchQuery.substring(0, 15)}...`
                              : searchQuery}
                            <button
                              onClick={() => setSearchQuery('')}
                              className="ml-1 text-gray-500 hover:text-[#F28B82] cursor-pointer"
                            >
                              <MdClear size={12} className="md:h-4 md:w-4" />
                            </button>
                          </motion.span>
                        )}

                        {/* My City filter pill */}
                        {isMyCityActive && (
                          <motion.span
                            className="px-2 py-0.5 md:px-2.5 md:py-1 bg-gray-100 rounded-md text-xs md:text-sm text-gray-700 flex items-center"
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
                              className="ml-1 text-gray-500 hover:text-[#F28B82] cursor-pointer"
                            >
                              <MdClear size={12} className="md:h-4 md:w-4" />
                            </button>
                          </motion.span>
                        )}

                        {/* Only show country/state/city filters if My City filter is not active */}
                        {filters.country && !isMyCityActive && (
                          <motion.span
                            className="px-2 py-0.5 md:px-2.5 md:py-1 bg-gray-100 rounded-md text-xs md:text-sm text-gray-700 flex items-center"
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
                              className="ml-1 text-gray-500 hover:text-[#F28B82] cursor-pointer"
                            >
                              <MdClear size={12} className="md:h-4 md:w-4" />
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
                            {regionType}: {filters.state}
                            <button
                              onClick={() =>
                                onFiltersChange({ ...filters, state: undefined, city: undefined })
                              }
                              className="ml-1 text-gray-500 hover:text-[#F28B82] cursor-pointer"
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
                              className="ml-1 text-gray-500 hover:text-[#F28B82] cursor-pointer"
                            >
                              <MdClear size={14} />
                            </button>
                          </motion.span>
                        )}

                        {/* Roommate filter pill */}
                        {(showRoommateOnly || filters.lookingForRoommate) && (
                          <motion.span
                            className="px-2 py-0.5 md:px-2.5 md:py-1 bg-gray-100 rounded-md text-xs md:text-sm text-gray-700 flex items-center"
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
                              className="ml-1 text-gray-500 hover:text-[#F28B82] cursor-pointer"
                            >
                              <MdClear size={12} className="md:h-4 md:w-4" />
                            </button>
                          </motion.span>
                        )}
                      </div>

                      <button
                        onClick={handleClearFilters}
                        className="mt-2 w-full md:w-auto md:mt-0 md:ml-2 text-xs md:text-sm px-3 py-1 md:px-3 md:py-1 text-[#F28B82] bg-[#F9C5D1]/5 rounded-md hover:bg-[#F9C5D1]/10 transition-colors flex items-center justify-center md:justify-start gap-1 cursor-pointer"
                      >
                        <MdClear size={12} className="md:h-4 md:w-4" />
                        <span className="md:hidden">Clear all filters</span>
                        <span className="hidden md:inline">Clear</span>
                      </button>
                    </>
                  )}

                  {/* Class Year Indicator - always visible if class year exists */}
                  {userClassYear && !hasFiltersActive && (
                    <motion.span
                      className="px-2 py-0.5 md:px-2.5 md:py-1 bg-gray-100 rounded-md text-xs md:text-sm text-gray-700 flex items-center"
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.8, opacity: 0 }}
                      whileHover={{ scale: 1.05 }}
                    >
                      <span className="md:hidden">
                        {!filters.showAllClassYears
                          ? `Showing only class of ${userClassYear}`
                          : `Showing all class years`}
                      </span>
                      <span className="hidden md:inline">
                        {!filters.showAllClassYears ? `Class of ${userClassYear}` : `All classes`}
                      </span>
                    </motion.span>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Stats Bar - Improved for mobile */}
        <motion.div
          className="flex justify-between items-center bg-white rounded-lg shadow-sm border border-gray-100 px-4 py-2.5"
          variants={itemVariants}
        >
          <div className="text-sm font-medium text-gray-700">
            <span className="text-[#F28B82] font-semibold">{totalUsers}</span> students
            {hasFiltersActive && <span className="hidden sm:inline"> with current filters</span>}
          </div>

          <motion.button
            onClick={() => refetch()}
            className="text-sm flex items-center gap-1.5 text-gray-700 hover:text-[#F28B82] transition-colors px-2 py-1 rounded-lg hover:bg-gray-50 cursor-pointer"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <MdRefresh className="h-4 w-4" />
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
                  className="px-4 py-2 bg-[#F9C5D1]/10 text-[#F28B82] rounded-lg hover:bg-[#F9C5D1]/20 transition-all cursor-pointer"
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
              <div className="p-6 bg-gradient-to-b from-white to-gray-50/30">
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
