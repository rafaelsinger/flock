'use client';

import { FC, useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { BsBriefcase } from 'react-icons/bs';
import { LuGraduationCap } from 'react-icons/lu';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { PostGradType } from '@prisma/client';
import { IncompleteUserOnboarding, UserWithLocation } from '@/types/user';
import { motion } from 'framer-motion';
import { OnboardingProgress } from '@/components';
import { useSession } from 'next-auth/react';

const Step1: FC = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [selectedOption, setSelectedOption] = useState<PostGradType | null>(null);
  const { data: sessionStorage, update } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const previousData = queryClient.getQueryData(['onboardingData']) as IncompleteUserOnboarding;
  const isFinalizingRef = useRef(false);

  // Check immediately if classYear exists, before rendering content
  useEffect(() => {
    if (!previousData || !previousData.classYear) {
      router.replace('/onboarding/step0');
    } else {
      setIsLoading(false);
    }
  }, [previousData, router]);

  const updateOnboardingData = useMutation({
    mutationFn: (type: PostGradType) => {
      const data: IncompleteUserOnboarding = {
        ...previousData,
        postGradType: type,
      };
      return Promise.resolve(data);
    },
    onSuccess: (data) => {
      if (!isFinalizingRef.current) {
        queryClient.setQueryData(['onboardingData'], data);
        router.push(`/onboarding/step2-${data.postGradType}`);
      }
    },
  });

  const finalizeOnboarding = useMutation({
    mutationFn: async (finalData: IncompleteUserOnboarding) => {
      isFinalizingRef.current = true;
      setIsSubmitting(true);
      // Check if we have a valid session with user ID
      if (!sessionStorage?.user?.id) {
        throw new Error('No user ID found in session');
      }

      console.log('Sending onboarding data to API:', finalData);

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
    onError: async () => {
      isFinalizingRef.current = false;
      setIsSubmitting(false);
      console.error('Error creating user with postGradType: seeking');
    },
  });

  const handleSelection = (type: PostGradType) => {
    setSelectedOption(type);
    if (type === PostGradType.seeking) {
      finalizeOnboarding.mutate({ ...previousData, postGradType: type, isOnboarded: true });
      return;
    }
    setTimeout(() => {
      updateOnboardingData.mutate(type);
    }, 400); // Slight delay for animation
  };

  useEffect(() => {
    router.prefetch('/onboarding/step2-work');
    router.prefetch('/onboarding/step2-school');
    router.prefetch('/');
  }, [router]);

  // If loading, return either null or a simple loading indicator to prevent flash
  if (isLoading) {
    return null;
  }

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

        <OnboardingProgress currentStep={2} totalSteps={6} />

        <motion.div className="text-center mb-10 mt-4" variants={itemVariants}>
          <h1 className="text-3xl md:text-4xl font-bold text-[#333333] mb-4">
            What&apos;s next for you?
          </h1>
          <p className="text-lg md:text-xl text-[#666666]">
            Let us know what you&apos;ll be doing after graduation
          </p>
        </motion.div>

        <div className="flex flex-col gap-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              disabled={isSubmitting}
              onClick={() => handleSelection(PostGradType.work)}
              className={`p-6 md:p-8 cursor-pointer border-2 rounded-xl transition-all ${
                selectedOption === PostGradType.work
                  ? 'border-[#F28B82] bg-gradient-to-br from-[#F28B82]/10 to-[#F9C5D1]/10 shadow-md ring-2 ring-[#F28B82]/20'
                  : 'border-[#F9C5D1]/60 hover:border-[#F9C5D1] hover:bg-[#F9C5D1]/5 hover:shadow-sm'
              }`}
            >
              <div className="flex flex-col items-center">
                <div
                  className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-colors ${
                    selectedOption === PostGradType.work ? 'bg-[#F28B82]/20' : 'bg-[#F28B82]/10'
                  }`}
                >
                  <BsBriefcase className="text-[#F28B82] text-2xl" />
                </div>
                <h2 className="text-xl font-medium text-[#333333] mb-2">I&apos;m starting work</h2>
                <p className="text-sm text-[#666666] text-center">
                  I&apos;ll be joining a company or starting my own venture
                </p>
              </div>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleSelection(PostGradType.school)}
              disabled={isSubmitting}
              className={`p-6 md:p-8 cursor-pointer border-2 rounded-xl transition-all ${
                selectedOption === PostGradType.school
                  ? 'border-[#A7D7F9] bg-gradient-to-br from-[#A7D7F9]/10 to-[#A7D7F9]/5 shadow-md ring-2 ring-[#A7D7F9]/20'
                  : 'border-[#A7D7F9]/60 hover:border-[#A7D7F9] hover:bg-[#A7D7F9]/5 hover:shadow-sm'
              }`}
            >
              <div className="flex flex-col items-center">
                <div
                  className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-colors ${
                    selectedOption === PostGradType.school ? 'bg-[#A7D7F9]/20' : 'bg-[#A7D7F9]/10'
                  }`}
                >
                  <LuGraduationCap className="text-[#A7D7F9] text-2xl" />
                </div>
                <h2 className="text-xl font-medium text-[#333333] mb-2">
                  I&apos;m continuing school
                </h2>
                <p className="text-sm text-[#666666] text-center">
                  I&apos;ll be pursuing further education or research
                </p>
              </div>
            </motion.button>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleSelection(PostGradType.seeking)}
            disabled={isSubmitting}
            className={`p-5 md:p-6 cursor-pointer border-2 rounded-xl transition-all max-w-lg mx-auto w-full ${
              selectedOption === PostGradType.seeking
                ? 'border-[#9E9E9E] bg-gradient-to-br from-[#9E9E9E]/10 to-[#9E9E9E]/5 shadow-md ring-2 ring-[#9E9E9E]/20'
                : 'border-[#E0E0E0]/80 hover:border-[#E0E0E0] hover:bg-[#E0E0E0]/5 hover:shadow-sm'
            }`}
          >
            <div className="flex flex-col items-center">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 transition-colors ${
                  selectedOption === PostGradType.seeking ? 'bg-[#9E9E9E]/20' : 'bg-[#9E9E9E]/10'
                }`}
              >
                <svg
                  className="w-5 h-5 text-[#9E9E9E]"
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
              </div>
              <h2 className="text-lg font-medium text-[#666666] mb-1">I&apos;m still looking</h2>
              <p className="text-sm text-[#888888] text-center">
                I&apos;m exploring opportunities and would like to browse the platform
              </p>
            </div>
          </motion.button>

          {isSubmitting && (
            <div className="text-center pt-4">
              <motion.div
                className="inline-block"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <svg
                  className="animate-spin h-6 w-6 text-[#F28B82]"
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
              </motion.div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Step1;
