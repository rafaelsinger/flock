import React, { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { SearchBar } from '@/components/SearchBar';
import { FilterPanel } from '@/components/FilterPanel';
import { UserGrid } from '@/components/UserGrid';

interface FilterOptions {
  postGradType?: 'work' | 'school' | 'all';
  country?: string;
  state?: string;
  city?: string;
  industry?: string;
}

const ITEMS_PER_PAGE = 12;

export const DirectoryContent: React.FC = () => {
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FilterOptions>({});

  // Helper function to build query parameters
  const buildQueryParams = useCallback(
    (pageNum: number) => {
      const params: Record<string, string> = {
        page: pageNum.toString(),
        limit: ITEMS_PER_PAGE.toString(),
      };

      // Add search query if present
      if (searchQuery) {
        params.search = searchQuery;
      }

      // Add filters if present
      if (filters.postGradType && filters.postGradType !== 'all') {
        params.postGradType = filters.postGradType;
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

      if (filters.industry && filters.country !== 'all') {
        params.industry = filters.industry;
      }

      return new URLSearchParams(params);
    },
    [searchQuery, filters]
  );

  // Use React Query to fetch users
  const { data, isLoading, error } = useQuery({
    queryKey: ['users', page, searchQuery, filters],
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
  const totalPages = data ? Math.ceil(data.total / ITEMS_PER_PAGE) : 1;

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setPage(1);
  };

  const handleFilter = (newFilters: FilterOptions) => {
    setFilters(newFilters);
    setPage(1);
  };

  // Modify the handleClearFilters function
  const handleClearFilters = () => {
    setSearchQuery('');
    setFilters({});
    setPage(1);
  };

  return (
    <>
      <div className="flex flex-col gap-4 mb-12 sticky top-4 z-10">
        <div className="flex gap-6">
          <div className="flex-1">
            <SearchBar
              placeholder="Search for classmates..."
              className="w-full shadow-md"
              value={searchQuery}
              onChange={handleSearch}
            />
          </div>
          <FilterPanel onFilter={handleFilter} currentFilters={filters} />
        </div>

        {/* Only show clear filters button when there are active filters or search */}
        {(Object.keys(filters).length > 0 || searchQuery) && (
          <div className="flex justify-end">
            <button
              onClick={handleClearFilters}
              className="text-sm px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors flex items-center gap-2"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
              Clear all filters
            </button>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl p-8 shadow-md border border-gray-100 min-h-[50vh] flex flex-col">
        {error ? (
          <div className="text-red-500 text-center py-8">
            Error loading users. Please try again later.
          </div>
        ) : (
          <div className="flex flex-col flex-grow justify-between">
            <UserGrid
              users={users}
              loading={isLoading}
              page={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </div>
        )}
      </div>
    </>
  );
};
