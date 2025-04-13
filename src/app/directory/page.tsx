import React from 'react';
import { SearchBar } from '@/components/SearchBar';
import { FilterPanel } from '@/components/FilterPanel';
import { Map } from '@/components/Map';
import { UserGrid } from '@/components/UserGrid';

export default function DirectoryPage() {
  return (
    <div className="min-h-screen bg-[#FFF9F8]">
      <main className="container max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-12 bg-white rounded-xl p-8 shadow-sm border border-gray-100">
          <h1 className="text-4xl font-semibold text-[#333333]">Directory</h1>
          <p className="text-[#333333]/70 mt-2 text-lg">Explore where BC grads are heading next</p>
        </div>

        {/* Map Section */}
        <div className="h-[500px] mb-12 rounded-xl overflow-hidden bg-white shadow-sm border border-gray-100">
          <Map />
        </div>

        {/* Search and Filters */}
        <div className="flex gap-6 mb-12 sticky top-4 z-10">
          <div className="flex-1">
            <SearchBar 
              placeholder="Search for classmates..."
              className="w-full shadow-sm"
            />
          </div>
          <FilterPanel />
        </div>

        {/* Results Grid */}
        <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
          <UserGrid />
        </div>
      </main>
    </div>
  );
} 