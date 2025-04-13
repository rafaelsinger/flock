import React from 'react';
import { MapPin, Building } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { User, getDisplayCompany } from '@/types/user';

interface UserCardProps {
  user: User;
  prefetch?: boolean;
}

export const UserCard: React.FC<UserCardProps> = ({ user, prefetch = false }) => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const location = `${user.city}, ${user.state}`;
  const company = user.visibilityOptions.company ? getDisplayCompany(user) : undefined;

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

  return (
    <Link
      href={`/profile/${user.id}`}
      onClick={handleClick}
      prefetch={false}
      onMouseEnter={handleMouseEnter}
    >
      <div className="bg-white rounded-lg border border-gray-100 p-4 hover:shadow-md transition-all duration-200 cursor-pointer group">
        <div className="flex items-start gap-4">
          <div className="flex-1">
            <h3 className="font-medium text-[#333333] group-hover:text-[#F28B82] transition-colors">
              {user.name}
            </h3>
            <div className="mt-2 space-y-1">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin className="h-4 w-4" /> {location}
              </div>
              {company && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Building className="h-4 w-4" /> {company}
                </div>
              )}
            </div>
          </div>
          <span className="text-sm text-[#F28B82] hover:text-[#F28B82]/80 transition-colors cursor-pointer hover:translate-x-0.5 duration-200">
            View Profile →
          </span>
        </div>
      </div>
    </Link>
  );
};
