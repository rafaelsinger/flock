'use client';

import { FC, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { BsBriefcase, BsGeoAlt, BsEyeFill } from 'react-icons/bs';
import { LuGraduationCap } from 'react-icons/lu';
import { FaBuilding, FaUniversity } from 'react-icons/fa';
import { MdOutlineLocationCity, MdWork } from 'react-icons/md';
import { HiOutlineAcademicCap } from 'react-icons/hi';
import { useSession } from 'next-auth/react';
import { UserOnboarding, UserWithLocation } from '@/types/user';
import { motion } from 'framer-motion';
import { OnboardingProgress } from '@/components';

const ReviewPage: FC = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const data = queryClient.getQueryData(['onboardingData']) as UserOnboarding;
  const isFinalizingRef = useRef(false);
  const { data: sessionStorage, update } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const finalizeOnboarding = useMutation({
    mutationFn: async (finalData: UserOnboarding) => {
      isFinalizingRef.current = true;
      setIsSubmitting(true);
      finalData = { ...finalData, isOnboarded: true };

      // Check if we have a valid session with user ID
      if (!sessionStorage?.user?.id) {
        throw new Error('No user ID found in session');
      }

      const response = await fetch(`/api/users/${sessionStorage.user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(finalData),
      });

      if (!response.ok) {
        throw new Error('Failed to save user data');
      }

      return response.json();
    },
    onSuccess: async (user: UserWithLocation) => {
      await update({ user });

      queryClient.removeQueries({ queryKey: ['onboardingData'] });
      router.push('/');
    },
    onError: (error) => {
      console.error('Error saving user data:', error);
      isFinalizingRef.current = false;
      setIsSubmitting(false);
      // You might want to show an error message to the user here
    },
  });

  // If no data, render nothing while redirect happens
  if (!data || !data.postGradType) {
    return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionStorage?.user?.id) {
      console.error('No user ID found in session');
      return;
    }
    finalizeOnboarding.mutate(data);
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      className="space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <OnboardingProgress currentStep={5} totalSteps={5} />

      <motion.div className="text-center" variants={itemVariants}>
        <h1 className="text-3xl font-semibold text-[#333333] mb-3">Review Your Profile</h1>
        <p className="text-lg text-[#666666]">Almost there! Make sure everything looks good</p>
      </motion.div>

      <motion.div className="space-y-6" variants={itemVariants}>
        <motion.div
          className="bg-white rounded-xl p-6 space-y-6 border border-gray-100 shadow-sm"
          whileHover={{ boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)' }}
        >
          {/* Post-grad Status */}
          <motion.div
            className="flex items-center space-x-3 pb-4 border-b border-gray-100"
            variants={itemVariants}
          >
            <div className="p-2 rounded-full bg-[#F9C5D1]/10">
              {data.postGradType === 'work' ? (
                <BsBriefcase className="text-[#F28B82] text-xl" />
              ) : (
                <LuGraduationCap className="text-[#A7D7F9] text-xl" />
              )}
            </div>
            <h2 className="text-xl font-medium text-[#333333]">
              {data.postGradType === 'work' ? 'Work Information' : 'Education Information'}
            </h2>
          </motion.div>

          {/* Details */}
          {data.postGradType === 'work' && (
            <motion.div className="space-y-3 pl-2" variants={itemVariants}>
              <motion.div className="flex items-center space-x-2" variants={itemVariants}>
                <FaBuilding className="text-[#F28B82] text-sm" />
                <p className="text-[#333333]">
                  <span className="font-medium">Company:</span>{' '}
                  <span className="ml-1">{data.company}</span>
                </p>
              </motion.div>

              <motion.div className="flex items-center space-x-2" variants={itemVariants}>
                <MdWork className="text-[#F28B82] text-sm" />
                <p className="text-[#333333]">
                  <span className="font-medium">Role:</span>{' '}
                  <span className="ml-1">{data.title}</span>
                </p>
              </motion.div>

              <motion.div className="flex items-center space-x-2" variants={itemVariants}>
                <BsBriefcase className="text-[#F28B82] text-sm" />
                <p className="text-[#333333]">
                  <span className="font-medium">Industry:</span>{' '}
                  <span className="ml-1">{data.industry}</span>
                </p>
              </motion.div>
            </motion.div>
          )}

          {data.postGradType === 'school' && data.school && (
            <motion.div className="space-y-3 pl-2" variants={itemVariants}>
              <motion.div className="flex items-center space-x-2" variants={itemVariants}>
                <FaUniversity className="text-[#A7D7F9] text-sm" />
                <p className="text-[#333333]">
                  <span className="font-medium">School:</span>{' '}
                  <span className="ml-1">{data.school}</span>
                </p>
              </motion.div>

              <motion.div className="flex items-center space-x-2" variants={itemVariants}>
                <HiOutlineAcademicCap className="text-[#A7D7F9] text-sm" />
                <p className="text-[#333333]">
                  <span className="font-medium">Program:</span>{' '}
                  <span className="ml-1">{data.program}</span>
                </p>
              </motion.div>
            </motion.div>
          )}

          {/* Location */}
          {data.city && (
            <motion.div
              className="pt-4 border-t border-gray-100 space-y-3 pl-2"
              variants={itemVariants}
            >
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-full bg-[#F9C5D1]/10">
                  <BsGeoAlt className="text-[#F28B82] text-sm" />
                </div>
                <h3 className="font-medium text-[#333333]">Location</h3>
              </div>

              <motion.div className="flex items-center space-x-2 pl-2" variants={itemVariants}>
                <MdOutlineLocationCity className="text-[#F28B82] text-sm" />
                <p className="text-[#333333]">
                  {data.city}
                  {data.state && `, ${data.state}`}
                  {data.country && data.country !== 'USA' && `, ${data.country}`}
                </p>
              </motion.div>
            </motion.div>
          )}

          {/* Privacy Settings */}
          <motion.div
            className="pt-4 border-t border-gray-100 space-y-3 pl-2"
            variants={itemVariants}
          >
            <div className="flex items-center space-x-2">
              <div className="p-2 rounded-full bg-[#F9C5D1]/10">
                <BsEyeFill className="text-[#F28B82] text-sm" />
              </div>
              <h3 className="font-medium text-[#333333]">Visibility Settings</h3>
            </div>

            <motion.ul className="space-y-2 text-[#666666] pl-2" variants={itemVariants}>
              {data.postGradType === 'work' ? (
                <>
                  <motion.li
                    className="flex items-center space-x-2"
                    variants={itemVariants}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#F28B82]"></span>
                    <span>
                      {data.visibilityOptions?.company
                        ? 'Company name visible to classmates'
                        : 'Company name hidden from classmates'}
                    </span>
                  </motion.li>
                  <motion.li
                    className="flex items-center space-x-2"
                    variants={itemVariants}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#F28B82]"></span>
                    <span>
                      {data.visibilityOptions?.title
                        ? 'Role visible to classmates'
                        : 'Role hidden from classmates'}
                    </span>
                  </motion.li>
                </>
              ) : (
                <>
                  <motion.li
                    className="flex items-center space-x-2"
                    variants={itemVariants}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#A7D7F9]"></span>
                    <span>
                      {data.visibilityOptions?.school
                        ? 'School name visible to classmates'
                        : 'School name hidden from classmates'}
                    </span>
                  </motion.li>
                  <motion.li
                    className="flex items-center space-x-2"
                    variants={itemVariants}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#A7D7F9]"></span>
                    <span>
                      {data.visibilityOptions?.program
                        ? 'Program visible to classmates'
                        : 'Program hidden from classmates'}
                    </span>
                  </motion.li>
                </>
              )}
            </motion.ul>
          </motion.div>
        </motion.div>

        <motion.div variants={itemVariants} className="flex justify-end space-x-4">
          <motion.button
            type="button"
            onClick={() => router.back()}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-6 py-2.5 rounded-lg text-[#666666] hover:text-[#333333] transition-colors cursor-pointer hover:bg-gray-50 active:bg-gray-100"
          >
            Back
          </motion.button>
          <motion.button
            onClick={handleSubmit}
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
                Finalizing...
              </span>
            ) : (
              'Finish & Enter Directory'
            )}
          </motion.button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default ReviewPage;
