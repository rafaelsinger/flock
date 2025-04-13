import React from 'react';
import { UserCard } from '@/components/UserCard/UserCard';
import { User } from '@/types/user';

interface UserGridProps {
  users: User[];
  loading: boolean;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  prefetchUserData?: boolean;
}

export const UserGrid: React.FC<UserGridProps> = ({
  users,
  loading,
  page,
  totalPages,
  onPageChange,
  prefetchUserData = true,
}) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {users.map((user) => (
          <UserCard key={user.id} user={user} prefetch={prefetchUserData} />
        ))}
      </div>

      {loading && (
        <div className="text-center">
          <div className="animate-pulse text-gray-500">Loading...</div>
        </div>
      )}

      {!loading && users.length > 0 && (
        <div className="flex justify-center items-center space-x-2">
          <button
            onClick={() => onPageChange(Math.max(1, page - 1))}
            disabled={page === 1}
            className="px-3 py-1 rounded border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:border-[#F28B82] transition-colors"
          >
            ←
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
            <button
              key={pageNum}
              onClick={() => onPageChange(pageNum)}
              className={`px-3 py-1 rounded cursor-pointer ${
                pageNum === page
                  ? 'bg-[#F28B82] text-white'
                  : 'border border-gray-200 hover:border-[#F28B82]'
              } transition-colors`}
            >
              {pageNum}
            </button>
          ))}

          <button
            onClick={() => onPageChange(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            className="px-3 py-1 rounded border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:border-[#F28B82] transition-colors"
          >
            →
          </button>
        </div>
      )}
    </div>
  );
};
