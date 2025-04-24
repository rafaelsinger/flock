import React from 'react';
import { UserCard } from '@/components/UserCard/UserCard';
import { UserWithLocation } from '@/types/user';
import { motion, AnimatePresence } from 'framer-motion';
import { Users } from 'lucide-react';

interface UserGridProps {
  users: UserWithLocation[];
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
  // Calculate visible page numbers
  const getVisiblePages = () => {
    const delta = 2; // Number of pages to show before and after current page
    const range = [];
    const start = Math.max(1, page - delta);
    const end = Math.min(totalPages, page + delta);

    // Always show first page
    if (start > 1) {
      range.push(1);
      if (start > 2) range.push('...');
    }

    // Add the range around current page
    for (let i = start; i <= end; i++) {
      range.push(i);
    }

    // Always show last page
    if (end < totalPages) {
      if (end < totalPages - 1) range.push('...');
      range.push(totalPages);
    }

    return range;
  };

  return (
    <div className="space-y-6">
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="py-12"
          >
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="w-16 h-16 border-4 border-[#F28B82] border-t-transparent rounded-full animate-spin"></div>
              <p className="text-gray-500 animate-pulse">Loading users...</p>
            </div>
          </motion.div>
        ) : users.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="py-12 bg-gray-50 rounded-lg"
          >
            <div className="flex flex-col items-center justify-center space-y-3 p-8">
              <div className="bg-gray-100 p-4 rounded-full">
                <Users className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-700">No users found</h3>
              <p className="text-gray-500 text-center max-w-md">
                Try adjusting your filters or search criteria to find the users you&apos;re looking
                for.
              </p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="results"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {users.map((user, index) => (
                <motion.div
                  key={user.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    transition: {
                      delay: index * 0.05,
                      type: 'spring',
                      stiffness: 100,
                      damping: 15,
                    },
                  }}
                  className="h-full transform"
                >
                  <UserCard user={user} prefetch={prefetchUserData} />
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!loading && users.length > 0 && totalPages > 1 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex justify-center items-center space-x-1 mt-8"
        >
          <button
            onClick={() => onPageChange(Math.max(1, page - 1))}
            disabled={page === 1}
            className="px-3 py-1.5 rounded-md border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:border-[#F28B82] hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-[#F28B82] focus:ring-opacity-30 cursor-pointer"
            aria-label="Previous page"
          >
            ←
          </button>

          {getVisiblePages().map((pageNum, i) =>
            pageNum === '...' ? (
              <span key={`ellipsis-${i}`} className="px-3 py-1.5">
                ...
              </span>
            ) : (
              <button
                key={`page-${pageNum}`}
                onClick={() => typeof pageNum === 'number' && onPageChange(pageNum)}
                className={`px-3 py-1.5 rounded-md cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#F28B82] focus:ring-opacity-30 ${
                  pageNum === page
                    ? 'bg-[#F28B82] text-white'
                    : 'border border-gray-200 hover:border-[#F28B82] hover:bg-gray-50'
                } transition-colors`}
              >
                {pageNum}
              </button>
            )
          )}

          <button
            onClick={() => onPageChange(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            className="px-3 py-1.5 rounded-md border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:border-[#F28B82] hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-[#F28B82] focus:ring-opacity-30 cursor-pointer"
            aria-label="Next page"
          >
            →
          </button>
        </motion.div>
      )}
    </div>
  );
};
