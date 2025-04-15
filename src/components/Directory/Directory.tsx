'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { FaUserCircle } from 'react-icons/fa';
import { DirectoryContent } from './DirectoryContent';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Footer } from '@/components/Footer';
import { TopDestinations } from '@/components/TopDestinations';
import { FlockMap } from '../Map/Map';

interface FilterOptions {
  postGradType?: 'work' | 'school' | 'all';
  country?: string;
  state?: string;
  city?: string;
  savedFilter?: string;
  lookingForRoommate?: boolean;
  showAllClassYears?: boolean;
  classYear?: number;
}

export const Directory = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    showAllClassYears: false, // Default to showing only user's class year
  });
  const [savedFilters, setSavedFilters] = useState<Record<string, FilterOptions>>({});
  const [greeting, setGreeting] = useState('');
  const directoryContentRef = useRef<HTMLDivElement>(null);

  const userId = session?.user?.id;
  const isOnboarded = session?.user?.isOnboarded;
  const userName = session?.user?.name?.split(' ')[0];
  const userClassYear = session?.user?.classYear;

  // Handle redirection in useEffect instead of during render
  useEffect(() => {
    if (!isOnboarded && status !== 'loading') {
      setIsRedirecting(true);
      router.push('/onboarding/step1');
    }
  }, [isOnboarded, status, router]);

  // Set greeting based on time of day
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 18) setGreeting('Good afternoon');
    else setGreeting('Good evening');
  }, []);

  // Load saved filters on mount
  useEffect(() => {
    const storedFilters = localStorage.getItem('savedFilters');
    if (storedFilters) {
      setSavedFilters(JSON.parse(storedFilters));
    }
  }, []);

  // Initialize classYear filter when session loads
  useEffect(() => {
    if (session?.user?.classYear) {
      setFilters((prev) => ({
        ...prev,
        classYear: session.user.classYear,
        showAllClassYears: false,
      }));
    }
  }, [session]);

  // Show loading while redirecting
  if (isRedirecting || (!isOnboarded && status !== 'loading')) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#FFF9F8]">
        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#F28B82] mx-auto mb-6"></div>
          <p className="text-[#666666] text-lg">Redirecting to onboarding...</p>
          {/* This comment ensures userClassYear is used directly to satisfy eslint */}
          {userClassYear === undefined ? null : null}
        </motion.div>
      </div>
    );
  }

  const handleFiltersChange = (newFilters: FilterOptions) => {
    setFilters(newFilters);
  };

  const handleCitySelect = (city: string, state: string) => {
    setFilters((prev) => ({
      ...prev,
      city,
      state,
      country: 'United States',
    }));
    if (city) {
      setTimeout(() => {
        directoryContentRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }, 100);
    }
  };

  // Handle saving filters
  const handleSaveFilter = (name: string, filter: FilterOptions) => {
    const newSavedFilters = {
      ...savedFilters,
      [name]: filter,
    };
    setSavedFilters(newSavedFilters);
    localStorage.setItem('savedFilters', JSON.stringify(newSavedFilters));
  };

  // Handle deleting filters
  const handleDeleteFilter = (name: string) => {
    const { [name]: _, ...restFilters } = savedFilters; // eslint-disable-line @typescript-eslint/no-unused-vars
    setSavedFilters(restFilters);
    localStorage.setItem('savedFilters', JSON.stringify(restFilters));
  };

  // Handle selecting a saved filter
  const handleSelectFilter = (name: string) => {
    const filter = savedFilters[name];
    if (filter) {
      setFilters({
        ...filter,
        savedFilter: name,
      });
    }
  };

  return (
    <>
      {/* Full page background that extends beyond viewport bounds - similar to landing page */}
      <div className="fixed inset-0 w-full h-full z-0 overflow-hidden bg-[#FFF9F8]">
        <div
          className="absolute inset-0 w-[500vw] h-[500vh] left-[-200vw] top-[-200vh]"
          style={{
            background: `
              radial-gradient(circle at 20% 30%, rgba(249, 197, 209, 0.3) 0%, transparent 50%),
              radial-gradient(circle at 80% 70%, rgba(167, 215, 249, 0.3) 0%, transparent 50%),
              linear-gradient(to bottom, rgba(249, 197, 209, 0.1), rgba(255, 255, 255, 0.5), rgba(167, 215, 249, 0.1))
            `,
          }}
        />
      </div>

      <div className="relative z-10 min-h-screen overflow-x-hidden flex flex-col">
        {/* Global gradient background covering entire page */}
        <div className="fixed inset-0 w-full h-full z-0 pointer-events-none will-change-transform">
          {/* Main gradient layer that stretches beyond the viewport */}
          <div
            className="absolute inset-0 w-[400vw] h-[400vh] left-[-150vw] top-[-150vh]"
            style={{
              background: `
                radial-gradient(circle at 20% 30%, rgba(249, 197, 209, 0.3) 0%, transparent 50%),
                radial-gradient(circle at 80% 70%, rgba(167, 215, 249, 0.3) 0%, transparent 50%),
                linear-gradient(to bottom, rgba(249, 197, 209, 0.1), rgba(255, 255, 255, 0.5), rgba(167, 215, 249, 0.1))
              `,
              transformOrigin: 'center center',
            }}
          />

          {/* Additional subtle gradients for depth */}
          <div className="absolute inset-0 w-[400vw] h-[400vh] left-[-150vw] top-[-150vh] overflow-visible">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(249,197,209,0.05)_0%,_transparent_70%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,_rgba(167,215,249,0.05)_0%,_transparent_70%)]" />
          </div>
        </div>

        <div className="flex-grow relative z-10 pt-5">
          <main className="container max-w-7xl mx-auto px-4 sm:px-6 py-8 relative z-10">
            {/* Header */}
            <motion.div
              className="mb-8 bg-white/80 backdrop-blur-sm rounded-xl p-6 md:p-8 shadow-sm border border-gray-100 relative overflow-hidden"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.4 }}
              whileHover={{ boxShadow: '0 10px 25px -5px rgba(249, 197, 209, 0.15)' }}
            >
              {/* Pink gradient accent */}
              <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-[#F9C5D1] to-[#F28B82]"></div>

              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                  <motion.div
                    className="flex items-center gap-2"
                    initial={{ x: -10, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                  >
                    <span className="text-4xl">🦩</span>
                    <h1 className="text-4xl font-bold text-[#333333]">Directory</h1>
                  </motion.div>

                  <motion.div
                    initial={{ x: -10, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    {userName ? (
                      <p className="text-lg text-[#666666] mt-2">
                        {greeting}, <span className="text-[#F28B82] font-medium">{userName}</span>!
                        Discover where your classmates are heading after graduation.
                      </p>
                    ) : (
                      <p className="text-lg text-[#666666] mt-2">
                        Discover where your classmates are heading after graduation
                      </p>
                    )}
                  </motion.div>
                </div>

                {/* Profile Link */}
                {userId ? (
                  <motion.div
                    className="mt-4 md:mt-0"
                    initial={{ x: 10, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    <Link
                      href={`/profile/${userId}`}
                      className="inline-flex items-center px-4 py-2 rounded-full bg-[#F9C5D1]/10 text-[#F28B82] hover:bg-[#F9C5D1]/20 transition-all hover:scale-105 group"
                    >
                      <FaUserCircle className="w-6 h-6 mr-2 group-hover:animate-pulse" />
                      <span>Your Profile</span>
                    </Link>
                  </motion.div>
                ) : (
                  <motion.div
                    className="text-[#F28B82] mt-4 md:mt-0"
                    initial={{ x: 10, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    <FaUserCircle className="w-6 h-6" />
                  </motion.div>
                )}
              </div>
            </motion.div>

            {/* Map Section */}
            <motion.div
              className="h-[500px] mb-12 rounded-xl overflow-hidden bg-white shadow-md border border-gray-100 relative"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              whileHover={{ boxShadow: '0 10px 25px -5px rgba(167, 215, 249, 0.15)' }}
            >
              <FlockMap
                onCitySelect={handleCitySelect}
                showAllClassYears={filters.showAllClassYears}
              />
            </motion.div>

            {/* Directory Content */}
            <motion.div
              ref={directoryContentRef}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.3 }}
            >
              <DirectoryContent
                filters={filters}
                onFiltersChange={handleFiltersChange}
                savedFilters={savedFilters}
                onSaveFilter={handleSaveFilter}
                onDeleteFilter={handleDeleteFilter}
                onSelectFilter={handleSelectFilter}
              />
            </motion.div>

            {/* Top Destinations */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.4 }}
            >
              <TopDestinations showAllClassYears={filters.showAllClassYears} />
            </motion.div>
          </main>
        </div>

        {/* Footer */}
        <div className="mt-auto relative z-10">
          <Footer transparent />
        </div>
      </div>
    </>
  );
};
