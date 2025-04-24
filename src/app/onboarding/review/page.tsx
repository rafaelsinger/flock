'use client';

import { FC, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { BsBriefcase, BsGeoAlt, BsEyeFill, BsCalendar } from 'react-icons/bs';
import { LuGraduationCap } from 'react-icons/lu';
import { FaBuilding, FaUniversity } from 'react-icons/fa';
import { MdOutlineLocationCity, MdWork } from 'react-icons/md';
import { HiOutlineAcademicCap } from 'react-icons/hi';
import { useSession } from 'next-auth/react';
import { UserOnboarding, UserWithLocation } from '@/types/user';
import { motion } from 'framer-motion';
import { OnboardingProgress, OnboardingButton } from '@/components';
import { PostGradType } from '@prisma/client';
import { CURRENT_CLASS_YEAR } from '@/constants/general';

const ReviewPage: FC = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const data = queryClient.getQueryData(['onboardingData']) as UserOnboarding;
  const isFinalizingRef = useRef(false);
  const { data: sessionStorage, update } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isIntern = data?.classYear != CURRENT_CLASS_YEAR;

  const finalizeOnboarding = useMutation({
    mutationFn: async (finalData: UserOnboarding) => {
      isFinalizingRef.current = true;
      setIsSubmitting(true);
      finalData = { ...finalData, isOnboarded: true };

      // Check if we have a valid session with user ID
      if (!sessionStorage?.user?.id) {
        throw new Error('No user ID found in session');
      }

      // Restructure the data to match the API expectations
      const apiData = {
        ...finalData,
        // Create a proper location object from the flat location fields
        location: finalData.city
          ? {
              city: finalData.city,
              state: finalData.state,
              country: finalData.country,
              lat: finalData.lat,
              lon: finalData.lon,
            }
          : undefined,
      };

      console.log('Sending onboarding data to API:', apiData);

      const response = await fetch(`/api/users/${sessionStorage.user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiData),
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

  // Helper to get section title
  const getSectionTitle = () => {
    if (isIntern) return 'Internship Information';
    return data.postGradType === PostGradType.work ? 'Work Information' : 'Education Information';
  };

  // Helper to get section icon
  const getSectionIcon = () => {
    if (isIntern) return <BsCalendar className="text-[#F28B82] text-xl" />;
    return data.postGradType === PostGradType.work ? (
      <BsBriefcase className="text-[#F28B82] text-xl" />
    ) : (
      <LuGraduationCap className="text-[#A7D7F9] text-xl" />
    );
  };

  return (
    <motion.div
      className="min-h-[calc(100vh-100px)] flex flex-col justify-center px-4 py-12 max-w-4xl mx-auto"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Card container */}
      <motion.div
        className="w-full bg-white rounded-2xl shadow-lg p-8 md:p-12 overflow-hidden relative"
        variants={itemVariants}
      >
        {/* Top decoration pattern */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#F9C5D1] via-[#F28B82] to-[#C06C84]"></div>

        <OnboardingProgress currentStep={6} totalSteps={6} />

        <motion.div className="text-center mb-10 mt-4" variants={itemVariants}>
          <h1 className="text-3xl md:text-4xl font-bold text-[#333333] mb-4">
            Review Your Profile
          </h1>
          <p className="text-lg md:text-xl text-[#666666]">
            Almost there! Make sure everything looks good
          </p>
        </motion.div>

        <motion.form onSubmit={handleSubmit} className="space-y-10 max-w-2xl mx-auto">
          <motion.div className="space-y-6" variants={itemVariants}>
            {/* Post-grad/Internship Details Card */}
            <motion.div
              className="bg-[#FAFAFA] rounded-xl p-6 space-y-6 border-2 border-gray-100"
              whileHover={{ boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)' }}
            >
              {/* Status Section Header */}
              <motion.div
                className="flex items-center space-x-3 pb-4 border-b border-gray-200"
                variants={itemVariants}
              >
                <div className="p-3 rounded-full bg-gradient-to-br from-[#F9C5D1]/20 to-[#F28B82]/10">
                  {getSectionIcon()}
                </div>
                <h2 className="text-xl md:text-2xl font-medium text-[#333333]">
                  {getSectionTitle()}
                </h2>
              </motion.div>

              {/* Details */}
              {isIntern && (
                <motion.div className="space-y-4 pl-2" variants={itemVariants}>
                  <motion.div className="flex items-center space-x-3" variants={itemVariants}>
                    <div className="w-8 h-8 rounded-full bg-[#F9C5D1]/10 flex items-center justify-center">
                      <FaBuilding className="text-[#F28B82]" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#666666]">Company</p>
                      <p className="text-lg text-[#333333]">{data.company}</p>
                    </div>
                  </motion.div>

                  <motion.div className="flex items-center space-x-3" variants={itemVariants}>
                    <div className="w-8 h-8 rounded-full bg-[#F9C5D1]/10 flex items-center justify-center">
                      <MdWork className="text-[#F28B82]" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#666666]">Role</p>
                      <p className="text-lg text-[#333333]">{data.title}</p>
                    </div>
                  </motion.div>

                  <motion.div className="flex items-center space-x-3" variants={itemVariants}>
                    <div className="w-8 h-8 rounded-full bg-[#F9C5D1]/10 flex items-center justify-center">
                      <BsBriefcase className="text-[#F28B82]" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#666666]">Industry</p>
                      <p className="text-lg text-[#333333]">{data.industry}</p>
                    </div>
                  </motion.div>
                </motion.div>
              )}

              {!isIntern && data.postGradType === PostGradType.work && (
                <motion.div className="space-y-4 pl-2" variants={itemVariants}>
                  <motion.div className="flex items-center space-x-3" variants={itemVariants}>
                    <div className="w-8 h-8 rounded-full bg-[#F9C5D1]/10 flex items-center justify-center">
                      <FaBuilding className="text-[#F28B82]" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#666666]">Company</p>
                      <p className="text-lg text-[#333333]">{data.company}</p>
                    </div>
                  </motion.div>

                  <motion.div className="flex items-center space-x-3" variants={itemVariants}>
                    <div className="w-8 h-8 rounded-full bg-[#F9C5D1]/10 flex items-center justify-center">
                      <MdWork className="text-[#F28B82]" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#666666]">Role</p>
                      <p className="text-lg text-[#333333]">{data.title}</p>
                    </div>
                  </motion.div>

                  <motion.div className="flex items-center space-x-3" variants={itemVariants}>
                    <div className="w-8 h-8 rounded-full bg-[#F9C5D1]/10 flex items-center justify-center">
                      <BsBriefcase className="text-[#F28B82]" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#666666]">Industry</p>
                      <p className="text-lg text-[#333333]">{data.industry}</p>
                    </div>
                  </motion.div>
                </motion.div>
              )}

              {!isIntern && data.postGradType === PostGradType.school && data.school && (
                <motion.div className="space-y-4 pl-2" variants={itemVariants}>
                  <motion.div className="flex items-center space-x-3" variants={itemVariants}>
                    <div className="w-8 h-8 rounded-full bg-[#A7D7F9]/10 flex items-center justify-center">
                      <FaUniversity className="text-[#7BC0F5]" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#666666]">School</p>
                      <p className="text-lg text-[#333333]">{data.school}</p>
                    </div>
                  </motion.div>

                  <motion.div className="flex items-center space-x-3" variants={itemVariants}>
                    <div className="w-8 h-8 rounded-full bg-[#A7D7F9]/10 flex items-center justify-center">
                      <HiOutlineAcademicCap className="text-[#7BC0F5]" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#666666]">Program</p>
                      <p className="text-lg text-[#333333]">{data.program}</p>
                    </div>
                  </motion.div>

                  <motion.div className="flex items-center space-x-3" variants={itemVariants}>
                    <div className="w-8 h-8 rounded-full bg-[#A7D7F9]/10 flex items-center justify-center">
                      <HiOutlineAcademicCap className="text-[#7BC0F5]" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#666666]">Discipline</p>
                      <p className="text-lg text-[#333333]">{data.discipline}</p>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </motion.div>

            {/* Location Card */}
            {data.city && (
              <motion.div
                className="bg-[#FAFAFA] rounded-xl p-6 space-y-4 border-2 border-gray-100"
                variants={itemVariants}
                whileHover={{ boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)' }}
              >
                <motion.div className="flex items-center space-x-3 pb-4 border-b border-gray-200">
                  <div className="p-3 rounded-full bg-gradient-to-br from-[#F9C5D1]/20 to-[#F28B82]/10">
                    <BsGeoAlt className="text-[#F28B82] text-xl" />
                  </div>
                  <h3 className="text-xl md:text-2xl font-medium text-[#333333]">Location</h3>
                </motion.div>

                <motion.div className="flex items-center space-x-3 pl-2" variants={itemVariants}>
                  <div className="w-8 h-8 rounded-full bg-[#F9C5D1]/10 flex items-center justify-center">
                    <MdOutlineLocationCity className="text-[#F28B82]" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#666666]">City</p>
                    <p className="text-lg text-[#333333]">
                      {data.city}
                      {data.state && `, ${data.state}`}
                      {data.country && data.country !== 'USA' && `, ${data.country}`}
                    </p>
                  </div>
                </motion.div>

                {data.lookingForRoommate && (
                  <motion.div className="mt-2 ml-12 flex items-center">
                    <div className="h-5 w-5 bg-[#F28B82]/10 rounded-full flex items-center justify-center mr-2">
                      <span className="text-[#F28B82] text-xs">✓</span>
                    </div>
                    <p className="text-sm text-[#666666]">Looking for roommates</p>
                  </motion.div>
                )}
              </motion.div>
            )}

            {/* Privacy Settings Card */}
            <motion.div
              className="bg-[#FAFAFA] rounded-xl p-6 space-y-4 border-2 border-gray-100"
              variants={itemVariants}
              whileHover={{ boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)' }}
            >
              <motion.div className="flex items-center space-x-3 pb-4 border-b border-gray-200">
                <div className="p-3 rounded-full bg-gradient-to-br from-[#F9C5D1]/20 to-[#F28B82]/10">
                  <BsEyeFill className="text-[#F28B82] text-xl" />
                </div>
                <h3 className="text-xl md:text-2xl font-medium text-[#333333]">
                  Visibility Settings
                </h3>
              </motion.div>

              <motion.ul className="space-y-3 text-[#666666] pl-2 pt-2" variants={itemVariants}>
                {isIntern ? (
                  <>
                    <motion.li className="flex items-center space-x-3" variants={itemVariants}>
                      <div className="w-6 h-6 rounded-full flex items-center justify-center">
                        {data.visibilityOptions?.company ? (
                          <span className="text-[#F28B82] text-lg">✓</span>
                        ) : (
                          <span className="text-gray-300 text-lg">✕</span>
                        )}
                      </div>
                      <span className="text-base">
                        Internship company {data.visibilityOptions?.company ? 'visible' : 'hidden'}{' '}
                        to classmates
                      </span>
                    </motion.li>
                    <motion.li className="flex items-center space-x-3" variants={itemVariants}>
                      <div className="w-6 h-6 rounded-full flex items-center justify-center">
                        {data.visibilityOptions?.title ? (
                          <span className="text-[#F28B82] text-lg">✓</span>
                        ) : (
                          <span className="text-gray-300 text-lg">✕</span>
                        )}
                      </div>
                      <span className="text-base">
                        Internship role {data.visibilityOptions?.title ? 'visible' : 'hidden'} to
                        classmates
                      </span>
                    </motion.li>
                  </>
                ) : data.postGradType === PostGradType.work ? (
                  <>
                    <motion.li className="flex items-center space-x-3" variants={itemVariants}>
                      <div className="w-6 h-6 rounded-full flex items-center justify-center">
                        {data.visibilityOptions?.company ? (
                          <span className="text-[#F28B82] text-lg">✓</span>
                        ) : (
                          <span className="text-gray-300 text-lg">✕</span>
                        )}
                      </div>
                      <span className="text-base">
                        Company name {data.visibilityOptions?.company ? 'visible' : 'hidden'} to
                        classmates
                      </span>
                    </motion.li>
                    <motion.li className="flex items-center space-x-3" variants={itemVariants}>
                      <div className="w-6 h-6 rounded-full flex items-center justify-center">
                        {data.visibilityOptions?.title ? (
                          <span className="text-[#F28B82] text-lg">✓</span>
                        ) : (
                          <span className="text-gray-300 text-lg">✕</span>
                        )}
                      </div>
                      <span className="text-base">
                        Role {data.visibilityOptions?.title ? 'visible' : 'hidden'} to classmates
                      </span>
                    </motion.li>
                  </>
                ) : (
                  <>
                    <motion.li className="flex items-center space-x-3" variants={itemVariants}>
                      <div className="w-6 h-6 rounded-full flex items-center justify-center">
                        {data.visibilityOptions?.school ? (
                          <span className="text-[#7BC0F5] text-lg">✓</span>
                        ) : (
                          <span className="text-gray-300 text-lg">✕</span>
                        )}
                      </div>
                      <span className="text-base">
                        School {data.visibilityOptions?.school ? 'visible' : 'hidden'} to classmates
                      </span>
                    </motion.li>
                    <motion.li className="flex items-center space-x-3" variants={itemVariants}>
                      <div className="w-6 h-6 rounded-full flex items-center justify-center">
                        {data.visibilityOptions?.program ? (
                          <span className="text-[#7BC0F5] text-lg">✓</span>
                        ) : (
                          <span className="text-gray-300 text-lg">✕</span>
                        )}
                      </div>
                      <span className="text-base">
                        Program {data.visibilityOptions?.program ? 'visible' : 'hidden'} to
                        classmates
                      </span>
                    </motion.li>
                  </>
                )}
              </motion.ul>
            </motion.div>
          </motion.div>

          <motion.div
            className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0 md:space-x-4 pt-4"
            variants={itemVariants}
          >
            <OnboardingButton type="button" variant="secondary" onClick={() => router.back()}>
              Back
            </OnboardingButton>
            <OnboardingButton
              type="submit"
              variant="primary"
              disabled={isSubmitting}
              isLoading={isSubmitting}
            >
              Complete
            </OnboardingButton>
          </motion.div>
        </motion.form>
      </motion.div>
    </motion.div>
  );
};

export default ReviewPage;
