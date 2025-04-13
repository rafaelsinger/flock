'use client';

import { FC, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { OnboardingData } from '@/types/onboarding';
import { INDUSTRIES } from '@/constants/industries';
import { useUserStore } from '@/store/userStore';

const Step2Work: FC = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const previousData = queryClient.getQueryData(['onboardingData']) as OnboardingData;
  const { updateOnboardingStatus } = useUserStore();

  const [formData, setFormData] = useState({
    company: '',
    role: '',
    industry: '',
  });

  const [isFormValid, setIsFormValid] = useState(false);

  useEffect(() => {
    setIsFormValid(
      formData.company.trim() !== '' && formData.role.trim() !== '' && formData.industry !== ''
    );
  }, [formData]);

  const updateOnboardingData = useMutation({
    mutationFn: (workData: OnboardingData['work']) => {
      const data: OnboardingData = {
        ...previousData,
        work: workData,
      };
      return Promise.resolve(data);
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['onboardingData'], data);

      // Update UserStore with current step
      updateOnboardingStatus({
        isComplete: false,
      });

      router.push('/onboarding/step3');
    },
  });

  useEffect(() => {
    if (!previousData || previousData.postGradType !== 'work') {
      router.push('/onboarding/step1');
    }
  }, [previousData, router]);

  if (!previousData || previousData.postGradType !== 'work') {
    return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateOnboardingData.mutate(formData);
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-semibold text-[#333333] mb-3">Tell us about your job</h1>
        <p className="text-[#666666]">Share details about your upcoming role</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div>
            <label htmlFor="company" className="block text-sm font-medium text-[#333333] mb-2">
              Company
            </label>
            <input
              type="text"
              id="company"
              value={formData.company}
              onChange={(e) => setFormData((prev) => ({ ...prev, company: e.target.value }))}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-[#F9C5D1] focus:ring-2 focus:ring-[#F9C5D1]/20 outline-none transition-colors text-[#333333]"
              placeholder="e.g. Stripe"
              required
            />
          </div>

          <div>
            <label htmlFor="role" className="block text-sm font-medium text-[#333333] mb-2">
              Role
            </label>
            <input
              type="text"
              id="role"
              value={formData.role}
              onChange={(e) => setFormData((prev) => ({ ...prev, role: e.target.value }))}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-[#F9C5D1] focus:ring-2 focus:ring-[#F9C5D1]/20 outline-none transition-colors text-[#333333]"
              placeholder="e.g. Software Engineer"
              required
            />
          </div>

          <div>
            <label htmlFor="industry" className="block text-sm font-medium text-[#333333] mb-2">
              Industry
            </label>
            <select
              id="industry"
              value={formData.industry}
              onChange={(e) => setFormData((prev) => ({ ...prev, industry: e.target.value }))}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-[#F9C5D1] focus:ring-2 focus:ring-[#F9C5D1]/20 outline-none transition-colors cursor-pointer hover:border-[#F9C5D1]/50 text-[#333333]"
              required
            >
              <option value="">Select an industry</option>
              {INDUSTRIES.map((industry) => (
                <option key={industry.value} value={industry.value}>
                  {industry.label}
                </option>
              ))}
            </select>
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
                ? 'bg-[#F28B82] hover:bg-[#E67C73] text-white'
                : 'bg-[#F9C5D1]/50 cursor-not-allowed text-white/70'
            }`}
          >
            Continue
          </button>
        </div>
      </form>
    </div>
  );
};

export default Step2Work;
