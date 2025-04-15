'use client';

import { FC, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { IncompleteUserOnboarding } from '@/types/user';
import { motion } from 'framer-motion';
import { OnboardingProgress } from '@/components';
import { HiOutlineEye, HiOutlineEyeOff } from 'react-icons/hi';
import { FaBuilding, FaUniversity } from 'react-icons/fa';
import { BsBriefcase, BsBookHalf } from 'react-icons/bs';

type WorkFormData = {
  visibilityOptions: {
    company: boolean;
    title: boolean;
  };
};

type SchoolFormData = {
  visibilityOptions: {
    school: boolean;
    program: boolean;
  };
};

type FormData = WorkFormData | SchoolFormData;

const Step4: FC = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const previousData = queryClient.getQueryData(['onboardingData']) as IncompleteUserOnboarding;
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateOnboardingData = useMutation({
    mutationFn: (visibilityData: IncompleteUserOnboarding) => {
      const data: IncompleteUserOnboarding = {
        ...previousData,
        visibilityOptions: {
          company: visibilityData.visibilityOptions?.company,
          title: visibilityData.visibilityOptions?.title,
          school: visibilityData.visibilityOptions?.school,
          program: visibilityData.visibilityOptions?.program,
        },
      };
      return Promise.resolve(data);
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['onboardingData'], data);
      router.push('/onboarding/review');
    },
  });
  const [formData, setFormData] = useState<FormData>(
    previousData?.postGradType === 'work'
      ? {
          visibilityOptions: {
            company: true,
            title: true,
          },
        }
      : {
          visibilityOptions: {
            school: true,
            program: true,
          },
        }
  );

  useEffect(() => {
    if (!previousData || !previousData.postGradType) {
      router.push('/onboarding/step1');
    }
  }, [previousData, router]);

  useEffect(() => {
    router.prefetch('/onboarding/review');
  }, [router]);

  if (!previousData || !previousData.postGradType) {
    return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    updateOnboardingData.mutate(formData);
  };

  // Replace the onChange handlers with these type-safe versions
  const handleCompanySchoolChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (previousData.postGradType === 'work') {
      setFormData(
        (prev) =>
          ({
            ...prev,
            visibilityOptions: {
              ...(prev as WorkFormData).visibilityOptions,
              company: e.target.checked,
            },
          }) as WorkFormData
      );
    } else {
      setFormData(
        (prev) =>
          ({
            ...prev,
            visibilityOptions: {
              ...(prev as SchoolFormData).visibilityOptions,
              school: e.target.checked,
            },
          }) as SchoolFormData
      );
    }
  };

  const handleTitleProgramChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (previousData.postGradType === 'work') {
      setFormData(
        (prev) =>
          ({
            ...prev,
            visibilityOptions: {
              ...(prev as WorkFormData).visibilityOptions,
              title: e.target.checked,
            },
          }) as WorkFormData
      );
    } else {
      setFormData(
        (prev) =>
          ({
            ...prev,
            visibilityOptions: {
              ...(prev as SchoolFormData).visibilityOptions,
              program: e.target.checked,
            },
          }) as SchoolFormData
      );
    }
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

  const cardVariants = {
    hover: { scale: 1.02, backgroundColor: 'rgba(249, 197, 209, 0.05)' },
    tap: { scale: 0.98 },
    initial: { scale: 1 },
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

        <OnboardingProgress currentStep={5} totalSteps={6} />

        <motion.div className="text-center mb-10 mt-4" variants={itemVariants}>
          <h1 className="text-3xl md:text-4xl font-bold text-[#333333] mb-4">
            Privacy Preferences
          </h1>
          <p className="text-lg md:text-xl text-[#666666]">
            Choose what information you want to share
          </p>
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-10 max-w-2xl mx-auto">
          <motion.div className="space-y-6" variants={itemVariants}>
            <div className="space-y-4">
              <motion.label
                className="flex items-center justify-between p-5 rounded-xl border-2 border-gray-200 hover:border-gray-300 transition-all cursor-pointer"
                variants={cardVariants}
                whileHover="hover"
                whileTap="tap"
                initial="initial"
              >
                <div className="flex items-start space-x-3">
                  {previousData.postGradType === 'work' ? (
                    <FaBuilding className="text-[#F28B82] text-xl mt-1" />
                  ) : (
                    <FaUniversity className="text-[#A7D7F9] text-xl mt-1" />
                  )}
                  <div>
                    <span className="font-medium text-[#333333] block text-lg">
                      Show {previousData.postGradType === 'work' ? 'Company' : 'School'}
                    </span>
                    <p className="text-sm text-[#666666] mt-1">
                      Display your{' '}
                      {previousData.postGradType === 'work' ? 'company name' : 'school'} to
                      classmates
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  {previousData.postGradType === 'work' ? (
                    (formData as WorkFormData).visibilityOptions.company ? (
                      <HiOutlineEye className="text-[#F28B82] text-lg" />
                    ) : (
                      <HiOutlineEyeOff className="text-gray-400 text-lg" />
                    )
                  ) : (formData as SchoolFormData).visibilityOptions.school ? (
                    <HiOutlineEye className="text-[#A7D7F9] text-lg" />
                  ) : (
                    <HiOutlineEyeOff className="text-gray-400 text-lg" />
                  )}
                  <div className="h-7 w-12 relative flex items-center">
                    <input
                      type="checkbox"
                      checked={
                        previousData.postGradType === 'work'
                          ? (formData as WorkFormData).visibilityOptions.company
                          : (formData as SchoolFormData).visibilityOptions.school
                      }
                      onChange={handleCompanySchoolChange}
                      className="h-6 w-6 rounded-md border-gray-300 text-[#F28B82] focus:ring-[#F9C5D1] transition-colors cursor-pointer"
                    />
                  </div>
                </div>
              </motion.label>

              <motion.label
                className="flex items-center justify-between p-5 rounded-xl border-2 border-gray-200 hover:border-gray-300 transition-all cursor-pointer"
                variants={cardVariants}
                whileHover="hover"
                whileTap="tap"
                initial="initial"
              >
                <div className="flex items-start space-x-3">
                  {previousData.postGradType === 'work' ? (
                    <BsBriefcase className="text-[#F28B82] text-xl mt-1" />
                  ) : (
                    <BsBookHalf className="text-[#A7D7F9] text-xl mt-1" />
                  )}
                  <div>
                    <span className="font-medium text-[#333333] block text-lg">
                      Show {previousData.postGradType === 'work' ? 'Role' : 'Program'}
                    </span>
                    <p className="text-sm text-[#666666] mt-1">
                      Display your {previousData.postGradType === 'work' ? 'role' : 'program'} to
                      classmates
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  {previousData.postGradType === 'work' ? (
                    (formData as WorkFormData).visibilityOptions.title ? (
                      <HiOutlineEye className="text-[#F28B82] text-lg" />
                    ) : (
                      <HiOutlineEyeOff className="text-gray-400 text-lg" />
                    )
                  ) : (formData as SchoolFormData).visibilityOptions.program ? (
                    <HiOutlineEye className="text-[#A7D7F9] text-lg" />
                  ) : (
                    <HiOutlineEyeOff className="text-gray-400 text-lg" />
                  )}
                  <div className="h-7 w-12 relative flex items-center">
                    <input
                      type="checkbox"
                      checked={
                        previousData.postGradType === 'work'
                          ? (formData as WorkFormData).visibilityOptions.title
                          : (formData as SchoolFormData).visibilityOptions.program
                      }
                      onChange={handleTitleProgramChange}
                      className="h-6 w-6 rounded-md border-gray-300 text-[#F28B82] focus:ring-[#F9C5D1] transition-colors cursor-pointer"
                    />
                  </div>
                </div>
              </motion.label>
            </div>

            <div className="mt-8 bg-[#F9FAFB] p-4 rounded-xl border border-gray-100">
              <p className="text-sm text-[#666666] flex items-start">
                <svg
                  className="w-5 h-5 mr-2 text-[#F28B82] flex-shrink-0 mt-0.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>
                  Your general profile information and location will always be visible to your BC
                  classmates. These preferences only control the visibility of your specific role
                  and organization details.
                </span>
              </p>
            </div>
          </motion.div>

          <motion.div className="flex justify-between items-center pt-4" variants={itemVariants}>
            <motion.button
              type="button"
              onClick={() => router.back()}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-6 py-3 rounded-xl border-2 border-gray-200 text-[#666666] hover:text-[#333333] hover:border-gray-300 transition-all font-medium"
            >
              Back
            </motion.button>
            <motion.button
              type="submit"
              disabled={isSubmitting}
              whileHover={!isSubmitting ? { scale: 1.03 } : {}}
              whileTap={!isSubmitting ? { scale: 0.98 } : {}}
              className={`px-8 py-3 rounded-xl transition-all text-base md:text-lg font-medium min-w-[120px] ${
                !isSubmitting
                  ? 'bg-gradient-to-r from-[#F28B82] to-[#E67C73] text-white shadow-md hover:shadow-lg'
                  : 'bg-[#F9C5D1]/50 cursor-not-allowed text-white/70'
              }`}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
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
                  Processing...
                </span>
              ) : (
                'Continue to Review'
              )}
            </motion.button>
          </motion.div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default Step4;
