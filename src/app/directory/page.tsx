import React from 'react';
import { SearchBar } from '@/components/SearchBar';
import { FilterPanel } from '@/components/FilterPanel';
// import { Map } from '@/components/Map';
import { UserGrid } from '@/components/UserGrid';

export default function DirectoryPage() {
  return (
    <div className="min-h-screen bg-white">
      <main className="container max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-[#333333]">Directory</h1>
          <p className="text-[#333333]/70 mt-2">Explore where BC grads are heading next</p>
        </div>

        {/* Map Section */}
        <div className="h-[400px] mb-8 rounded-xl overflow-hidden bg-[#F9F9F9] border border-gray-100">
          {/* <Map /> */}
        </div>

        {/* Search and Filters */}
        <div className="flex gap-6 mb-8">
          <div className="flex-1">
            <SearchBar 
              placeholder="Search for classmates..."
              className="w-full"
            />
          </div>
          <FilterPanel />
        </div>

        {/* Results Grid */}
        <UserGrid />
      </main>
    </div>
  );
} 