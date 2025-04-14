'use client';

import { FC, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { IoArrowBack } from 'react-icons/io5';
import { BsBriefcase } from 'react-icons/bs';
import { LuGraduationCap } from 'react-icons/lu';
import { FaEdit, FaSignOutAlt } from 'react-icons/fa';
import { NotFoundState } from '@/components/NotFoundState/NotFoundState';
import { capitalize } from '@/lib/utils';
import { useUserData } from '@/hooks/useUserData';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  User,
  getDisplayRole,
  getDisplayCompany,
  isRoleVisible,
  isCompanyVisible,
} from '@/types/user';

// Common input classes for consistency with onboarding flow
const inputClasses =
  'w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-[#F9C5D1] focus:ring-2 focus:ring-[#F9C5D1]/20 outline-none transition-colors hover:border-[#F9C5D1]/50 cursor-text text-[#333333]';
const labelClasses = 'block text-sm font-medium text-[#333333] mb-2';

const ProfilePage: FC = () => {
  const params = useParams();
  const userId = params.id as string;
  const { data: session, update } = useSession();
  const isOwnProfile = session?.user.id === userId;
  const queryClient = useQueryClient();

  const [isEditing, setIsEditing] = useState(false);
  const [editedUserData, setEditedUserData] = useState<User | null>(null);

  // Use React Query to fetch user data
  const { data: userData, isLoading, error } = useUserData(userId);

  // Initialize edit form when entering edit mode
  const handleEditClick = () => {
    if (userData) {
      setEditedUserData({ ...userData });
      setIsEditing(true);
    }
  };

  // Mutation for updating user data
  const updateUserMutation = useMutation({
    mutationFn: async (updatedData: User) => {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData),
      });

      if (!response.ok) {
        throw new Error('Failed to update user data');
      }

      return response.json();
    },
    onSuccess: async (user) => {
      // update session
      await update(user);
      // Invalidate and refetch the user data
      queryClient.invalidateQueries({ queryKey: ['user', userId] });
      setIsEditing(false);
    },
  });

  const handleSave = () => {
    if (editedUserData) {
      updateUserMutation.mutate(editedUserData);
    }
  };

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-4xl py-8 px-4">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-24 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error || !userData) {
    return (
      <NotFoundState
        title="User Not Found"
        message="This user profile doesn't exist or has been removed."
        linkText="Back to Directory"
        linkHref="/"
      />
    );
  }

  return (
    <div className="container mx-auto max-w-4xl py-8 px-4">
      {/* Back Navigation and Sign Out */}
      <div className="flex justify-between items-center mb-8">
        <Link
          href="/"
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
            userData={editedUserData!}
            setUserData={setEditedUserData}
            onSave={handleSave}
            onCancel={() => setIsEditing(false)}
          />
        ) : (
          // View Mode
          <ViewMode userData={userData} isOwnProfile={isOwnProfile} onEdit={handleEditClick} />
        )}
      </div>
    </div>
  );
};

interface ViewModeProps {
  userData: User;
  isOwnProfile: boolean;
  onEdit: () => void;
}

const ViewMode = ({ userData, isOwnProfile, onEdit }: ViewModeProps) => {
  // Determine which visibility settings to use based on user type
  const showRole = isRoleVisible(userData, isOwnProfile);
  const showCompany = isCompanyVisible(userData, isOwnProfile);

  const displayRole = getDisplayRole(userData);
  const displayCompany = getDisplayCompany(userData);

  return (
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

      <h1 className="text-4xl font-semibold text-[#333333] mb-6">{userData.name}</h1>

      {/* Only show if the user is viewing their own profile or if at least one visibility setting is true */}
      {(showRole || showCompany) && (
        <div className="flex items-center mb-4">
          {userData.postGradType === 'work' ? (
            <BsBriefcase className="text-[#F28B82] text-xl mr-3" />
          ) : (
            <LuGraduationCap className="text-[#A7D7F9] text-xl mr-3" />
          )}
          <p className="text-lg text-[#333333]">
            {showRole && capitalize(displayRole)}
            {showRole && showCompany && ' at '}
            {showCompany && displayCompany}
          </p>
        </div>
      )}

      <div className="mb-6">
        <p className="text-lg text-[#333333]">
          {userData.city}, {userData.state}, {userData.country}
        </p>
      </div>
    </div>
  );
};

