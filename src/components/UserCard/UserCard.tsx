import React, { useState } from 'react';
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
  const [isExpanded, setIsExpanded] = useState(false);

  const location = user.location
    ? `${user.location.city}${user.location.state ? `, ${user.location.state}` : ''}`
    : 'Location unknown';

  // Only show company/role if user is not in "seeking" mode
  const company =
    user.postGradType !== 'seeking' && user.visibilityOptions?.company !== false
      ? getDisplayCompany(user)
      : undefined;

  const role =
    user.postGradType !== 'seeking' && user.visibilityOptions?.title !== false
      ? getDisplayRole(user)
      : undefined;

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
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

  const expandVariants = {
    closed: { height: 0, opacity: 0 },
    open: { height: 'auto', opacity: 1, transition: { duration: 0.3 } },
  };

  // Determine status and styling based on post-grad type
  const getPostGradStatus = () => {
    switch (user.postGradType) {
      case 'work':
        const isIntern = role?.toLowerCase().includes('intern');
        return {
          Icon: Briefcase,
          color: isIntern ? '#A7D7F9' : '#F28B82',
          bgColor: isIntern ? 'bg-[#A7D7F9]/10' : 'bg-[#F9C5D1]/10',
          borderColor: isIntern ? 'border-[#A7D7F9]' : 'border-[#F9C5D1]',
          label: isIntern ? 'Intern' : 'Graduate',
          status: isIntern ? 'intern' : 'graduate',
        };
      case 'school':
        return {
          Icon: GraduationCap,
          color: '#A7D7F9',
          bgColor: 'bg-[#A7D7F9]/10',
          borderColor: 'border-[#A7D7F9]',
          label: 'Student',
          status: 'student',
        };
      case 'seeking':
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
          label: 'Seeking',
          status: 'seeking',
        };
    }
  };

  const { Icon, color, bgColor, borderColor, label, status } = getPostGradStatus();

  return (
    <motion.div
      className={`bg-white rounded-xl overflow-hidden hover:border-[#F9C5D1]/30 shadow-sm border-2 ${borderColor} h-full flex flex-col`}
      whileHover="hover"
      variants={cardVariants}
      onMouseEnter={handleMouseEnter}
    >
      {/* Card header with status indicator */}
      <div className="h-2 w-full" style={{ backgroundColor: color }}></div>

      <div
        className="p-5 cursor-pointer flex-grow flex flex-col"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-start justify-between">
          {/* User Icon and Status Badge */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${bgColor}`}>
                <Icon className={typeof Icon !== 'function' ? `h-6 w-6 text-[${color}]` : ''} />
              </div>

              {/* Status badge */}
              <div
                className={`absolute -top-2 -right-2 px-2 py-0.5 rounded-full text-white text-xs font-semibold`}
                style={{ backgroundColor: color }}
              >
                {label}
              </div>

              {user.lookingForRoommate && (
                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#8FC9A9]/10 flex items-center justify-center border border-white">
                  <Home className="h-3 w-3 text-[#8FC9A9]" />
                </div>
              )}
            </div>

            <div>
              <h3 className="font-medium text-[#333333] text-lg transition-colors">{user.name}</h3>
              {role && (
                <p
                  className={`text-sm ${status === 'intern' ? 'text-[#A7D7F9]' : 'text-gray-600'}`}
                >
                  {role}
                </p>
              )}
            </div>
          </div>

          {/* Class year indicator */}
          {user.classYear && (
            <div className="px-2 py-1 bg-gray-100 rounded-md text-xs font-medium text-gray-600">
              Class of {user.classYear}
            </div>
          )}
        </div>

        {/* Basic info section - fixed height for consistency */}
        <div className="mt-4 space-y-3 flex-grow min-h-[80px]">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin className="h-4 w-4 flex-shrink-0" style={{ color }} />
            <span className="truncate">{location}</span>
          </div>

          {company && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Building className="h-4 w-4 flex-shrink-0" style={{ color }} />
              <span className="truncate">{company}</span>
            </div>
          )}

          {user.postGradType === 'seeking' && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <svg
                className="h-4 w-4 flex-shrink-0 text-[#9E9E9E]"
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
              <span>Currently seeking opportunities</span>
            </div>
          )}
        </div>

        {/* Expand/collapse indicator */}
        <div className="mt-2 flex justify-center">
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.3 }}
            className={`text-lg flex items-center justify-center h-6 w-6 rounded-full`}
            style={{ color }}
          >
            ⌄
          </motion.div>
        </div>
      </div>

      {/* Expandable section */}
      <motion.div
        variants={expandVariants}
        initial="closed"
        animate={isExpanded ? 'open' : 'closed'}
        className="overflow-hidden"
      >
        <div className="px-5 pb-5 pt-2 border-t border-gray-100">
          {user.email && (
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
              <Mail className="h-4 w-4" style={{ color }} />
              <span className="truncate">{user.email}</span>
            </div>
          )}

          {user.lookingForRoommate && (
            <div className="flex items-center gap-2 text-sm text-[#8FC9A9] mb-3">
              <Home className="h-4 w-4" />
              <span>Looking for roommates</span>
            </div>
          )}

          <motion.button
            onClick={handleClick}
            className="w-full mt-2 py-2 px-4 rounded-lg flex items-center justify-center gap-2 text-white"
            style={{ background: `linear-gradient(90deg, ${color}, ${color}CC)` }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.2 }}
          >
            View Profile
            <ExternalLink className="h-4 w-4" />
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};
