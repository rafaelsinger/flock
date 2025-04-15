'use client';

import { FC, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { GraduateFormData, IncompleteUserOnboarding } from '@/types/user';
import { motion } from 'framer-motion';
import { OnboardingProgress } from '@/components';
import { BsEyeSlash, BsEye } from 'react-icons/bs';
import { PostGradType } from '@prisma/client';

// Type definitions
type SchoolFormData = {
  visibilityOptions: {
    school: boolean;
    major: boolean;
  };
};

// Updated to use the same fields for both user types
type InternFormData = {
  visibilityOptions: {
    company: boolean;
    title: boolean;
  };
};

type FormData = InternFormData | SchoolFormData | GraduateFormData;

const Step4: FC = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const previousData = queryClient.getQueryData(['onboardingData']) as IncompleteUserOnboarding;
  const isIntern = previousData?.userType === 'intern';

  const getInitialVisibilityOptions = (): FormData => {
    if (isIntern) {
      return {
        visibilityOptions: {
          company: true,
          title: true,
        },
      };
    } else if (previousData?.postGradType === PostGradType.school) {
      return {
        visibilityOptions: {
          school: true,
          major: true,
        },
      };
    } else {
      // Graduate with work
      return {
        visibilityOptions: {
          company: true,
          title: true,
        },
      };
    }
  };

  // Get the appropriate field label based on user type and post-graduation path
  const getFieldLabel = (fieldType: 'company' | 'title' | 'school' | 'major'): string => {
    if (isIntern) {
      if (fieldType === 'company') return 'Internship Company';
      if (fieldType === 'title') return 'Internship Title';
    } else if (previousData?.postGradType === PostGradType.school) {
      if (fieldType === 'school') return 'School';
      if (fieldType === 'major') return 'Major';
    } else {
      if (fieldType === 'company') return 'Company';
      if (fieldType === 'title') return 'Role';
    }
    return '';
  };

  // Function to check if company/school should be checked
  const getCompanySchoolChecked = (): boolean => {
    if (isIntern || previousData?.postGradType === PostGradType.work) {
      return (formData as InternFormData | GraduateFormData).visibilityOptions.company;
    } else if (previousData?.postGradType === PostGradType.school) {
      return (formData as SchoolFormData).visibilityOptions.school;
    }
    return true;
  };

  // Function to check if title/major should be checked
  const getTitleMajorChecked = (): boolean => {
    if (isIntern || previousData?.postGradType === PostGradType.work) {
      return (formData as InternFormData | GraduateFormData).visibilityOptions.title;
    } else if (previousData?.postGradType === PostGradType.school) {
      return (formData as SchoolFormData).visibilityOptions.major;
    }
    return true;
  };

  const [formData, setFormData] = useState<FormData>(getInitialVisibilityOptions());
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateVisibilityOptions = useMutation({
    mutationFn: (updatedFormData: FormData) => {
      const data = {
        ...previousData,
        visibilityOptions: {
          ...previousData.visibilityOptions,
          ...(updatedFormData as FormData).visibilityOptions,
        },
      };
      return Promise.resolve(data);
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['onboardingData'], data);
      router.push('/onboarding/review');
    },
  });

  useEffect(() => {
    if (!previousData) {
      router.push('/onboarding/step1');
    }
  }, [previousData, router]);

  useEffect(() => {
    router.prefetch('/onboarding/review');
  }, [router]);

  if (!previousData) {
    return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    updateVisibilityOptions.mutate(formData);
  };

  const handleVisibilityChange = (field: string) => {
    if (isIntern || previousData?.postGradType === PostGradType.work) {
      if (field === 'company' || field === 'title') {
        const workFormData = formData as InternFormData | GraduateFormData;
        setFormData({
          visibilityOptions: {
            ...workFormData.visibilityOptions,
            [field]: !workFormData.visibilityOptions[field as 'company' | 'title'],
          },
        } as FormData);
      }
    } else if (previousData?.postGradType === PostGradType.school) {
      if (field === 'school' || field === 'major') {
        const schoolFormData = formData as SchoolFormData;
        setFormData({
          visibilityOptions: {
            ...schoolFormData.visibilityOptions,
            [field]: !schoolFormData.visibilityOptions[field as 'school' | 'major'],
          },
        } as FormData);
      }
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

  const getCompanySchoolFieldName = (): string => {
    if (isIntern) return 'company';
    if (previousData?.postGradType === PostGradType.school) return 'school';
    return 'company';
  };

  const getTitleMajorFieldName = (): string => {
    if (isIntern) return 'title';
    if (previousData?.postGradType === PostGradType.school) return 'major';
    return 'title';
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
          <h1 className="text-3xl md:text-4xl font-bold text-[#333333] mb-4">Profile Visibility</h1>
          <p className="text-lg md:text-xl text-[#666666]">
            Choose what information you want to display on your public profile.
          </p>
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-10 max-w-2xl mx-auto">
          <div className="space-y-6">
            <motion.div className="space-y-4" variants={itemVariants}>
              <div className="flex justify-between items-center">
                <label className="text-lg font-medium text-[#333333]">
                  {getFieldLabel(getCompanySchoolFieldName() as 'company' | 'school')}
                </label>
                <button
                  type="button"
                  onClick={() => handleVisibilityChange(getCompanySchoolFieldName())}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
                    getCompanySchoolChecked()
                      ? 'bg-[#F28B82]/10 text-[#F28B82]'
                      : 'bg-gray-100 text-gray-500'
                  } transition-colors`}
                >
                  {getCompanySchoolChecked() ? (
                    <>
                      <BsEye className="text-lg" />
                      <span>Visible</span>
                    </>
                  ) : (
                    <>
                      <BsEyeSlash className="text-lg" />
                      <span>Hidden</span>
                    </>
                  )}
                </button>
              </div>
              <p className="text-sm text-[#666666]">
                {getCompanySchoolChecked()
                  ? `Your ${getFieldLabel(
                      getCompanySchoolFieldName() as 'company' | 'school'
                    ).toLowerCase()} will be visible on your public profile.`
                  : `Your ${getFieldLabel(
                      getCompanySchoolFieldName() as 'company' | 'school'
                    ).toLowerCase()} will be hidden from your public profile.`}
              </p>
            </motion.div>

            <motion.div className="space-y-4" variants={itemVariants}>
              <div className="flex justify-between items-center">
                <label className="text-lg font-medium text-[#333333]">
                  {getFieldLabel(getTitleMajorFieldName() as 'title' | 'major')}
                </label>
                <button
                  type="button"
                  onClick={() => handleVisibilityChange(getTitleMajorFieldName())}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
                    getTitleMajorChecked()
                      ? 'bg-[#F28B82]/10 text-[#F28B82]'
                      : 'bg-gray-100 text-gray-500'
                  } transition-colors`}
                >
                  {getTitleMajorChecked() ? (
                    <>
                      <BsEye className="text-lg" />
                      <span>Visible</span>
                    </>
                  ) : (
                    <>
                      <BsEyeSlash className="text-lg" />
                      <span>Hidden</span>
                    </>
                  )}
                </button>
              </div>
              <p className="text-sm text-[#666666]">
                {getTitleMajorChecked()
                  ? `Your ${getFieldLabel(
                      getTitleMajorFieldName() as 'title' | 'major'
                    ).toLowerCase()} will be visible on your public profile.`
                  : `Your ${getFieldLabel(
                      getTitleMajorFieldName() as 'title' | 'major'
                    ).toLowerCase()} will be hidden from your public profile.`}
              </p>
            </motion.div>
          </div>

          <motion.div
            className="flex flex-col md:flex-row justify-between space-y-4 md:space-y-0 md:space-x-4"
            variants={itemVariants}
          >
            <motion.button
              type="button"
              onClick={() => router.back()}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-6 py-3 md:py-4 rounded-xl border border-[#F9C5D1] text-[#F28B82] font-medium transition-all hover:bg-[#F9C5D1]/5 flex-1 max-w-[200px] mx-auto md:mx-0"
            >
              Back
            </motion.button>
            <motion.button
              type="submit"
              disabled={isSubmitting}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`px-6 py-3 md:py-4 rounded-xl font-medium bg-gradient-to-r from-[#F9C5D1] to-[#F28B82] text-white cursor-pointer flex-1 max-w-[200px] mx-auto md:mx-0 ${
                isSubmitting ? 'opacity-70' : ''
              }`}
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : (
                'Continue'
              )}
            </motion.button>
          </motion.div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default Step4;
