"use client";

import { FC, useState } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { IoArrowBack } from "react-icons/io5";
import { BsBriefcase } from "react-icons/bs";
import { LuGraduationCap } from "react-icons/lu";
import { FaEdit, FaSignOutAlt } from "react-icons/fa";

interface ProfilePageProps {
  params: {
    id: string;
  };
}

// Common input classes for consistency with onboarding flow
const inputClasses =
  "w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-[#F9C5D1] focus:ring-2 focus:ring-[#F9C5D1]/20 outline-none transition-colors hover:border-[#F9C5D1]/50 cursor-text text-[#333333]";
const labelClasses = "block text-sm font-medium text-[#333333] mb-2";

const ProfilePage: FC<ProfilePageProps> = ({ params }) => {
  const { data: session } = useSession();
  const isOwnProfile = session?.user?.email?.split("@")[0] === params.id;

  const [isEditing, setIsEditing] = useState(false);
  const [userData, setUserData] = useState({
    name: "Sarah Chen",
    type: "working",
    role: "Software Engineer",
    company: "Stripe",
    location: {
      city: "San Francisco",
      state: "CA",
      country: "USA",
    },
  });

  const handleSave = () => {
    // TODO: Implement backend save
    setIsEditing(false);
  };

  const handleSignOut = () => {
    signOut({ callbackUrl: "/" });
  };

  return (
    <main className="min-h-screen bg-[#FFF9F8] px-4 py-6 md:px-8">
      {/* Back Navigation and Sign Out */}
      <div className="flex justify-between items-center mb-8">
        <Link
          href="/directory"
          className="inline-flex items-center text-[#333333] hover:text-[#F28B82] transition-all hover:translate-y-[-1px] cursor-pointer"
        >
          <IoArrowBack className="mr-2" />
          Back to Directory
        </Link>

        {isOwnProfile && (
          <button
            onClick={handleSignOut}
            className="inline-flex items-center text-[#666666] hover:text-[#333333] transition-all hover:translate-y-[-1px] cursor-pointer"
          >
            <FaSignOutAlt className="mr-2" />
            Sign Out
          </button>
        )}
      </div>

      {/* Profile Card */}
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-sm p-8 border border-[#F9C5D1]/20">
        {isEditing ? (
          // Edit Form
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSave();
            }}
            className="space-y-6"
          >
            <div>
              <label className={labelClasses}>Name</label>
              <input
                type="text"
                value={userData.name}
                onChange={(e) =>
                  setUserData({ ...userData, name: e.target.value })
                }
                className={inputClasses}
              />
            </div>

            <div>
              <label className={labelClasses}>Type</label>
              <select
                value={userData.type}
                onChange={(e) =>
                  setUserData({ ...userData, type: e.target.value })
                }
                className={inputClasses.replace(
                  "cursor-text",
                  "cursor-pointer"
                )}
              >
                <option value="working">Working</option>
                <option value="studying">Studying</option>
              </select>
            </div>

            <div>
              <label className={labelClasses}>
                {userData.type === "working" ? "Role" : "Program"}
              </label>
              <input
                type="text"
                value={userData.role}
                onChange={(e) =>
                  setUserData({ ...userData, role: e.target.value })
                }
                className={inputClasses}
              />
            </div>

            <div>
              <label className={labelClasses}>
                {userData.type === "working" ? "Company" : "School"}
              </label>
              <input
                type="text"
                value={userData.company}
                onChange={(e) =>
                  setUserData({ ...userData, company: e.target.value })
                }
                className={inputClasses}
              />
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 text-[#666666] hover:text-[#333333] transition-all hover:translate-y-[-1px] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-[#F28B82] hover:bg-[#E67C73] text-white rounded-lg transition-all hover:translate-y-[-1px] cursor-pointer"
              >
                Save Changes
              </button>
            </div>
          </form>
        ) : (
          // View Mode
          <div className="relative">
            {isOwnProfile && (
              <button
                onClick={() => setIsEditing(true)}
                className="absolute top-0 right-0 inline-flex items-center text-[#F28B82] hover:text-[#E67C73] transition-all hover:translate-y-[-1px] cursor-pointer"
              >
                <FaEdit className="mr-2" />
                Edit Profile
              </button>
            )}

            <h1 className="text-4xl font-semibold text-[#333333] mb-6">
              {userData.name}
            </h1>

            <div className="flex items-center mb-4">
              {userData.type === "working" ? (
                <BsBriefcase className="text-[#F28B82] text-xl mr-3" />
              ) : (
                <LuGraduationCap className="text-[#A7D7F9] text-xl mr-3" />
              )}
              <p className="text-lg text-[#333333]">
                {userData.type === "working" ? "Working" : "Studying"} as{" "}
                {userData.role} at {userData.company}
              </p>
            </div>

            <div className="mb-6">
              <p className="text-lg text-[#333333]">
                {userData.location.city}, {userData.location.state},{" "}
                {userData.location.country}
              </p>
            </div>
          </div>
        )}
      </div>
    </main>
  );
};

export default ProfilePage;
