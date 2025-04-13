import React, { useEffect, useState } from "react";
import { MapPin, Building } from "lucide-react";
import Link from "next/link";

interface User {
  id: string;
  name: string;
  city: string;
  state: string;
  country: string;
  company?: string | null;
  school?: string | null;
  postGradType: "work" | "school";
  visibilityOptions: {
    role?: boolean;
    company?: boolean;
  };
}

interface UserCardProps {
  user: User;
}

const UserCard: React.FC<UserCardProps> = ({ user }) => {
  const location = `${user.city}, ${user.state}`;
  const company = user.visibilityOptions.company
    ? user.postGradType === "work"
      ? user.company
      : user.school
    : undefined;

  return (
    <Link href={`/profile/${user.id}`}>
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

export const UserGrid: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const ITEMS_PER_PAGE = 12;

  const fetchUsers = async (pageNum: number) => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/users?page=${pageNum}&limit=${ITEMS_PER_PAGE}`
      );
      const data = await response.json();
      setUsers(data.users);
      setTotalPages(Math.ceil(data.total / ITEMS_PER_PAGE));
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(page);
  }, [page]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {users.map((user) => (
          <UserCard key={user.id} user={user} />
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
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1 rounded border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:border-[#F28B82] transition-colors"
          >
            ←
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map(
            (pageNum) => (
              <button
                key={pageNum}
                onClick={() => setPage(pageNum)}
                className={`px-3 py-1 rounded ${
                  pageNum === page
                    ? "bg-[#F28B82] text-white"
                    : "border border-gray-200 hover:border-[#F28B82]"
                } transition-colors`}
              >
                {pageNum}
              </button>
            )
          )}

          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
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
