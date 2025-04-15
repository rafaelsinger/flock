'use client';

import { FC, useState, useRef, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { IoArrowBack } from 'react-icons/io5';
import { BsBriefcase, BsGeoAlt, BsEyeFill, BsPerson } from 'react-icons/bs';
import { LuGraduationCap } from 'react-icons/lu';
import { FaEdit, FaSignOutAlt, FaBuilding, FaUniversity, FaHome } from 'react-icons/fa';
import { MdWork } from 'react-icons/md';
import { HiOutlineAcademicCap } from 'react-icons/hi';
import { NotFoundState } from '@/components/NotFoundState/NotFoundState';
import { capitalize } from '@/lib/utils';
import { useUserData } from '@/hooks/useUserData';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  getDisplayRole,
  getDisplayCompany,
  isRoleVisible,
  isCompanyVisible,
  UpdateUser,
} from '@/types/user';
import { CitySelect } from '@/components/Select/CitySelect';

// Common input classes for consistency with onboarding flow
const inputClasses =
  'w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-[#F9C5D1] focus:ring-2 focus:ring-[#F9C5D1]/20 outline-none transition-all hover:border-[#F9C5D1]/50 cursor-text text-[#333333]';
const labelClasses = 'flex items-center text-sm font-medium text-[#333333] mb-2';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      staggerChildren: 0.1,
    },
  },
  exit: { opacity: 0, y: -20, transition: { duration: 0.2 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
};

const ProfilePage: FC = () => {
  const params = useParams();
  const userId = params.id as string;
  const { data: session, update } = useSession();
  const isOwnProfile = session?.user.id === userId;
  const queryClient = useQueryClient();

  const [isEditing, setIsEditing] = useState(false);
  const [editedUserData, setEditedUserData] = useState<UpdateUser | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const profileCardRef = useRef<HTMLDivElement>(null);

  // Use React Query to fetch user data
  const { data: userData, isLoading, error } = useUserData(userId);

  // Initialize edit form when entering edit mode
  const handleEditClick = () => {
    if (userData) {
      setEditedUserData({ ...userData });
      setIsEditing(true);
    }
  };

  // Scroll to top of profile card when switching modes
  useEffect(() => {
    if (profileCardRef.current) {
      profileCardRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [isEditing]);

  // Mutation for updating user data
  const updateUserMutation = useMutation({
    mutationFn: async (updatedData: UpdateUser) => {
      setIsSubmitting(true);
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
      // Update session
      await update({ user });
      // Invalidate and refetch the user data
      queryClient.invalidateQueries({ queryKey: ['user', userId] });
      setIsEditing(false);
      setIsSubmitting(false);
    },
    onError: (error) => {
      console.error('Error updating user data:', error);
      setIsSubmitting(false);
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
      <div className="min-h-screen bg-[#FFF9F8] py-12 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-48 bg-white rounded-2xl shadow-sm border border-[#F9C5D1]/10">
              <div className="p-8 space-y-4">
                <div className="h-8 bg-gray-200 rounded w-2/3"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
              </div>
            </div>
          </div>
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
    <div className="min-h-screen bg-[#FFF9F8] py-12 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        {/* Back Navigation and Sign Out */}
        <motion.div
          className="flex justify-between items-center mb-8"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Link
            href="/"
            className="inline-flex items-center text-[#333333] hover:text-[#F28B82] transition-all hover:translate-y-[-1px] cursor-pointer"
          >
            <IoArrowBack className="mr-2" />
            Back to Directory
          </Link>

          {isOwnProfile && (
            <motion.button
              onClick={handleSignOut}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center text-[#666666] hover:text-[#333333] transition-all cursor-pointer px-4 py-2 rounded-lg hover:bg-gray-50"
            >
              <FaSignOutAlt className="mr-2" />
              Sign Out
            </motion.button>
          )}
        </motion.div>

        {/* Profile Card */}
        <motion.div
          ref={profileCardRef}
          className="bg-white rounded-2xl shadow-sm p-8 border border-[#F9C5D1]/20 transition-all hover:shadow-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <AnimatePresence mode="wait">
            {isEditing ? (
              // Edit Form
              <EditForm
                key="edit-form"
                userData={editedUserData!}
                setUserData={setEditedUserData}
                onSave={handleSave}
                onCancel={() => setIsEditing(false)}
                isSubmitting={isSubmitting}
              />
            ) : (
              // View Mode
              <ViewMode
                key="view-mode"
                userData={userData}
                isOwnProfile={isOwnProfile}
                onEdit={handleEditClick}
              />
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
};

interface ViewModeProps {
  userData: UpdateUser;
  isOwnProfile: boolean;
  onEdit: () => void;
}

const ViewMode = ({ userData, isOwnProfile, onEdit }: ViewModeProps) => {
  // Determine which visibility settings to use based on user type
  const showRole = isRoleVisible(userData, isOwnProfile);
  const showCompany = isCompanyVisible(userData, isOwnProfile);

  const displayRole = getDisplayRole(userData);
  const displayCompany = getDisplayCompany(userData);

  const renderProfileIcon = () => {
    return userData.postGradType === 'work' ? (
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="w-16 h-16 rounded-full bg-[#F28B82]/10 flex items-center justify-center"
      >
        <BsBriefcase className="text-[#F28B82] text-2xl" />
      </motion.div>
    ) : (
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="w-16 h-16 rounded-full bg-[#A7D7F9]/10 flex items-center justify-center"
      >
        <LuGraduationCap className="text-[#A7D7F9] text-2xl" />
      </motion.div>
    );
  };

  return (
    <motion.div
      className="relative"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      {isOwnProfile && (
        <motion.button
          onClick={onEdit}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="absolute top-0 right-0 inline-flex items-center px-4 py-2 rounded-lg bg-[#F9C5D1]/10 text-[#F28B82] hover:bg-[#F9C5D1]/20 transition-all cursor-pointer"
        >
          <FaEdit className="mr-2" />
          Edit Profile
        </motion.button>
      )}

      <div className="flex flex-col md:flex-row md:items-start gap-6">
        {renderProfileIcon()}

        <div className="flex-1">
          <motion.h1 className="text-4xl font-semibold text-[#333333] mb-6" variants={itemVariants}>
            {userData.name}
          </motion.h1>

          {/* Only show if the user is viewing their own profile or if at least one visibility setting is true */}
          {(showRole || showCompany) && (
            <motion.div className="flex items-start space-x-2 mb-4" variants={itemVariants}>
              <div className="mt-1">
                {userData.postGradType === 'work' ? (
                  <MdWork className="text-[#F28B82] text-xl" />
                ) : (
                  <HiOutlineAcademicCap className="text-[#A7D7F9] text-xl" />
                )}
              </div>
              <div>
                <p className="text-lg text-[#333333]">
                  {showRole && <span className="font-medium">{capitalize(displayRole)}</span>}
                  {showRole && showCompany && ' at '}
                  {showCompany && displayCompany}
                </p>
                {isOwnProfile && !showRole && (
                  <p className="text-sm text-[#666666] italic">
                    Your role is hidden from other users
                  </p>
                )}
                {isOwnProfile && !showCompany && (
                  <p className="text-sm text-[#666666] italic">
                    Your {userData.postGradType === 'work' ? 'company' : 'school'} is hidden from
                    other users
                  </p>
                )}
              </div>
            </motion.div>
          )}

          <motion.div className="flex items-start space-x-2 mb-4" variants={itemVariants}>
            <BsGeoAlt className="text-[#F28B82] text-xl mt-1" />
            <div>
              <p className="text-lg text-[#333333]">
                {userData.location?.city}
                {userData.location?.state && `, ${userData.location?.state}`}
                {userData.location?.country &&
                  userData.location?.country !== 'USA' &&
                  `, ${userData.location?.country}`}
              </p>
            </div>
          </motion.div>

          {/* Roommate status */}
          {userData.lookingForRoommate && (
            <motion.div className="flex items-start space-x-2 mb-4" variants={itemVariants}>
              <FaHome className="text-[#8FC9A9] text-xl mt-1" />
              <div>
                <p className="text-lg font-medium text-[#8FC9A9]">Looking for roommates</p>
              </div>
            </motion.div>
          )}

          {/* Email display */}
          {userData.email && (
            <motion.div className="flex items-start space-x-2 mb-4" variants={itemVariants}>
              <svg
                className="text-[#F28B82] text-xl mt-1"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M20 4H4C2.9 4 2.01 4.9 2.01 6L2 18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6C22 4.9 21.1 4 20 4ZM20 8L12 13L4 8V6L12 11L20 6V8Z"
                  fill="currentColor"
                />
              </svg>
              <div>
                <p className="text-lg text-[#333333]">{userData.email}</p>
              </div>
            </motion.div>
          )}

          {isOwnProfile && (
            <motion.div
              className="mt-8 p-4 rounded-xl bg-[#FFF9F8] border border-[#F9C5D1]/10"
              variants={itemVariants}
              whileHover={{ y: -2, boxShadow: '0 4px 6px rgba(249, 197, 209, 0.1)' }}
            >
              <div className="flex items-center space-x-2 mb-2">
                <BsEyeFill className="text-[#F28B82] text-sm" />
                <h3 className="font-medium text-[#333333]">Visibility Settings</h3>
              </div>
              <ul className="space-y-2 text-[#666666] pl-4">
                {userData.postGradType === 'work' ? (
                  <>
                    <li className="flex items-center space-x-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#F28B82]"></span>
                      <span>
                        {userData.visibilityOptions?.company
                          ? 'Company name visible to classmates'
                          : 'Company name hidden from classmates'}
                      </span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#F28B82]"></span>
                      <span>
                        {userData.visibilityOptions?.title
                          ? 'Role visible to classmates'
                          : 'Role hidden from classmates'}
                      </span>
                    </li>
                  </>
                ) : (
                  <>
                    <li className="flex items-center space-x-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#A7D7F9]"></span>
                      <span>
                        {userData.visibilityOptions?.school
                          ? 'School name visible to classmates'
                          : 'School name hidden from classmates'}
                      </span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#A7D7F9]"></span>
                      <span>
                        {userData.visibilityOptions?.program
                          ? 'Program visible to classmates'
                          : 'Program hidden from classmates'}
                      </span>
                    </li>
                  </>
                )}
              </ul>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

interface EditFormProps {
  userData: UpdateUser;
  setUserData: (userData: UpdateUser) => void;
  onSave: () => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

const EditForm = ({ userData, setUserData, onSave, onCancel, isSubmitting }: EditFormProps) => {
  // Determine which visibility labels to show based on user type
  const roleLabel = userData.postGradType === 'work' ? 'Role' : 'Program';
  const companyLabel = userData.postGradType === 'work' ? 'Company' : 'School';

  const [activeField, setActiveField] = useState<string | null>(null);

  // Animation variants for input fields
  const inputVariants = {
    focus: { scale: 1.02, boxShadow: '0 4px 6px rgba(249, 197, 209, 0.1)' },
    blur: { scale: 1, boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)' },
  };

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

  // Handle roommate status change
  const handleRoommateStatusChange = (isLookingForRoommate: boolean) => {
    setUserData({
      ...userData,
      lookingForRoommate: isLookingForRoommate,
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
    <motion.form
      onSubmit={(e) => {
        e.preventDefault();
        onSave();
      }}
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <motion.div className="flex justify-between items-center mb-6" variants={itemVariants}>
        <h2 className="text-2xl font-semibold text-[#333333]">Edit Your Profile</h2>
      </motion.div>

      <motion.div variants={itemVariants}>
        <label htmlFor="name" className={labelClasses}>
          <BsPerson className="mr-2 text-[#F28B82]" />
          Name
        </label>
        <motion.div variants={inputVariants} animate={activeField === 'name' ? 'focus' : 'blur'}>
          <input
            id="name"
            type="text"
            value={userData.name || ''}
            onChange={(e) => setUserData({ ...userData, name: e.target.value })}
            onFocus={() => setActiveField('name')}
            onBlur={() => setActiveField(null)}
            className={inputClasses}
          />
        </motion.div>
      </motion.div>

      <motion.div variants={itemVariants}>
        <label htmlFor="email" className={labelClasses}>
          <svg
            className="mr-2 text-[#F28B82]"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M20 4H4C2.9 4 2.01 4.9 2.01 6L2 18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6C22 4.9 21.1 4 20 4ZM20 8L12 13L4 8V6L12 11L20 6V8Z"
              fill="currentColor"
            />
          </svg>
          Email
        </label>
        <motion.div variants={inputVariants} animate={activeField === 'email' ? 'focus' : 'blur'}>
          <input
            id="email"
            type="email"
            value={userData.email || ''}
            onChange={(e) => setUserData({ ...userData, email: e.target.value })}
            onFocus={() => setActiveField('email')}
            onBlur={() => setActiveField(null)}
            className={inputClasses}
          />
        </motion.div>
      </motion.div>

      <motion.div variants={itemVariants}>
        <label htmlFor="type" className={labelClasses}>
          {userData.postGradType === 'work' ? (
            <BsBriefcase className="mr-2 text-[#F28B82]" />
          ) : (
            <LuGraduationCap className="mr-2 text-[#A7D7F9]" />
          )}
          Type
        </label>
        <motion.div variants={inputVariants} animate={activeField === 'type' ? 'focus' : 'blur'}>
          <select
            id="type"
            value={userData.postGradType}
            onChange={(e) => handleTypeChange(e.target.value as 'work' | 'school')}
            onFocus={() => setActiveField('type')}
            onBlur={() => setActiveField(null)}
            className={inputClasses.replace('cursor-text', 'cursor-pointer')}
          >
            <option value="work">Working</option>
            <option value="school">Studying</option>
          </select>
        </motion.div>
      </motion.div>

      <motion.div variants={itemVariants}>
        <label htmlFor="role" className={labelClasses}>
          {userData.postGradType === 'work' ? (
            <MdWork className="mr-2 text-[#F28B82]" />
          ) : (
            <HiOutlineAcademicCap className="mr-2 text-[#A7D7F9]" />
          )}
          {roleLabel}
        </label>
        <motion.div variants={inputVariants} animate={activeField === 'role' ? 'focus' : 'blur'}>
          <input
            id="role"
            type="text"
            value={userData.postGradType === 'work' ? userData.title || '' : userData.program || ''}
            onChange={(e) => {
              if (userData.postGradType === 'work') {
                setUserData({ ...userData, title: e.target.value });
              } else {
                setUserData({ ...userData, program: e.target.value });
              }
            }}
            onFocus={() => setActiveField('role')}
            onBlur={() => setActiveField(null)}
            className={inputClasses}
          />
        </motion.div>
      </motion.div>

      <motion.div variants={itemVariants}>
        <label htmlFor="company" className={labelClasses}>
          {userData.postGradType === 'work' ? (
            <FaBuilding className="mr-2 text-[#F28B82]" />
          ) : (
            <FaUniversity className="mr-2 text-[#A7D7F9]" />
          )}
          {companyLabel}
        </label>
        <motion.div variants={inputVariants} animate={activeField === 'company' ? 'focus' : 'blur'}>
          <input
            id="company"
            type="text"
            value={
              userData.postGradType === 'work' ? userData.company || '' : userData.school || ''
            }
            onChange={(e) => {
              if (userData.postGradType === 'work') {
                setUserData({ ...userData, company: e.target.value });
              } else {
                setUserData({ ...userData, school: e.target.value });
              }
            }}
            onFocus={() => setActiveField('company')}
            onBlur={() => setActiveField(null)}
            className={inputClasses}
          />
        </motion.div>
      </motion.div>

      <motion.div variants={itemVariants}>
        <label htmlFor="location" className={labelClasses}>
          <BsGeoAlt className="mr-2 text-[#F28B82]" />
          Location
        </label>
        <motion.div variants={inputVariants} animate={activeField === 'city' ? 'focus' : 'blur'}>
          <CitySelect
            value={`${userData.location?.city}${userData.location?.state ? `, ${userData.location?.state}` : ''}${
              userData.location?.country && userData.location?.country !== 'USA'
                ? `, ${userData.location?.country}`
                : ''
            }`}
            onChange={(location) => {
              setUserData({
                ...userData,
                location: {
                  city: location.city,
                  state: location.state,
                  country: location.country,
                  lat: location.lat,
                  lon: location.lon,
                },
              });
            }}
          />
        </motion.div>
      </motion.div>

      <motion.div variants={itemVariants} className="space-y-4">
        <label className={labelClasses}>Roommate Status</label>
        <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-2">
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="looking-for-roommate"
              checked={userData.lookingForRoommate || false}
              onChange={(e) => handleRoommateStatusChange(e.target.checked)}
              className="w-4 h-4 text-[#8FC9A9] border-gray-300 rounded focus:ring-[#8FC9A9]/80"
            />
            <label htmlFor="looking-for-roommate" className="flex items-center cursor-pointer">
              <FaHome className="text-[#8FC9A9] mr-2" />
              <span className="text-[#333]">
                I&apos;m looking for roommates in my post-grad destination
              </span>
            </label>
          </div>
          <p className="text-xs text-gray-500 pl-7">
            This will be visible to your classmates in the directory
          </p>
        </div>
      </motion.div>

      {/* Update visibility section */}
      <motion.div
        className="p-4 rounded-xl bg-[#FFF9F8] border border-[#F9C5D1]/10 space-y-3 mt-4"
        variants={itemVariants}
      >
        <div className="flex items-center space-x-2">
          <BsEyeFill className="text-[#F28B82]" />
          <h3 className="text-sm font-medium text-[#333333]">Privacy Settings</h3>
        </div>

        <motion.label
          className="flex items-center justify-between p-2 hover:bg-white/50 rounded-lg transition-all cursor-pointer"
          whileHover={{ scale: 1.01, backgroundColor: 'rgba(249, 197, 209, 0.05)' }}
          whileTap={{ scale: 0.99 }}
        >
          <span className="text-sm text-[#666666]">Show {roleLabel.toLowerCase()}</span>
          <motion.div whileTap={{ scale: 0.9 }}>
            <input
              type="checkbox"
              checked={
                userData.postGradType === 'work'
                  ? (userData.visibilityOptions?.title ?? true)
                  : (userData.visibilityOptions?.program ?? true)
              }
              onChange={(e) => handleVisibilityChange('role', e.target.checked)}
              className="h-5 w-5 rounded-md border-gray-300 text-[#F28B82] focus:ring-[#F28B82]"
            />
          </motion.div>
        </motion.label>

        <motion.label
          className="flex items-center justify-between p-2 hover:bg-white/50 rounded-lg transition-all cursor-pointer"
          whileHover={{ scale: 1.01, backgroundColor: 'rgba(249, 197, 209, 0.05)' }}
          whileTap={{ scale: 0.99 }}
        >
          <span className="text-sm text-[#666666]">Show {companyLabel.toLowerCase()}</span>
          <motion.div whileTap={{ scale: 0.9 }}>
            <input
              type="checkbox"
              checked={
                userData.postGradType === 'work'
                  ? (userData.visibilityOptions?.company ?? true)
                  : (userData.visibilityOptions?.school ?? true)
              }
              onChange={(e) => handleVisibilityChange('company', e.target.checked)}
              className="h-5 w-5 rounded-md border-gray-300 text-[#F28B82] focus:ring-[#F28B82]"
            />
          </motion.div>
        </motion.label>
      </motion.div>

      <motion.div variants={itemVariants} className="flex justify-end space-x-4 pt-4">
        <motion.button
          type="button"
          onClick={onCancel}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="px-6 py-2.5 rounded-lg text-[#666666] hover:text-[#333333] transition-colors cursor-pointer hover:bg-gray-50 active:bg-gray-100"
        >
          Cancel
        </motion.button>
        <motion.button
          type="submit"
          disabled={isSubmitting}
          whileHover={!isSubmitting ? { scale: 1.02 } : {}}
          whileTap={!isSubmitting ? { scale: 0.98 } : {}}
          className={`px-6 py-2.5 rounded-lg transition-all cursor-pointer shadow-sm hover:shadow ${
            isSubmitting
              ? 'bg-[#F9C5D1]/50 cursor-not-allowed text-white/70'
              : 'bg-[#F28B82] hover:bg-[#E67C73] text-white'
          }`}
        >
          {isSubmitting ? (
            <span className="flex items-center">
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Saving...
            </span>
          ) : (
            'Save Changes'
          )}
        </motion.button>
      </motion.div>
    </motion.form>
  );
};

export default ProfilePage;
