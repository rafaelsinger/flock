"use client";

import React from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { FaUserCircle } from "react-icons/fa";
import { SearchBar } from "@/components/SearchBar";
import { FilterPanel } from "@/components/FilterPanel";
import { Map } from "@/components/Map";
import { UserGrid } from "@/components/UserGrid";

export const Directory = () => {
  const { data: session } = useSession();

  return (
    <div className="min-h-screen bg-[#F9F9F8]">
      <main className="container max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-12 bg-white rounded-xl p-8 shadow-sm border border-gray-100 relative">
          <div>
            <h1 className="text-4xl font-bold text-[#111111]">Directory</h1>
            <p className="text-[#444444] mt-2 text-lg">
              Explore where BC grads are heading next
            </p>
          </div>

          {/* Profile Link */}
          <Link
            href={`/profile/${session?.user?.email?.split("@")[0]}`}
            className="absolute top-8 right-8 text-[#F28B82] hover:text-[#E67C73] transition-colors"
          >
            <FaUserCircle className="w-8 h-8" />
          </Link>
        </div>

        {/* Map Section */}
        <div className="h-[500px] mb-12 rounded-xl overflow-hidden bg-white shadow-md border border-gray-100">
          <Map />
        </div>

        {/* Search and Filters */}
        <div className="flex gap-6 mb-12 sticky top-4 z-10">
          <div className="flex-1">
            <SearchBar
              placeholder="Search for classmates..."
              className="w-full shadow-md"
            />
          </div>
          <FilterPanel />
        </div>

        {/* Results Grid */}
        <div className="bg-white rounded-xl p-8 shadow-md border border-gray-100">
          <UserGrid />
        </div>
      </main>
    </div>
  );
};
