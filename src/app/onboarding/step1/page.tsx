'use client';

import { FC } from 'react';
import { useRouter } from 'next/navigation';
import { BsBriefcase } from 'react-icons/bs';
import { LuGraduationCap } from 'react-icons/lu';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { PostGradType } from '@prisma/client';
import { UserUpdate } from '@/types/user';

const Step1: FC = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

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
    updateOnboardingData.mutate(type);
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-semibold text-[#333333] mb-3">What&apos;s next for you?</h1>
        <p className="text-[#666666]">Let us know what you&apos;ll be doing after graduation</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          onClick={() => handleSelection('work')}
          className="p-6 cursor-pointer border-2 border-[#F9C5D1] rounded-xl hover:bg-[#F9C5D1]/5 transition-colors"
        >
          <BsBriefcase className="text-[#F28B82] text-3xl mx-auto mb-4" />
          <h2 className="text-xl font-medium text-[#333333] mb-2">I&apos;m starting work</h2>
          <p className="text-[#666666] text-sm">
            I&apos;ll be joining a company or starting my own venture
          </p>
        </button>

        <button
          onClick={() => handleSelection('school')}
          className="p-6 cursor-pointer border-2 border-[#A7D7F9] rounded-xl hover:bg-[#A7D7F9]/5 transition-colors"
        >
          <LuGraduationCap className="text-[#A7D7F9] text-3xl mx-auto mb-4" />
          <h2 className="text-xl font-medium text-[#333333] mb-2">I&apos;m continuing school</h2>
          <p className="text-[#666666] text-sm">
            I&apos;ll be pursuing further education or research
          </p>
        </button>
      </div>
    </div>
  );
};

export default Step1;
