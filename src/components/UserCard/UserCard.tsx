import React from 'react';
import { MapPin, Building, Mail, Briefcase, GraduationCap, Home, ExternalLink } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { UserWithLocation, getDisplayCompany, getDisplayRole } from '@/types/user';
import { motion } from 'framer-motion';

interface UserCardProps {
  user: UserWithLocation;
  prefetch?: boolean;
}

export const UserCard: React.FC<UserCardProps> = ({ user, prefetch = false }) => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const location = user.location
    ? `${user.location.city}${user.location.state ? `, ${user.location.state}` : ''}`
    : 'Location unknown';

  // Only show company/role if user is not in "seeking" mode
  const company =
    user.postGradType !== 'seeking' && user.visibilityOptions?.company !== false
      ? getDisplayCompany(user)
      : undefined;

  // For students, check program visibility; for others, check title visibility
  const role =
    user.postGradType !== 'seeking'
      ? user.postGradType === 'school'
        ? user.visibilityOptions?.program !== false
          ? getDisplayRole(user)
          : undefined
        : user.visibilityOptions?.title !== false
          ? getDisplayRole(user)
          : undefined
      : undefined;

  const handleClick = () => {
    router.push(`/profile/${user.id}`);
  };

  // Prefetch the user data when hovering over the card
  const handleMouseEnter = () => {
    if (prefetch) {
      // Prefetch using React Query
      queryClient.prefetchQuery({
        queryKey: ['user', user.id],
        queryFn: async () => {
          const response = await fetch(`/api/users/${user.id}`);
          if (!response.ok) {
            throw new Error('Failed to fetch user data');
          }
          return response.json();
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
      });
    }
  };

  const cardVariants = {
    hover: {
      y: -8,
      boxShadow: '0 10px 25px -5px rgba(249, 197, 209, 0.3)',
      transition: { duration: 0.3 },
    },
  };

  // Determine status and styling based on post-grad type and class year
  const getPostGradStatus = () => {
    // For users not in class of 2025, use a gold/yellow theme regardless of post-grad type
    if (user.classYear !== 2025) {
      return {
        Icon: user.postGradType === 'school' ? GraduationCap : Briefcase,
        color: '#F4B942', // Gold/yellow color
        bgColor: 'bg-[#F4B942]/10',
        borderColor: 'border-[#F4B942]',
        status: user.classYear < 2025 ? 'graduate' : 'intern',
      };
    }

    // For class of 2025 users, use existing post-grad type logic
    switch (user.postGradType) {
      case 'work':
        return {
          Icon: Briefcase,
          color: '#F28B82',
          bgColor: 'bg-[#F9C5D1]/10',
          borderColor: 'border-[#F9C5D1]',
          status: 'graduate',
        };
      case 'school':
        return {
          Icon: GraduationCap,
          color: '#A7D7F9',
          bgColor: 'bg-[#A7D7F9]/10',
          borderColor: 'border-[#A7D7F9]',
          status: 'student',
        };
      default:
        return {
          Icon: () => (
            <svg
              className="h-5 w-5 text-[#9E9E9E]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          ),
          color: '#9E9E9E',
          bgColor: 'bg-[#9E9E9E]/10',
          borderColor: 'border-[#9E9E9E]',
          status: 'seeking',
        };
    }
  };

  const { Icon, color, bgColor, borderColor } = getPostGradStatus();

  return (
    <motion.div
      className={`bg-white rounded-xl overflow-hidden hover:border-[#F9C5D1]/30 shadow-sm border-2 ${borderColor} h-full flex flex-col`}
      whileHover="hover"
      variants={cardVariants}
      onMouseEnter={handleMouseEnter}
    >
      {/* Card header with status indicator */}
      <div className="h-2 w-full" style={{ backgroundColor: color }}></div>

      <div className="p-4 sm:p-5 flex-grow flex flex-col">
        <div className="flex items-start justify-between">
          {/* User Icon and Status Badge */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="relative">
              <div
                className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center ${bgColor}`}
              >
                <Icon
                  className={
                    typeof Icon !== 'function' ? `h-5 w-5 sm:h-6 sm:w-6 text-[${color}]` : ''
                  }
                />
              </div>

              {/* Roommate indicator */}
              {user.lookingForRoommate && (
                <div className="absolute -bottom-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[#8FC9A9]/10 flex items-center justify-center border border-white">
                  <Home className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-[#8FC9A9]" />
                </div>
              )}
            </div>

            <div className="overflow-hidden">
              <h3 className="font-medium text-[#333333] text-base sm:text-lg transition-colors truncate">
                {user.name}
              </h3>
              {role && <p className="text-xs sm:text-sm truncate text-gray-600">{role}</p>}
            </div>
          </div>

          {/* Class year indicator */}
          {user.classYear && (
            <div className="px-2 py-1 bg-gray-100 rounded-md text-xs font-medium text-gray-600 ml-2 flex-shrink-0">
              Class of {user.classYear}
            </div>
          )}
        </div>

        {/* Basic info section */}
        <div className="mt-3 sm:mt-4 space-y-2 sm:space-y-3 flex-grow">
          <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
            <MapPin className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" style={{ color }} />
            <span className="truncate">{location}</span>
          </div>

          {company ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 overflow-hidden">
                <Building className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" style={{ color }} />
                <span className="truncate">{company}</span>
              </div>
              <motion.button
                onClick={handleClick}
                className="ml-2 flex-shrink-0 px-2 py-1 rounded-md flex items-center text-white text-xs"
                style={{ background: `linear-gradient(90deg, ${color}, ${color}CC)` }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="hidden sm:inline mr-1">View</span>
                <ExternalLink className="h-3 w-3" />
              </motion.button>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div className="flex-1" />
              <motion.button
                onClick={handleClick}
                className="ml-2 flex-shrink-0 px-2 py-1 rounded-md flex items-center text-white text-xs"
                style={{ background: `linear-gradient(90deg, ${color}, ${color}CC)` }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="hidden sm:inline mr-1">View</span>
                <ExternalLink className="h-3 w-3" />
              </motion.button>
            </div>
          )}

          {user.email && (
            <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
              <Mail className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" style={{ color }} />
              <span className="truncate">{user.email}</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};
