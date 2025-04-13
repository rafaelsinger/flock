import React, { useEffect, useState, useCallback } from 'react';
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
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
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

  const fetchUsers = useCallback(
    async (pageNum: number) => {
      try {
        setLoading(true);
        const queryParams = buildQueryParams(pageNum);
        const response = await fetch(`/api/users?${queryParams}`);
        const data = await response.json();
        setUsers(data.users);
        setTotalPages(Math.ceil(data.total / ITEMS_PER_PAGE));
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoading(false);
      }
    },
    [buildQueryParams]
  );

  useEffect(() => {
    fetchUsers(page);
  }, [page, fetchUsers]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setPage(1);
  };

  const handleFilter = (newFilters: FilterOptions) => {
    setFilters(newFilters);
    setPage(1);
  };

  return (
    <>
      <div className="flex gap-6 mb-12 sticky top-4 z-10">
        <div className="flex-1">
          <SearchBar
            placeholder="Search for classmates..."
            className="w-full shadow-md"
            value={searchQuery}
            onChange={handleSearch}
          />
        </div>
        <FilterPanel onFilter={handleFilter} />
      </div>

      <div className="bg-white rounded-xl p-8 shadow-md border border-gray-100">
        <UserGrid
          users={users}
          loading={loading}
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      </div>
    </>
  );
};
