import { FC } from 'react';
import Link from 'next/link';
import { IoArrowBack } from 'react-icons/io5';
import { BsBriefcase } from 'react-icons/bs';
import { LuGraduationCap } from "react-icons/lu";

interface ProfilePageProps {
  params: {
    id: string;
  }
}

const ProfilePage: FC<ProfilePageProps> = ({ params }) => {
  console.log(params)
  // This would be replaced with actual data fetching
  const mockUserData = {
    name: "Sarah Chen",
    type: "working",
    role: "Software Engineer",
    company: "Stripe",
    location: {
      city: "San Francisco",
      state: "CA",
      country: "USA"
    },
    roommateInfo: "Looking for 2-3 roommates in SF",
  };

  return (
    <main className="min-h-screen bg-[#FFF9F8] px-4 py-6 md:px-8">
      {/* Back Navigation */}
      <Link 
        href="/directory" 
        className="inline-flex items-center text-[#333333] hover:text-[#F28B82] transition-colors mb-8"
      >
        <IoArrowBack className="mr-2" />
        Back to Directory
      </Link>

      {/* Profile Card */}
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-sm p-8 border border-[#F9C5D1]/20">
        <h1 className="text-4xl font-semibold text-[#333333] mb-6">
          {mockUserData.name}
        </h1>

        {/* Post-grad Status */}
        <div className="flex items-center mb-4">
          {mockUserData.type === 'working' ? (
            <BsBriefcase className="text-[#F28B82] text-xl mr-3" />
          ) : (
            <LuGraduationCap className="text-[#A7D7F9] text-xl mr-3" />
          )}
          <p className="text-lg text-[#333333]">
            Working as {mockUserData.role} at {mockUserData.company}
          </p>
        </div>

        {/* Location */}
        <div className="mb-6">
          <p className="text-lg text-[#333333]">
            {mockUserData.location.city}, {mockUserData.location.state}, {mockUserData.location.country}
          </p>
        </div>

        {/* Roommate Info */}
        {mockUserData.roommateInfo && (
          <div className="mt-8 p-4 bg-[#F9C5D1]/10 rounded-xl">
            <h2 className="text-lg font-medium text-[#333333] mb-2">
              Roommate Status
            </h2>
            <p className="text-[#333333]">
              {mockUserData.roommateInfo}
            </p>
          </div>
        )}
      </div>
    </main>
  );
};

export default ProfilePage; 