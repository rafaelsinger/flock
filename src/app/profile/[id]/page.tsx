"use client";

import { FC, useState, useEffect } from "react";
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

interface DBUser {
  name: string;
  postGradType: "work" | "school";
  title?: string | null;
  program?: string | null;
  company?: string | null;
  school?: string | null;
  city: string;
  state: string;
  country: string;
  visibilityOptions: {
    role?: boolean;
    company?: boolean;
  };
}

interface UserData {
  name: string;
  type: "working" | "studying";
  role: string;
  company: string;
  location: {
    city: string;
    state: string;
    country: string;
  };
  visibility: {
    role: boolean;
    company: boolean;
  };
}

// Common input classes for consistency with onboarding flow
const inputClasses =
  "w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-[#F9C5D1] focus:ring-2 focus:ring-[#F9C5D1]/20 outline-none transition-colors hover:border-[#F9C5D1]/50 cursor-text text-[#333333]";
const labelClasses = "block text-sm font-medium text-[#333333] mb-2";

const transformDBToUserData = (dbUser: DBUser): UserData => ({
  name: dbUser.name,
  type: dbUser.postGradType === "work" ? "working" : "studying",
  role:
    dbUser.postGradType === "work" ? dbUser.title || "" : dbUser.program || "",
  company:
    dbUser.postGradType === "work" ? dbUser.company || "" : dbUser.school || "",
  location: {
    city: dbUser.city,
    state: dbUser.state,
    country: dbUser.country,
  },
  visibility: {
    role: dbUser.visibilityOptions.role ?? true,
    company: dbUser.visibilityOptions.company ?? true,
  },
});

const transformUserDataToDB = (userData: UserData) => ({
  name: userData.name,
  postGradType: userData.type === "working" ? "work" : "school",
  title: userData.type === "working" ? userData.role : null,
  program: userData.type === "studying" ? userData.role : null,
  company: userData.type === "working" ? userData.company : null,
  school: userData.type === "studying" ? userData.company : null,
  city: userData.location.city,
  state: userData.location.state,
  country: userData.location.country,
  visibilityOptions: userData.visibility,
});

const ProfilePage: FC<ProfilePageProps> = ({ params }) => {
  const { data: session } = useSession();
  const isOwnProfile = session?.user?.email?.split("@")[0] === params.id;

  const [isEditing, setIsEditing] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch(`/api/users/${params.id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch user data");
        }
        const dbUser: DBUser = await response.json();
        setUserData(transformDBToUserData(dbUser));
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [params.id]);

  const handleSave = async () => {
    if (!userData) return;

    try {
      const response = await fetch(`/api/users/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(transformUserDataToDB(userData)),
      });

      if (!response.ok) {
        throw new Error("Failed to update user data");
      }

      const updatedDBUser: DBUser = await response.json();
      setUserData(transformDBToUserData(updatedDBUser));
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating user data:", error);
    }
  };

  const handleSignOut = () => {
    signOut({ callbackUrl: "/" });
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-[#FFF9F8] px-4 py-6 md:px-8">
        <div className="max-w-2xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="bg-white rounded-2xl shadow-sm p-8 border border-[#F9C5D1]/20">
              <div className="h-10 bg-gray-200 rounded w-3/4 mb-6"></div>
              <div className="h-6 bg-gray-200 rounded w-2/3 mb-4"></div>
              <div className="h-6 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (!userData) {
    return (
      <main className="min-h-screen bg-[#FFF9F8] px-4 py-6 md:px-8">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-2xl text-[#333333]">User not found</h1>
        </div>
      </main>
    );
  }

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
          <EditForm
            userData={userData}
            onSave={handleSave}
            onCancel={() => setIsEditing(false)}
            setUserData={setUserData}
          />
        ) : (
          // View Mode
          <ViewMode
            userData={userData}
            isOwnProfile={isOwnProfile}
            onEdit={() => setIsEditing(true)}
          />
        )}
      </div>
    </main>
  );
};

interface ViewModeProps {
  userData: UserData;
  isOwnProfile: boolean;
  onEdit: () => void;
}

const ViewMode = ({ userData, isOwnProfile, onEdit }: ViewModeProps) => (
  <div className="relative">
    {isOwnProfile && (
      <button
        onClick={onEdit}
        className="absolute top-0 right-0 inline-flex items-center text-[#F28B82] hover:text-[#E67C73] transition-all hover:translate-y-[-1px] cursor-pointer"
      >
        <FaEdit className="mr-2" />
        Edit Profile
      </button>
    )}

    <h1 className="text-4xl font-semibold text-[#333333] mb-6">
      {userData.name}
    </h1>

    {(isOwnProfile ||
      userData.visibility.role ||
      userData.visibility.company) && (
      <div className="flex items-center mb-4">
        {userData.type === "working" ? (
          <BsBriefcase className="text-[#F28B82] text-xl mr-3" />
        ) : (
          <LuGraduationCap className="text-[#A7D7F9] text-xl mr-3" />
        )}
        <p className="text-lg text-[#333333]">
          {userData.type === "working" ? "Working" : "Studying"}
          {userData.visibility.role && <> as {userData.role}</>}
          {userData.visibility.company && <> at {userData.company}</>}
        </p>
      </div>
    )}

    <div className="mb-6">
      <p className="text-lg text-[#333333]">
        {userData.location.city}, {userData.location.state},{" "}
        {userData.location.country}
      </p>
    </div>
  </div>
);

interface EditFormProps {
  userData: UserData;
  onSave: () => void;
  onCancel: () => void;
  setUserData: (userData: UserData) => void;
}

const EditForm = ({
  userData,
  onSave,
  onCancel,
  setUserData,
}: EditFormProps) => (
  <form
    onSubmit={(e) => {
      e.preventDefault();
      onSave();
    }}
    className="space-y-6"
  >
    <div>
      <label className={labelClasses}>Name</label>
      <input
        type="text"
        value={userData.name}
        onChange={(e) => setUserData({ ...userData, name: e.target.value })}
        className={inputClasses}
      />
    </div>

    <div>
      <label className={labelClasses}>Type</label>
      <select
        value={userData.type}
        onChange={(e) =>
          setUserData({
            ...userData,
            type: e.target.value as "working" | "studying",
          })
        }
        className={inputClasses.replace("cursor-text", "cursor-pointer")}
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
        onChange={(e) => setUserData({ ...userData, role: e.target.value })}
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
        onChange={(e) => setUserData({ ...userData, company: e.target.value })}
        className={inputClasses}
      />
    </div>

    <div className="space-y-4">
      <h3 className="text-lg font-medium text-[#333333]">
        Visibility Settings
      </h3>
      <div className="space-y-2">
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={userData.visibility.role}
            onChange={(e) =>
              setUserData({
                ...userData,
                visibility: { ...userData.visibility, role: e.target.checked },
              })
            }
            className="rounded text-[#F28B82] focus:ring-[#F28B82]"
          />
          <span className="text-sm text-[#666666]">Show role/program</span>
        </label>

        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={userData.visibility.company}
            onChange={(e) =>
              setUserData({
                ...userData,
                visibility: {
                  ...userData.visibility,
                  company: e.target.checked,
                },
              })
            }
            className="rounded text-[#F28B82] focus:ring-[#F28B82]"
          />
          <span className="text-sm text-[#666666]">Show company/school</span>
        </label>
      </div>
    </div>

    <div className="flex justify-end space-x-4">
      <button
        type="button"
        onClick={onCancel}
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
);

export default ProfilePage;
