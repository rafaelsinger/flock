import React, { useEffect, useState } from "react";
import { SearchBar } from "@/components/SearchBar";
import { FilterPanel } from "@/components/FilterPanel";
import { UserGrid } from "@/components/UserGrid";

interface FilterOptions {
  postGradType?: "work" | "school" | "all";
  location?: string;
}

const ITEMS_PER_PAGE = 12;

export const DirectoryContent: React.FC = () => {
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<FilterOptions>({});

  const fetchUsers = async (pageNum: number) => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page: pageNum.toString(),
        limit: ITEMS_PER_PAGE.toString(),
        search: searchQuery,
        ...(filters.postGradType && filters.postGradType !== "all"
          ? { postGradType: filters.postGradType }
          : {}),
        ...(filters.location ? { location: filters.location } : {}),
      });

      const response = await fetch(`/api/users?${queryParams}`);
      const data = await response.json();
      setUsers(data.users);
      setTotalPages(Math.ceil(data.total / ITEMS_PER_PAGE));
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(page);
  }, [page, searchQuery, filters]);

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
