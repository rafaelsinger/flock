'use client';

import { FC, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { OnboardingData } from '@/types/onboarding';
import { useUserStore } from '@/store/userStore';

const Step2School: FC = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const previousData = queryClient.getQueryData(['onboardingData']) as OnboardingData;
  const { updateOnboardingStatus } = useUserStore();

  const [formData, setFormData] = useState({
    name: '',
    program: '',
  });

  const [isFormValid, setIsFormValid] = useState(false);

  const updateOnboardingData = useMutation({
    mutationFn: (schoolData: OnboardingData['school']) => {
      const data: OnboardingData = {
        ...previousData,
        school: schoolData,
      };
      return Promise.resolve(data);
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['onboardingData'], data);

      // Update UserStore with current step
      updateOnboardingStatus({
        isComplete: false,
        currentStep: 2,
      });

      router.push('/onboarding/step3');
    },
  });

  useEffect(() => {
    if (!previousData || previousData.postGradType !== 'school') {
      router.push('/onboarding/step1');
    }
  }, [previousData, router]);

  useEffect(() => {
    setIsFormValid(formData.name.trim() !== '' && formData.program.trim() !== '');
  }, [formData]);

  if (!previousData || previousData.postGradType !== 'school') {
    return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateOnboardingData.mutate(formData);
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-semibold text-[#333333] mb-3">Tell us about your studies</h1>
        <p className="text-[#666666]">Share details about your upcoming program</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div>
            <label htmlFor="school" className="block text-sm font-medium text-[#333333] mb-2">
              School
            </label>
            <input
              type="text"
              id="school"
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-[#A7D7F9] focus:ring-2 focus:ring-[#A7D7F9]/20 outline-none transition-colors text-[#333333]"
              placeholder="e.g. Stanford University"
              required
            />
          </div>

          <div>
            <label htmlFor="program" className="block text-sm font-medium text-[#333333] mb-2">
              Program
            </label>
            <input
              type="text"
              id="program"
              value={formData.program}
              onChange={(e) => setFormData((prev) => ({ ...prev, program: e.target.value }))}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-[#A7D7F9] focus:ring-2 focus:ring-[#A7D7F9]/20 outline-none transition-colors text-[#333333]"
              placeholder="e.g. Master's in Computer Science"
              required
            />
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2.5 rounded-lg text-[#666666] hover:text-[#333333] transition-colors cursor-pointer hover:bg-gray-50 active:bg-gray-100"
          >
            Back
          </button>
          <button
            type="submit"
            disabled={!isFormValid}
            className={`px-6 py-2.5 rounded-lg transition-colors cursor-pointer ${
              isFormValid
                ? 'bg-[#7BC0F5] hover:bg-[#5BAAE7] text-white'
                : 'bg-[#A7D7F9]/50 cursor-not-allowed text-white/70'
            }`}
          >
            Continue
          </button>
        </div>
      </form>
    </div>
  );
};

export default Step2School;
