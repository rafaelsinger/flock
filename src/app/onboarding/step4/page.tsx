'use client';

import { FC, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { UserUpdate } from '@/types/user';
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
  const previousData = queryClient.getQueryData(['onboardingData']) as UserUpdate;

  const updateOnboardingData = useMutation({
    mutationFn: (visibilityData: UserUpdate) => {
      const data: UserUpdate = {
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

  return (
    <motion.div
      className="space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <OnboardingProgress currentStep={4} totalSteps={4} />

      <motion.div className="text-center" variants={itemVariants}>
        <h1 className="text-3xl font-semibold text-[#333333] mb-3">Privacy Preferences</h1>
        <p className="text-lg text-[#666666]">Choose what information you want to share</p>
      </motion.div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <motion.div className="space-y-6" variants={itemVariants}>
          <div className="bg-white rounded-lg p-6 space-y-6 border border-gray-100 shadow-sm">
            <motion.label
              className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-xl transition-all cursor-pointer"
              whileHover={{ scale: 1.01, backgroundColor: 'rgba(249, 197, 209, 0.05)' }}
              whileTap={{ scale: 0.99 }}
            >
              <div className="flex items-start space-x-3">
                {previousData.postGradType === 'work' ? (
                  <FaBuilding className="text-[#F28B82] text-xl mt-1" />
                ) : (
                  <FaUniversity className="text-[#A7D7F9] text-xl mt-1" />
                )}
                <div>
                  <span className="font-medium text-[#333333] block">
                    Show {previousData.postGradType === 'work' ? 'Company' : 'School'}
                  </span>
                  <p className="text-sm text-[#666666] mt-1">
                    Display your {previousData.postGradType === 'work' ? 'company name' : 'school'}{' '}
                    to classmates
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
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
                <motion.div whileTap={{ scale: 0.9 }} className="relative inline-block">
                  <input
                    type="checkbox"
                    checked={
                      previousData.postGradType === 'work'
                        ? (formData as WorkFormData).visibilityOptions.company
                        : (formData as SchoolFormData).visibilityOptions.school
                    }
                    onChange={handleCompanySchoolChange}
                    className="h-6 w-6 rounded-md border-gray-300 text-[#F9C5D1] focus:ring-[#F9C5D1] transition-colors cursor-pointer"
                  />
                </motion.div>
              </div>
            </motion.label>

            <motion.label
              className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-xl transition-all cursor-pointer"
              whileHover={{ scale: 1.01, backgroundColor: 'rgba(249, 197, 209, 0.05)' }}
              whileTap={{ scale: 0.99 }}
            >
              <div className="flex items-start space-x-3">
                {previousData.postGradType === 'work' ? (
                  <BsBriefcase className="text-[#F28B82] text-xl mt-1" />
                ) : (
                  <BsBookHalf className="text-[#A7D7F9] text-xl mt-1" />
                )}
                <div>
                  <span className="font-medium text-[#333333] block">
                    Show {previousData.postGradType === 'work' ? 'Role' : 'Program'}
                  </span>
                  <p className="text-sm text-[#666666] mt-1">
                    Display your {previousData.postGradType === 'work' ? 'role' : 'program'} to
                    classmates
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
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
                <motion.div whileTap={{ scale: 0.9 }} className="relative inline-block">
                  <input
                    type="checkbox"
                    checked={
                      previousData.postGradType === 'work'
                        ? (formData as WorkFormData).visibilityOptions.title
                        : (formData as SchoolFormData).visibilityOptions.program
                    }
                    onChange={handleTitleProgramChange}
                    className="h-6 w-6 rounded-md border-gray-300 text-[#F9C5D1] focus:ring-[#F9C5D1] transition-colors cursor-pointer"
                  />
                </motion.div>
              </div>
            </motion.label>
          </div>
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
            type="submit"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-6 py-2.5 rounded-lg bg-[#F28B82] hover:bg-[#E67C73] text-white transition-all cursor-pointer shadow-sm hover:shadow"
          >
            Review
          </motion.button>
        </motion.div>
      </form>
    </motion.div>
  );
};

export default Step4;
