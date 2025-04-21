'use client';

import { FC, useState, useRef, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { IoArrowBack } from 'react-icons/io5';
import { BsBriefcase, BsGeoAlt, BsEyeFill, BsPerson } from 'react-icons/bs';
import { LuGraduationCap } from 'react-icons/lu';
import { FaEdit, FaSignOutAlt, FaBuilding, FaUniversity, FaHome, FaTrash } from 'react-icons/fa';
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
  User,
} from '@/types/user';
import { CitySelect } from '@/components/Select/CitySelect';
import { SchoolSelect } from '@/components/Select/SchoolSelect';
import { ProgramTypeSelect } from '@/components/Select/ProgramTypeSelect';
import { DisciplineSelect } from '@/components/Select/DisciplineSelect';
import { PostGradType } from '@prisma/client';
import { INDUSTRIES } from '@/constants/industries';

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

  // Use this for delete account event handling
  useEffect(() => {
    // Function to handle account deletion
    const deleteUser = async () => {
      try {
        // Call the API to delete the account
        const response = await fetch(`/api/users/${userId}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error(`Failed to delete account: ${response.statusText}`);
        }

        // Sign out and redirect to homepage after successful deletion
        alert('Your account has been successfully deleted. You will now be signed out.');
        signOut({ callbackUrl: '/' });
      } catch (error: unknown) {
        console.error('Error deleting account:', error);

        // More user-friendly error message
        const errorMessage = error instanceof Error ? error.message : String(error);

        if (errorMessage.includes('not found')) {
          alert('Account not found or already deleted. You will be signed out.');
          signOut({ callbackUrl: '/' });
        } else {
          alert(
            `Failed to delete your account: ${errorMessage || 'Unknown error'}. Please try again later.`
          );
        }
      }
    };

    const handleDeleteRequest = () => {
      // Instead of using global state, directly trigger the delete action
      if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
        deleteUser();
      }
    };

    window.addEventListener('delete-account', handleDeleteRequest);

    return () => {
      window.removeEventListener('delete-account', handleDeleteRequest);
    };
  }, [userId]);

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
                userId={userId}
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

  const isSeeking = userData.postGradType === PostGradType.seeking;
  const isInternship = userData.postGradType === PostGradType.internship;
  const isWork = userData.postGradType === PostGradType.work;
  const isSchool = userData.postGradType === PostGradType.school;

  const renderProfileIcon = () => {
    if (isSeeking) {
      return (
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="w-16 h-16 rounded-full bg-[#9E9E9E]/10 flex items-center justify-center"
        >
          <svg
            className="h-8 w-8 text-[#9E9E9E]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </motion.div>
      );
    }
    if (isInternship) {
      return (
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="w-16 h-16 rounded-full bg-[#F4B942]/10 flex items-center justify-center"
        >
          <MdWork className="text-[#F4B942] text-2xl" />
        </motion.div>
      );
    }
    return userData.postGradType === PostGradType.work ? (
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
      {/* Action buttons container */}
      <div className="absolute top-0 right-0 flex space-x-3">
        {!isOwnProfile && (
          <Link
            href={`/conversations/${userData.id}`}
            className="inline-flex items-center px-4 py-2 rounded-lg bg-[#F9C5D1]/10 text-[#F28B82] hover:bg-[#F9C5D1]/20 transition-all cursor-pointer"
          >
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
              />
            </svg>
            Message
          </Link>
        )}
        {isOwnProfile && (
          <motion.button
            onClick={onEdit}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center px-4 py-2 rounded-lg bg-[#F9C5D1]/10 text-[#F28B82] hover:bg-[#F9C5D1]/20 transition-all cursor-pointer"
          >
            <FaEdit className="mr-2" />
            Edit Profile
          </motion.button>
        )}
      </div>

      <div className="flex flex-col md:flex-row md:items-start gap-6 pt-16 sm:pt-0">
        {renderProfileIcon()}

        <div className="flex-1">
          <motion.h1 className="text-4xl font-semibold text-[#333333] mb-6" variants={itemVariants}>
            {userData.name}
          </motion.h1>

          {/* Graduate type tag based on class year and type */}
          <motion.div className="mb-4" variants={itemVariants}>
            {isWork && userData.classYear === 2025 && (
              <span className="inline-block px-3 py-1 bg-[#F28B82]/10 text-[#F28B82] text-sm font-medium rounded-full">
                Class of 2025 - Full-time role
              </span>
            )}
            {isSchool && userData.classYear === 2025 && (
              <span className="inline-block px-3 py-1 bg-[#A7D7F9]/10 text-[#A7D7F9] text-sm font-medium rounded-full">
                Class of 2025 - Graduate school
              </span>
            )}
            {isInternship && userData.classYear !== 2025 && (
              <span className="inline-block px-3 py-1 bg-[#F4B942]/10 text-[#F4B942] text-sm font-medium rounded-full">
                Class of {userData.classYear} - Internship
              </span>
            )}
            {isSeeking && (
              <span className="inline-block px-3 py-1 bg-[#9E9E9E]/10 text-[#9E9E9E] text-sm font-medium rounded-full">
                Actively looking
              </span>
            )}
          </motion.div>

          {/* Only show if the user is viewing their own profile or if at least one visibility setting is true */}
          {(showRole || showCompany) && !isSeeking && (
            <motion.div className="flex items-start space-x-2 mb-4" variants={itemVariants}>
              <div className="mt-1">
                {isWork ? (
                  <MdWork className="text-[#F28B82] text-xl" />
                ) : isInternship ? (
                  <MdWork className="text-[#F4B942] text-xl" />
                ) : (
                  <HiOutlineAcademicCap className="text-[#A7D7F9] text-xl" />
                )}
              </div>
              <div>
                <p className="text-lg text-[#333333]">
                  {showRole && <span className="font-medium">{capitalize(displayRole)}</span>}
                  {showRole && showCompany && isSchool && userData.discipline
                    ? ' at '
                    : showRole && showCompany
                      ? ' at '
                      : ''}
                  {showCompany && displayCompany}
                  {showRole && isSchool && userData.discipline && (
                    <span className="text-gray-600">
                      {' '}
                      ({capitalize(userData.discipline || '')})
                    </span>
                  )}
                </p>
                {isOwnProfile && !showRole && (
                  <p className="text-sm text-[#666666] italic">
                    Your role is hidden from other users
                  </p>
                )}
                {isOwnProfile && !showCompany && (
                  <p className="text-sm text-[#666666] italic">
                    Your {isWork || isInternship ? 'company' : 'school'} is hidden from other users
                  </p>
                )}
              </div>
            </motion.div>
          )}

          {isSeeking && (
            <motion.div className="flex items-start space-x-2 mb-4" variants={itemVariants}>
              <svg
                className="text-[#9E9E9E] text-xl mt-1"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
              >
                <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <div>
                <p className="text-lg text-[#555555]">Just looking</p>
                <p className="text-sm text-[#777777]">Exploring the platform for opportunities</p>
              </div>
            </motion.div>
          )}

          {userData.location && (
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
          )}

          {/* Class Year - Show for all types */}
          {userData.classYear && (
            <motion.div className="flex items-start space-x-2 mb-4" variants={itemVariants}>
              <HiOutlineAcademicCap className="text-[#8A8A8A] text-xl mt-1" />
              <div>
                <p className="text-lg text-[#333333]">Class of {userData.classYear}</p>
              </div>
            </motion.div>
          )}

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

          {isOwnProfile && !isSeeking && (
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
                {isWork || isInternship ? (
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
  userId: string;
}

const EditForm = ({
  userData,
  setUserData,
  onSave,
  onCancel,
  isSubmitting,
  userId,
}: EditFormProps) => {
  // Determine which visibility labels to show based on user type
  const isWork = userData.postGradType === PostGradType.work;
  const isInternship = userData.postGradType === PostGradType.internship;
  const isSchool = userData.postGradType === PostGradType.school;

  const roleLabel = isWork || isInternship ? 'Role' : 'Program';
  const companyLabel = isWork || isInternship ? 'Company' : 'School';

  const [activeField, setActiveField] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Form validation
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Required for all users
    if (!userData.name?.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!userData.email?.trim()) {
      newErrors.email = 'Email is required';
    }

    // For working or internship users
    if ((isWork || isInternship) && userData.postGradType !== PostGradType.seeking) {
      if (!userData.title?.trim()) {
        newErrors.title = 'Role is required';
      }
      if (!userData.company?.trim()) {
        newErrors.company = 'Company is required';
      }
    }

    // For students
    if (isSchool && userData.postGradType !== PostGradType.seeking) {
      if (!userData.school?.trim()) {
        newErrors.school = 'School is required';
      }
      if (!userData.program?.trim()) {
        newErrors.program = 'Program type is required';
      }
      if (!userData.discipline?.trim()) {
        newErrors.discipline = 'Discipline is required';
      }
    }

    // Location check for all types except "seeking"
    if (userData.postGradType !== PostGradType.seeking && !userData.location?.city) {
      newErrors.location = 'Location is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submit with validation
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSave();
    } else {
      // Scroll to first error
      const firstErrorField = Object.keys(errors)[0];
      const errorElement = document.getElementById(firstErrorField);
      if (errorElement) {
        errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        errorElement.focus();
      }
    }
  };

  // Animation variants for input fields
  const inputVariants = {
    focus: { scale: 1.02, boxShadow: '0 4px 6px rgba(249, 197, 209, 0.1)' },
    blur: { scale: 1, boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)' },
  };

  // Update visibility settings based on user type
  const handleVisibilityChange = (field: string, value: boolean) => {
    const updatedVisibilityOptions = { ...userData.visibilityOptions };

    if (field === 'role') {
      if (isWork || isInternship) {
        updatedVisibilityOptions.title = value;
      } else {
        updatedVisibilityOptions.program = value;
      }
    } else if (field === 'company') {
      if (isWork || isInternship) {
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
  const handleTypeChange = (type: PostGradType) => {
    // When switching to 'seeking', clear work/school specific fields
    if (type === PostGradType.seeking) {
      setUserData({
        ...userData,
        postGradType: type,
        title: null,
        program: null,
        company: null,
        school: null,
        discipline: null,
        industry: null,
      });
    } else {
      setUserData({ ...userData, postGradType: type });
    }
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
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
            onChange={(e) => {
              setUserData({ ...userData, name: e.target.value });
              if (errors.name) {
                setErrors({ ...errors, name: '' });
              }
            }}
            onFocus={() => setActiveField('name')}
            onBlur={() => setActiveField(null)}
            className={`${inputClasses} ${errors.name ? 'border-red-400 bg-red-50' : ''}`}
          />
          {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
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
            onChange={(e) => {
              setUserData({ ...userData, email: e.target.value });
              if (errors.email) {
                setErrors({ ...errors, email: '' });
              }
            }}
            onFocus={() => setActiveField('email')}
            onBlur={() => setActiveField(null)}
            className={`${inputClasses} ${errors.email ? 'border-red-400 bg-red-50' : ''}`}
          />
          {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
        </motion.div>
      </motion.div>

      <motion.div variants={itemVariants}>
        <label htmlFor="type" className={labelClasses}>
          {isWork ? (
            <BsBriefcase className="mr-2 text-[#F28B82]" />
          ) : isInternship ? (
            <MdWork className="mr-2 text-[#F4B942]" />
          ) : isSchool ? (
            <LuGraduationCap className="mr-2 text-[#A7D7F9]" />
          ) : (
            <svg
              className="mr-2 h-4 w-4 text-[#9E9E9E]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          )}
          Type
        </label>
        <motion.div variants={inputVariants} animate={activeField === 'type' ? 'focus' : 'blur'}>
          <select
            id="type"
            value={userData.postGradType}
            onChange={(e) => handleTypeChange(e.target.value as PostGradType)}
            onFocus={() => setActiveField('type')}
            onBlur={() => setActiveField(null)}
            className={inputClasses.replace('cursor-text', 'cursor-pointer')}
          >
            <option value="work">Working</option>
            <option value="school">Studying</option>
            <option value="internship">Internship</option>
            <option value="seeking">Just looking</option>
          </select>
        </motion.div>
      </motion.div>

      {userData.postGradType !== PostGradType.seeking && (
        <>
          <motion.div variants={itemVariants}>
            <label htmlFor="role" className={labelClasses}>
              {isWork || isInternship ? (
                <MdWork className="mr-2 text-[#F28B82]" />
              ) : (
                <HiOutlineAcademicCap className="mr-2 text-[#A7D7F9]" />
              )}
              {roleLabel}
            </label>
            <motion.div
              variants={inputVariants}
              animate={activeField === 'role' ? 'focus' : 'blur'}
            >
              {isWork || isInternship ? (
                <>
                  <input
                    id="title"
                    type="text"
                    value={userData.title || ''}
                    onChange={(e) => {
                      setUserData({ ...userData, title: e.target.value });
                      if (errors.title) {
                        setErrors({ ...errors, title: '' });
                      }
                    }}
                    onFocus={() => setActiveField('role')}
                    onBlur={() => setActiveField(null)}
                    className={`${inputClasses} ${errors.title ? 'border-red-400 bg-red-50' : ''}`}
                  />
                  {errors.title && <p className="mt-1 text-sm text-red-500">{errors.title}</p>}
                </>
              ) : null}
            </motion.div>
          </motion.div>

          <motion.div variants={itemVariants}>
            <label htmlFor="company" className={labelClasses}>
              {isWork || isInternship ? (
                <FaBuilding className="mr-2 text-[#F28B82]" />
              ) : (
                <FaUniversity className="mr-2 text-[#A7D7F9]" />
              )}
              {companyLabel}
            </label>
            <motion.div
              variants={inputVariants}
              animate={activeField === 'company' ? 'focus' : 'blur'}
            >
              {isWork || isInternship ? (
                <>
                  <input
                    id="company"
                    type="text"
                    value={userData.company || ''}
                    onChange={(e) => {
                      setUserData({ ...userData, company: e.target.value });
                      if (errors.company) {
                        setErrors({ ...errors, company: '' });
                      }
                    }}
                    onFocus={() => setActiveField('company')}
                    onBlur={() => setActiveField(null)}
                    className={`${inputClasses} ${errors.company ? 'border-red-400 bg-red-50' : ''}`}
                  />
                  {errors.company && <p className="mt-1 text-sm text-red-500">{errors.company}</p>}
                </>
              ) : (
                <>
                  <div
                    className={errors.school ? 'border border-red-400 rounded-lg bg-red-50' : ''}
                  >
                    <SchoolSelect
                      value={userData.school || ''}
                      onChange={(school) => {
                        setUserData({ ...userData, school });
                        if (errors.school) {
                          setErrors({ ...errors, school: '' });
                        }
                      }}
                    />
                  </div>
                  {errors.school && <p className="mt-1 text-sm text-red-500">{errors.school}</p>}
                </>
              )}
            </motion.div>
          </motion.div>

          {isSchool && (
            <>
              <motion.div variants={itemVariants}>
                <label htmlFor="program" className={labelClasses}>
                  <HiOutlineAcademicCap className="mr-2 text-[#A7D7F9]" />
                  Program Type
                </label>
                <motion.div
                  variants={inputVariants}
                  animate={activeField === 'program' ? 'focus' : 'blur'}
                >
                  <div
                    className={errors.program ? 'border border-red-400 rounded-lg bg-red-50' : ''}
                  >
                    <ProgramTypeSelect
                      value={userData.program || ''}
                      onChange={(program) => {
                        setUserData({ ...userData, program });
                        if (errors.program) {
                          setErrors({ ...errors, program: '' });
                        }
                      }}
                    />
                  </div>
                  {errors.program && <p className="mt-1 text-sm text-red-500">{errors.program}</p>}
                </motion.div>
              </motion.div>

              <motion.div variants={itemVariants}>
                <label htmlFor="discipline" className={labelClasses}>
                  <HiOutlineAcademicCap className="mr-2 text-[#A7D7F9]" />
                  Discipline
                </label>
                <motion.div
                  variants={inputVariants}
                  animate={activeField === 'discipline' ? 'focus' : 'blur'}
                >
                  <div
                    className={
                      errors.discipline ? 'border border-red-400 rounded-lg bg-red-50' : ''
                    }
                  >
                    <DisciplineSelect
                      value={userData.discipline || ''}
                      onChange={(discipline) => {
                        setUserData({ ...userData, discipline });
                        if (errors.discipline) {
                          setErrors({ ...errors, discipline: '' });
                        }
                      }}
                    />
                  </div>
                  {errors.discipline && (
                    <p className="mt-1 text-sm text-red-500">{errors.discipline}</p>
                  )}
                </motion.div>
              </motion.div>
            </>
          )}

          {(isWork || isInternship) && (
            <motion.div variants={itemVariants}>
              <label htmlFor="industry" className={labelClasses}>
                <BsBriefcase className="mr-2 text-[#F28B82]" />
                Industry
              </label>
              <motion.div
                variants={inputVariants}
                animate={activeField === 'industry' ? 'focus' : 'blur'}
              >
                <select
                  id="industry"
                  value={userData.industry || ''}
                  onChange={(e) => setUserData({ ...userData, industry: e.target.value })}
                  onFocus={() => setActiveField('industry')}
                  onBlur={() => setActiveField(null)}
                  className={inputClasses.replace('cursor-text', 'cursor-pointer')}
                >
                  <option value="">Select an industry</option>
                  {INDUSTRIES.map((industry) => (
                    <option key={industry.value} value={industry.value}>
                      {industry.label}
                    </option>
                  ))}
                </select>
              </motion.div>
            </motion.div>
          )}
        </>
      )}

      <motion.div variants={itemVariants}>
        <label htmlFor="location" className={labelClasses}>
          <BsGeoAlt className="mr-2 text-[#F28B82]" />
          Location
        </label>
        <motion.div variants={inputVariants} animate={activeField === 'city' ? 'focus' : 'blur'}>
          <div className={errors.location ? 'border border-red-400 rounded-lg bg-red-50' : ''}>
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
                if (errors.location) {
                  setErrors({ ...errors, location: '' });
                }
              }}
            />
          </div>
          {errors.location && <p className="mt-1 text-sm text-red-500">{errors.location}</p>}
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
      {userData.postGradType !== PostGradType.seeking && (
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
                  isWork || isInternship
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
                  isWork || isInternship
                    ? (userData.visibilityOptions?.company ?? true)
                    : (userData.visibilityOptions?.school ?? true)
                }
                onChange={(e) => handleVisibilityChange('company', e.target.checked)}
                className="h-5 w-5 rounded-md border-gray-300 text-[#F28B82] focus:ring-[#F28B82]"
              />
            </motion.div>
          </motion.label>
        </motion.div>
      )}

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

      {/* Delete Account Section */}
      <motion.div variants={itemVariants} className="mt-12 pt-6 border-t border-gray-200">
        <h3 className="text-lg font-medium text-red-600 mb-2">Danger Zone</h3>
        <p className="text-sm text-gray-600 mb-4">
          Once you delete your account, there is no going back. Please be certain.
        </p>
        {!showDeleteConfirm ? (
          <motion.button
            type="button"
            onClick={() => setShowDeleteConfirm(true)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-all cursor-pointer"
          >
            <FaTrash className="text-sm" />
            Delete Account
          </motion.button>
        ) : (
          <motion.div
            initial={{ opacity: 0.8 }}
            animate={{ opacity: 1 }}
            className="p-4 rounded-xl border border-red-200 bg-red-50"
          >
            <h4 className="font-medium text-red-700 mb-3">Are you sure?</h4>
            <p className="text-sm text-gray-700 mb-4">
              This action cannot be undone. All of your data will be permanently deleted.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={async () => {
                  try {
                    // Call the API to delete the account
                    const response = await fetch(`/api/users/${userId}`, {
                      method: 'DELETE',
                    });

                    if (!response.ok) {
                      throw new Error(`Failed to delete account: ${response.statusText}`);
                    }

                    // Sign out and redirect to homepage after successful deletion
                    signOut({ callbackUrl: '/' });
                  } catch (error) {
                    console.error('Error deleting account:', error);
                    const errorMessage = error instanceof Error ? error.message : String(error);
                    alert(
                      `Failed to delete your account: ${errorMessage || 'Unknown error'}. Please try again later.`
                    );
                    setShowDeleteConfirm(false);
                  }
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 flex items-center justify-center"
              >
                <FaTrash className="mr-2 text-sm" />
                Delete My Account
              </button>
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 bg-white text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        )}
      </motion.div>
    </motion.form>
  );
};

export default ProfilePage;
