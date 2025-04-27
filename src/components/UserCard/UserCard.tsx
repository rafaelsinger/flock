import React from 'react';
import { MapPin, Building, Briefcase, GraduationCap, Home, ExternalLink } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { UserWithLocation, getDisplayCompany, getDisplayRole } from '@/types/user';
import { motion } from 'framer-motion';
import { CURRENT_CLASS_YEAR } from '@/constants/general';
import { useSession } from 'next-auth/react';

interface UserCardProps {
  user: UserWithLocation;
  prefetch?: boolean;
}

export const UserCard: React.FC<UserCardProps> = ({ user, prefetch = false }) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: session } = useSession();

  // Check if this is the user's own profile card
  const isOwnProfile = session?.user?.id === user.id;

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

  const handleMessageclick = () => {
    router.push(`/conversations/${user.id}`);
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
      boxShadow: '0 15px 30px -5px rgba(249, 197, 209, 0.3), 0 5px 15px -5px rgba(0, 0, 0, 0.05)',
      transition: { duration: 0.3, ease: 'easeOut' },
    },
  };

  // Determine status and styling based on career/education path and class year
  const getPostGradStatus = () => {
    // For users not in class of 2025, use a gold/yellow theme regardless of career/education path
    if (user.classYear !== CURRENT_CLASS_YEAR) {
      return {
        Icon: user.postGradType === 'school' ? GraduationCap : Briefcase,
        color: '#F4B942', // Gold/yellow color
        bgColor: 'bg-[#F4B942]/10',
        status: user.classYear < CURRENT_CLASS_YEAR ? 'alumni' : 'intern',
      };
    }

    // For class of 2025 users, use existing career/education path logic
    switch (user.postGradType) {
      case 'work':
        return {
          Icon: Briefcase,
          color: '#F28B82',
          bgColor: 'bg-[#F9C5D1]/10',
          status: 'graduate',
        };
      case 'school':
        return {
          Icon: GraduationCap,
          color: '#A7D7F9',
          bgColor: 'bg-[#A7D7F9]/10',
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
          status: 'seeking',
        };
    }
  };

  const { Icon, color, bgColor } = getPostGradStatus();

  return (
    <motion.div
      className="bg-white rounded-xl overflow-hidden shadow-[0_4px_12px_-2px_rgba(249,197,209,0.15),0_2px_6px_-1px_rgba(0,0,0,0.02)] h-full flex flex-col transition-all"
      whileHover="hover"
      variants={cardVariants}
      onMouseEnter={handleMouseEnter}
    >
      <div className="p-5 sm:p-6 flex-grow flex flex-col bg-gradient-to-b from-white to-gray-50/30">
        <div className="flex items-start">
          {/* User Icon and Status Badge */}
          <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
            <div className="relative flex-shrink-0">
              <div
                className={`w-11 h-11 sm:w-14 sm:h-14 rounded-full flex items-center justify-center ${bgColor} transition-all`}
                style={{ boxShadow: `0 2px 8px -1px ${color}30, 0 1px 3px -1px ${color}10` }}
              >
                <Icon
                  className={
                    typeof Icon !== 'function' ? `h-5 w-5 sm:h-6 sm:w-6 text-[${color}]` : ''
                  }
                />
              </div>

              {/* Roommate indicator */}
              {user.lookingForRoommate && (
                <div className="absolute -bottom-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[#8FC9A9]/10 flex items-center justify-center border border-white shadow-sm">
                  <Home className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-[#8FC9A9]" />
                </div>
              )}
            </div>

            <div className="overflow-hidden min-w-0">
              <h3 className="font-medium text-[#333333] text-base sm:text-lg transition-colors truncate">
                {user.name}
              </h3>
              {role && <p className="text-xs sm:text-sm truncate text-gray-600">{role}</p>}
            </div>
          </div>

          {/* Class year indicator */}
          {user.classYear && (
            <div className="px-2 py-1 bg-gray-50 shadow-[0_1px_2px_0_rgba(0,0,0,0.03)] rounded-md text-xs font-medium text-gray-600 ml-2 flex-shrink-0 whitespace-nowrap">
              Class of {user.classYear}
            </div>
          )}
        </div>

        {/* Basic info section */}
        <div className="mt-4 sm:mt-5 space-y-3 flex-grow">
          <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
            <MapPin className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" style={{ color }} />
            <span className="truncate">{location}</span>
          </div>

          {company ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 overflow-hidden max-w-[70%]">
                <Building className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" style={{ color }} />
                <span className="truncate">{company}</span>
              </div>
              <div className="flex gap-2">
                {!isOwnProfile && (
                  <motion.button
                    onClick={handleMessageclick}
                    className="px-2 py-1 rounded-md flex items-center justify-center text-white text-xs cursor-pointer shadow-sm"
                    style={{
                      background: `linear-gradient(135deg, ${color}, ${color}CC)`,
                      boxShadow: `0 2px 4px -1px ${color}40`,
                    }}
                    whileHover={{ scale: 1.05, boxShadow: `0 3px 6px -1px ${color}50` }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                      />
                    </svg>
                  </motion.button>
                )}
                <motion.button
                  onClick={handleClick}
                  className="px-2 py-1 rounded-md flex items-center text-white text-xs cursor-pointer shadow-sm"
                  style={{
                    background: `linear-gradient(135deg, ${color}, ${color}CC)`,
                    boxShadow: `0 2px 4px -1px ${color}40`,
                  }}
                  whileHover={{ scale: 1.05, boxShadow: `0 3px 6px -1px ${color}50` }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="hidden sm:inline mr-1">View</span>
                  <ExternalLink className="h-3 w-3" />
                </motion.button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div className="flex-1" />
              <div className="flex gap-2">
                {!isOwnProfile && (
                  <motion.button
                    onClick={handleMessageclick}
                    className="px-2 py-1 rounded-md flex items-center justify-center text-white text-xs cursor-pointer shadow-sm"
                    style={{
                      background: `linear-gradient(135deg, ${color}, ${color}CC)`,
                      boxShadow: `0 2px 4px -1px ${color}40`,
                    }}
                    whileHover={{ scale: 1.05, boxShadow: `0 3px 6px -1px ${color}50` }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                      />
                    </svg>
                  </motion.button>
                )}
                <motion.button
                  onClick={handleClick}
                  className="px-2 py-1 rounded-md flex items-center text-white text-xs cursor-pointer shadow-sm"
                  style={{
                    background: `linear-gradient(135deg, ${color}, ${color}CC)`,
                    boxShadow: `0 2px 4px -1px ${color}40`,
                  }}
                  whileHover={{ scale: 1.05, boxShadow: `0 3px 6px -1px ${color}50` }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="hidden sm:inline mr-1">View</span>
                  <ExternalLink className="h-3 w-3" />
                </motion.button>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};
