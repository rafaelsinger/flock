'use client';

import { FC, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { BsBriefcase } from 'react-icons/bs';
import { LuGraduationCap } from 'react-icons/lu';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { PostGradType } from '@prisma/client';
import { UserUpdate } from '@/types/user';
import { motion } from 'framer-motion';
import { OnboardingProgress } from '@/components';

const Step1: FC = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [selectedOption, setSelectedOption] = useState<PostGradType | null>(null);

  const updateOnboardingData = useMutation({
    mutationFn: (type: PostGradType) => {
      const data: UserUpdate = { postGradType: type };
      return Promise.resolve(data);
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['onboardingData'], data);
      router.push(`/onboarding/step2-${data.postGradType}`);
    },
  });

  const handleSelection = (type: PostGradType) => {
    setSelectedOption(type);
    setTimeout(() => {
      updateOnboardingData.mutate(type);
    }, 400); // Slight delay for animation
  };

  useEffect(() => {
    router.prefetch('/onboarding/step2-work');
    router.prefetch('/onboarding/step2-school');
  }, [router]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-8"
    >
      <OnboardingProgress currentStep={1} totalSteps={4} />

      <div className="text-center">
        <motion.div
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1, duration: 0.4 }}
        >
          <h1 className="text-3xl font-semibold text-[#333333] mb-3">What&apos;s next for you?</h1>
          <p className="text-lg text-[#666666]">
            Let us know what you&apos;ll be doing after graduation
          </p>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => handleSelection(PostGradType.work)}
          className={`p-8 cursor-pointer border-2 rounded-xl transition-all ${
            selectedOption === PostGradType.work
              ? 'border-[#F28B82] bg-[#F28B82]/5 shadow-md'
              : 'border-[#F9C5D1] hover:bg-[#F9C5D1]/5 hover:shadow-sm'
          }`}
        >
          <div className="flex flex-col items-center">
            <div
              className={`w-16 h-16 rounded-full flex items-center justify-center mb-5 transition-colors ${
                selectedOption === PostGradType.work ? 'bg-[#F28B82]/20' : 'bg-[#F28B82]/10'
              }`}
            >
              <BsBriefcase className="text-[#F28B82] text-3xl" />
            </div>
            <h2 className="text-xl font-medium text-[#333333] mb-2">I&apos;m starting work</h2>
            <p className="text-[#666666] text-center">
              I&apos;ll be joining a company or starting my own venture
            </p>
          </div>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => handleSelection(PostGradType.school)}
          className={`p-8 cursor-pointer border-2 rounded-xl transition-all ${
            selectedOption === PostGradType.school
              ? 'border-[#A7D7F9] bg-[#A7D7F9]/5 shadow-md'
              : 'border-[#A7D7F9] hover:bg-[#A7D7F9]/5 hover:shadow-sm'
          }`}
        >
          <div className="flex flex-col items-center">
            <div
              className={`w-16 h-16 rounded-full flex items-center justify-center mb-5 transition-colors ${
                selectedOption === PostGradType.school ? 'bg-[#A7D7F9]/20' : 'bg-[#A7D7F9]/10'
              }`}
            >
              <LuGraduationCap className="text-[#A7D7F9] text-3xl" />
            </div>
            <h2 className="text-xl font-medium text-[#333333] mb-2">I&apos;m continuing school</h2>
            <p className="text-[#666666] text-center">
              I&apos;ll be pursuing further education or research
            </p>
          </div>
        </motion.button>
      </div>
    </motion.div>
  );
};

export default Step1;
