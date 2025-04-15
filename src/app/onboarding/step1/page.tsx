'use client';

import { FC, useState, useEffect } from 'react';
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

  const updateOnboardingData = useMutation({
    mutationFn: (type: PostGradType) => {
      const data: IncompleteUserOnboarding = { postGradType: type };
      return Promise.resolve(data);
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['onboardingData'], data);
      router.push(`/onboarding/step2-${data.postGradType}`);
    },
  });

  const finalizeOnboarding = useMutation({
    mutationFn: async (finalData: IncompleteUserOnboarding) => {
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
      setIsSubmitting(false);
      console.error('Error creating user with postGradType: seeking');
    },
  });

  const handleSelection = (type: PostGradType) => {
    setSelectedOption(type);
    if (type === PostGradType.seeking) {
      finalizeOnboarding.mutate({ postGradType: type, isOnboarded: true });
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      <OnboardingProgress currentStep={1} totalSteps={5} />

      <div className="text-center">
        <motion.div
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1, duration: 0.4 }}
        >
          <h1 className="text-2xl font-semibold text-[#333333] mb-2">What&apos;s next for you?</h1>
          <p className="text-base text-[#666666]">
            Let us know what you&apos;ll be doing after graduation
          </p>
        </motion.div>
      </div>

      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={isSubmitting}
            onClick={() => handleSelection(PostGradType.work)}
            className={`p-6 cursor-pointer border-2 rounded-xl transition-all ${
              selectedOption === PostGradType.work
                ? 'border-[#F28B82] bg-[#F28B82]/5 shadow-md'
                : 'border-[#F9C5D1] hover:bg-[#F9C5D1]/5 hover:shadow-sm'
            }`}
          >
            <div className="flex flex-col items-center">
              <div
                className={`w-14 h-14 rounded-full flex items-center justify-center mb-3 transition-colors ${
                  selectedOption === PostGradType.work ? 'bg-[#F28B82]/20' : 'bg-[#F28B82]/10'
                }`}
              >
                <BsBriefcase className="text-[#F28B82] text-2xl" />
              </div>
              <h2 className="text-lg font-medium text-[#333333] mb-1">I&apos;m starting work</h2>
              <p className="text-sm text-[#666666] text-center">
                I&apos;ll be joining a company or starting my own venture
              </p>
            </div>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleSelection(PostGradType.school)}
            disabled={isSubmitting}
            className={`p-6 cursor-pointer border-2 rounded-xl transition-all ${
              selectedOption === PostGradType.school
                ? 'border-[#A7D7F9] bg-[#A7D7F9]/5 shadow-md'
                : 'border-[#A7D7F9] hover:bg-[#A7D7F9]/5 hover:shadow-sm'
            }`}
          >
            <div className="flex flex-col items-center">
              <div
                className={`w-14 h-14 rounded-full flex items-center justify-center mb-3 transition-colors ${
                  selectedOption === PostGradType.school ? 'bg-[#A7D7F9]/20' : 'bg-[#A7D7F9]/10'
                }`}
              >
                <LuGraduationCap className="text-[#A7D7F9] text-2xl" />
              </div>
              <h2 className="text-lg font-medium text-[#333333] mb-1">
                I&apos;m continuing school
              </h2>
              <p className="text-sm text-[#666666] text-center">
                I&apos;ll be pursuing further education or research
              </p>
            </div>
          </motion.button>
        </div>

        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          onClick={() => handleSelection(PostGradType.seeking)}
          disabled={isSubmitting}
          className={`p-4 cursor-pointer border-2 rounded-xl transition-all max-w-md mx-auto w-full ${
            selectedOption === PostGradType.seeking
              ? 'border-[#9E9E9E] bg-[#9E9E9E]/5 shadow-md'
              : 'border-[#E0E0E0] hover:bg-[#E0E0E0]/5 hover:shadow-sm'
          }`}
        >
          <div className="flex flex-col items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-colors ${
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
            <h2 className="text-base font-medium text-[#666666] mb-0.5">I&apos;m still looking</h2>
            <p className="text-xs text-[#888888] text-center">
              I&apos;m exploring opportunities and would like to browse the platform
            </p>
          </div>
        </motion.button>
      </div>
    </motion.div>
  );
};

export default Step1;
