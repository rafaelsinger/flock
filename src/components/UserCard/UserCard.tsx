import React, { useState } from 'react';
import { MapPin, Building, Mail, Briefcase, GraduationCap, Home } from 'lucide-react';
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
  const company = user.visibilityOptions?.company !== false ? getDisplayCompany(user) : undefined;
  const role = user.visibilityOptions?.title !== false ? getDisplayRole(user) : undefined;

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

  // Determine icon based on post-grad type
  const PostGradIcon = user.postGradType === 'work' ? Briefcase : GraduationCap;
  const iconColor = user.postGradType === 'work' ? '#F28B82' : '#A7D7F9';

  return (
    <motion.div
      className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:border-[#F9C5D1]/30"
      whileHover="hover"
      variants={cardVariants}
      onMouseEnter={handleMouseEnter}
    >
      <div onClick={() => setIsExpanded(!isExpanded)} className="p-5 cursor-pointer">
        <div className="flex items-start justify-between">
          {/* User Icon */}
          <div className="flex items-center gap-3">
            <div className="flex">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${user.postGradType === 'work' ? 'bg-[#F9C5D1]/10' : 'bg-[#A7D7F9]/10'}`}
              >
                <PostGradIcon className={`h-5 w-5 text-[${iconColor}]`} />
              </div>
              {user.lookingForRoommate && (
                <div className="w-5 h-5 rounded-full bg-[#8FC9A9]/10 flex items-center justify-center -ml-2 mt-6 border border-white">
                  <Home className="h-3 w-3 text-[#8FC9A9]" />
                </div>
              )}
            </div>
            <div>
              <h3 className="font-medium text-[#333333] text-lg group-hover:text-[#F28B82] transition-colors">
                {user.name}
              </h3>
              {role && <p className="text-sm text-gray-600">{role}</p>}
            </div>
          </div>

          {/* Expand/Collapse indicator */}
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.3 }}
            className="text-gray-400"
          >
            ⌄
          </motion.div>
        </div>

        {/* Basic info always visible */}
        <div className="mt-4 space-y-2">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin className="h-4 w-4 text-[#F28B82]" />
            <span>{location}</span>
          </div>
          {company && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Building className="h-4 w-4 text-[#F28B82]" />
              <span>{company}</span>
            </div>
          )}
        </div>
      </div>

      {/* Expandable section */}
      <motion.div
        variants={expandVariants}
        initial="closed"
        animate={isExpanded ? 'open' : 'closed'}
        className="overflow-hidden"
      >
        <div className="px-5 pb-5 pt-0 border-t border-gray-100">
          {user.email && (
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
              <Mail className="h-4 w-4 text-[#F28B82]" />
              <span>{user.email}</span>
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
            className="w-full mt-2 bg-gradient-to-r from-[#F9C5D1] to-[#F28B82] text-white py-2 px-4 rounded-lg"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.2 }}
          >
            View Full Profile
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};