interface EditFormProps {
  userData: User;
  setUserData: (userData: User) => void;
  onSave: () => void;
  onCancel: () => void;
}

const EditForm = ({ userData, setUserData, onSave, onCancel }: EditFormProps) => {
  // Determine which visibility labels to show based on user type
  const roleLabel = userData.postGradType === 'work' ? 'Role' : 'Program';
  const companyLabel = userData.postGradType === 'work' ? 'Company' : 'School';

  // Update visibility settings based on user type
  const handleVisibilityChange = (field: string, value: boolean) => {
    const updatedVisibilityOptions = { ...userData.visibilityOptions };

    if (field === 'role') {
      if (userData.postGradType === 'work') {
        updatedVisibilityOptions.title = value;
      } else {
        updatedVisibilityOptions.program = value;
      }
    } else if (field === 'company') {
      if (userData.postGradType === 'work') {
        updatedVisibilityOptions.company = value;
      } else {
        updatedVisibilityOptions.school = value;
      }
    }

    setUserData({
      ...userData,
      visibilityOptions: updatedVisibilityOptions,
    });
  };

  // Handle type change
  const handleTypeChange = (type: 'work' | 'school') => {
    // When changing type, we need to swap role/program and company/school
    const newUserData = { ...userData, postGradType: type };

    if (type === 'work') {
      // Moving from school to work
      if (userData.postGradType === 'school') {
        newUserData.title = userData.program;
        newUserData.program = null;
        newUserData.company = userData.school;
        newUserData.school = null;
      }
    } else {
      // Moving from work to school
      if (userData.postGradType === 'work') {
        newUserData.program = userData.title;
        newUserData.title = null;
        newUserData.school = userData.company;
        newUserData.company = null;
      }
    }

    setUserData(newUserData);
  };

  return (
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
          value={userData.postGradType}
          onChange={(e) => handleTypeChange(e.target.value as 'work' | 'school')}
          className={inputClasses.replace('cursor-text', 'cursor-pointer')}
        >
          <option value="work">Working</option>
          <option value="school">Studying</option>
        </select>
      </div>

      <div>
        <label className={labelClasses}>{roleLabel}</label>
        <input
          type="text"
          value={userData.postGradType === 'work' ? userData.title || '' : userData.program || ''}
          onChange={(e) => {
            if (userData.postGradType === 'work') {
              setUserData({ ...userData, title: e.target.value });
            } else {
              setUserData({ ...userData, program: e.target.value });
            }
          }}
          className={inputClasses}
        />
      </div>

      <div>
        <label className={labelClasses}>{companyLabel}</label>
        <input
          type="text"
          value={userData.postGradType === 'work' ? userData.company || '' : userData.school || ''}
          onChange={(e) => {
            if (userData.postGradType === 'work') {
              setUserData({ ...userData, company: e.target.value });
            } else {
              setUserData({ ...userData, school: e.target.value });
            }
          }}
          className={inputClasses}
        />
      </div>

      {/* Update visibility checkboxes */}
      <div className="space-y-2 mt-6">
        <h3 className="text-sm font-medium text-[#333333]">Privacy Settings</h3>

        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={
              userData.postGradType === 'work'
                ? (userData.visibilityOptions.title ?? true)
                : (userData.visibilityOptions.program ?? true)
            }
            onChange={(e) => handleVisibilityChange('role', e.target.checked)}
            className="rounded text-[#F28B82] focus:ring-[#F28B82]"
          />
          <span className="text-sm text-[#666666]">Show {roleLabel.toLowerCase()}</span>
        </label>

        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={
              userData.postGradType === 'work'
                ? (userData.visibilityOptions.company ?? true)
                : (userData.visibilityOptions.school ?? true)
            }
            onChange={(e) => handleVisibilityChange('company', e.target.checked)}
            className="rounded text-[#F28B82] focus:ring-[#F28B82]"
          />
          <span className="text-sm text-[#666666]">Show {companyLabel.toLowerCase()}</span>
        </label>
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
};

export default ProfilePage;
