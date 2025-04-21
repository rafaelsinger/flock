'use client';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Briefcase, GraduationCap, MapPin, Users, ChevronDown, ChevronUp } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';

// Define types for destination data from API
interface Destination {
  id: string;
  name: string;
  count: number;
  location?: string;
  type: 'company' | 'school' | 'city';
}

interface TopDestinationsProps {
  showAllClassYears?: boolean;
}

export const TopDestinations: React.FC<TopDestinationsProps> = ({ showAllClassYears = false }) => {
  const { data: session } = useSession();
  const userClassYear = session?.user?.classYear;
  const [activeTab, setActiveTab] = useState<'companies' | 'schools' | 'cities'>('companies');
  const [isExpanded, setIsExpanded] = useState(false);
  const [limit, setLimit] = useState(6);

  // Toggle expanded view for "View All"
  const toggleExpanded = () => {
    if (isExpanded) {
      setLimit(6);
      setIsExpanded(false);
    } else {
      setLimit(30);
      setIsExpanded(true);
    }
  };

  // Reset expanded state when tab changes
  useEffect(() => {
    setIsExpanded(false);
    setLimit(6);
  }, [activeTab]);

  // Use React Query to fetch destinations
  const {
    data: destinations = [],
    isLoading,
    error,
  } = useQuery<Destination[]>({
    queryKey: ['topDestinations', activeTab, limit, showAllClassYears, userClassYear],
    queryFn: async () => {
      const params = new URLSearchParams({
        type: activeTab,
        limit: limit.toString(),
      });

      const response = await fetch(`/api/stats/top-destinations?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch top destinations');
      }
      return response.json();
    },
  });

  // Animation variants for tabs
  const tabVariants = {
    inactive: { opacity: 0.6, y: 0 },
    active: { opacity: 1, y: 0 },
    hover: { opacity: 0.9, y: -2 },
  };

  // Animation variants for cards
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.05,
        duration: 0.4,
        ease: 'easeOut',
      },
    }),
    exit: { opacity: 0, y: -20, transition: { duration: 0.3 } },
  };

  // Generate a random color based on destination name for consistent display
  const getColorForName = (name: string) => {
    // Generate a color based on the first letter of the name
    const colors = ['#F28B82', '#A7D7F9', '#9FD89F', '#FCD34D', '#F9A8D4'];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  // Get the proper icon based on destination type
  const getIcon = (type: string, name: string) => {
    const color = getColorForName(name);

    switch (type) {
      case 'company':
        return <Briefcase className="w-5 h-5" style={{ color }} />;
      case 'school':
        return <GraduationCap className="w-5 h-5" style={{ color }} />;
      case 'city':
        return <MapPin className="w-5 h-5" style={{ color }} />;
      default:
        return null;
    }
  };

  // Get background style based on active tab
  const getTabStyle = (tab: string) => {
    if (activeTab === tab) {
      switch (tab) {
        case 'companies':
          return 'bg-[#F9C5D1]/10 border-[#F28B82] text-[#F28B82]';
        case 'schools':
          return 'bg-[#A7D7F9]/10 border-[#A7D7F9] text-[#A7D7F9]';
        case 'cities':
          return 'bg-[#9FD89F]/10 border-[#9FD89F] text-[#9FD89F]';
      }
    }
    return 'border-gray-200 text-gray-600 hover:border-gray-300';
  };

  return (
    <section className="py-10">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Header with pink gradient accent */}
          <div className="relative p-6 border-b border-gray-100">
            <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-[#F9C5D1] to-[#F28B82]"></div>
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-[#333333] pl-4">Top Destinations</h2>
                <p className="text-[#666666] mt-1 pl-4">
                  Where BC Eagles are heading for jobs, grad school, and internships
                </p>
              </div>
              {userClassYear && (
                <div className="bg-gray-100 px-3 py-1 rounded-full text-xs text-gray-700">
                  {'All class years'}
                </div>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="p-6 border-b border-gray-100">
            <div className="flex flex-wrap gap-2">
              <motion.button
                onClick={() => setActiveTab('companies')}
                className={`px-4 py-2 rounded-full border transition-all flex items-center gap-2 ${getTabStyle('companies')}`}
                variants={tabVariants}
                initial="inactive"
                animate={activeTab === 'companies' ? 'active' : 'inactive'}
                whileHover="hover"
                whileTap={{ scale: 0.95 }}
              >
                <Briefcase className="h-4 w-4" />
                <span>Companies</span>
              </motion.button>

              <motion.button
                onClick={() => setActiveTab('schools')}
                className={`px-4 py-2 rounded-full border transition-all flex items-center gap-2 ${getTabStyle('schools')}`}
                variants={tabVariants}
                initial="inactive"
                animate={activeTab === 'schools' ? 'active' : 'inactive'}
                whileHover="hover"
                whileTap={{ scale: 0.95 }}
              >
                <GraduationCap className="h-4 w-4" />
                <span>Schools</span>
              </motion.button>

              <motion.button
                onClick={() => setActiveTab('cities')}
                className={`px-4 py-2 rounded-full border transition-all flex items-center gap-2 ${getTabStyle('cities')}`}
                variants={tabVariants}
                initial="inactive"
                animate={activeTab === 'cities' ? 'active' : 'inactive'}
                whileHover="hover"
                whileTap={{ scale: 0.95 }}
              >
                <MapPin className="h-4 w-4" />
                <span>Cities</span>
              </motion.button>
            </div>
          </div>

          {/* Content Area */}
          <div className="p-6">
            <AnimatePresence mode="wait">
              {isLoading ? (
                <motion.div
                  key="loading"
                  className="flex justify-center py-12"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#F28B82]"></div>
                </motion.div>
              ) : error ? (
                <motion.div
                  key="error"
                  className="text-center py-12"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <p className="text-[#F28B82]">
                    {(error as Error).message || 'Failed to load data'}
                  </p>
                </motion.div>
              ) : destinations.length === 0 ? (
                <motion.div
                  key="empty"
                  className="text-center py-12"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <p className="text-gray-500">No {activeTab} data available yet</p>
                </motion.div>
              ) : (
                <motion.div
                  key={activeTab + (isExpanded ? '-expanded' : '-collapsed')}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  {destinations.map((destination, index) => (
                    <motion.div
                      key={destination.id}
                      custom={index}
                      variants={cardVariants}
                      whileHover={{ y: -5, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)' }}
                      className="bg-white rounded-lg border border-gray-100 p-4 hover:border-gray-200 transition-all"
                    >
                      <div className="flex items-center">
                        <div className="flex-shrink-0 mr-4">
                          <div className="w-12 h-12 rounded-md bg-gray-50 flex items-center justify-center">
                            {getIcon(destination.type, destination.name)}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-base font-medium text-[#333333] truncate">
                            {destination.name}
                          </h3>
                          {destination.location && (
                            <p className="text-xs text-gray-500 truncate">{destination.location}</p>
                          )}
                        </div>
                        <div className="flex items-center ml-2">
                          <div className="flex items-center bg-gray-50 rounded-full px-2 py-1">
                            <Users className="h-3 w-3 text-gray-400 mr-1" />
                            <span className="text-sm font-medium text-gray-600">
                              {destination.count}
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer with "View All" toggle */}
          <div className="p-4 bg-gray-50 border-t border-gray-100">
            <button
              onClick={toggleExpanded}
              className="text-sm text-[#333333]/70 hover:text-[#F28B82] transition-colors flex items-center justify-center gap-1 group w-full"
            >
              <span>{isExpanded ? 'Show Less' : `View all ${activeTab}`}</span>
              {isExpanded ? (
                <ChevronUp className="h-4 w-4 group-hover:-translate-y-0.5 transition-transform" />
              ) : (
                <ChevronDown className="h-4 w-4 group-hover:translate-y-0.5 transition-transform" />
              )}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
