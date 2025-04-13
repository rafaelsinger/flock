import React from 'react';
import { MapPin, Building } from 'lucide-react';

interface UserCardProps {
  name: string;
  location: string;
  company?: string;
}

const UserCard: React.FC<UserCardProps> = ({ name, location, company }) => (
  <div className="bg-white rounded-lg border border-gray-100 p-4 hover:shadow-md transition-all duration-200 cursor-pointer group">
    <div className="flex items-start gap-4">
      <div className="flex-1">
        <h3 className="font-medium text-[#333333] group-hover:text-[#F28B82] transition-colors">{name}</h3>
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
      <button className="text-sm text-[#F28B82] hover:text-[#F28B82]/80 transition-colors cursor-pointer hover:translate-x-0.5 duration-200">
        View Profile →
      </button>
    </div>
  </div>
);

export const UserGrid: React.FC = () => {
  // Mock data - replace with real data
  const users = [
    {
      name: "Alex Thompson",
      location: "San Francisco, CA",
      company: "Google",
    },
    // Add more mock users...
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {users.map((user) => (
        <UserCard key={user.name} {...user} />
      ))}
    </div>
  );
}; 