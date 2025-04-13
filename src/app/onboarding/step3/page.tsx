'use client';

import { FC, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { OnboardingData } from '@/types/onboarding';
import { US_STATES, COUNTRIES, STATES_WITH_BOROUGHS } from '@/constants/location';
import { useUserStore } from '@/store/userStore';

const Step3: FC = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const previousData = queryClient.getQueryData(['onboardingData']) as OnboardingData;
  const { updateOnboardingStatus } = useUserStore();

  const [formData, setFormData] = useState({
    country: 'USA',
    state: '',
    city: '',
    borough: '',
  });

  const [isFormValid, setIsFormValid] = useState(false);

  useEffect(() => {
    setIsFormValid(
      formData.country.trim() !== '' &&
        (formData.country !== 'USA' || formData.state.trim() !== '') &&
        formData.city.trim() !== ''
    );
  }, [formData]);

  const updateOnboardingData = useMutation({
    mutationFn: (locationData: OnboardingData['location']) => {
      const data: OnboardingData = {
        ...previousData,
        location: locationData,
      };
      return Promise.resolve(data);
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['onboardingData'], data);

      // Update UserStore with current step
      updateOnboardingStatus({
        isComplete: false,
        currentStep: 3,
      });

      router.push('/onboarding/step4');
    },
  });

  useEffect(() => {
    if (!previousData || !previousData.postGradType) {
      router.push('/onboarding/step1');
    }
  }, [previousData, router]);

  if (!previousData || !previousData.postGradType) {
    return null;
  }

  const showStateField = formData.country === 'USA';
  const showBoroughField =
    formData.country === 'USA' && STATES_WITH_BOROUGHS.includes(formData.state);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const locationData = {
      ...formData,
      // Only include state for USA
      state: showStateField ? formData.state : '',
      // Only include borough for specific states
      borough: showBoroughField ? formData.borough : '',
    };
    updateOnboardingData.mutate(locationData);
  };

  // Common classes for better maintainability
  const inputClasses =
    'w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-[#F9C5D1] focus:ring-2 focus:ring-[#F9C5D1]/20 outline-none transition-colors hover:border-[#F9C5D1]/50 cursor-pointer text-[#333333]';
  const labelClasses = 'block text-sm font-medium text-[#333333] mb-2';

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-semibold text-[#333333] mb-3">Where are you headed?</h1>
        <p className="text-[#666666]">Let your classmates know where you&apos;ll be living</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div>
            <label htmlFor="country" className={labelClasses}>
              Country
            </label>
            <select
              id="country"
              value={formData.country}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  country: e.target.value,
                  // Reset state and borough when country changes
                  state: '',
                  borough: '',
                }))
              }
              className={inputClasses}
              required
            >
              <option value="">Select a country</option>
              {COUNTRIES.map(({ value, label }) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          {showStateField && (
            <div>
              <label htmlFor="state" className={labelClasses}>
                State
              </label>
              <select
                id="state"
                value={formData.state}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    state: e.target.value,
                    // Reset borough when state changes
                    borough: '',
                  }))
                }
                className={inputClasses}
                required
              >
                <option value="">Select a state</option>
                {US_STATES.map(({ value, label }) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label htmlFor="city" className={labelClasses}>
              City
            </label>
            <input
              type="text"
              id="city"
              value={formData.city}
              onChange={(e) => setFormData((prev) => ({ ...prev, city: e.target.value }))}
              className={inputClasses}
              placeholder="e.g. San Francisco"
              required
            />
          </div>

          {showBoroughField && (
            <div>
              <label htmlFor="borough" className={labelClasses}>
                Borough/Neighborhood <span className="text-[#666666] text-sm">(optional)</span>
              </label>
              <input
                type="text"
                id="borough"
                value={formData.borough}
                onChange={(e) => setFormData((prev) => ({ ...prev, borough: e.target.value }))}
                className={inputClasses}
                placeholder="e.g. Brooklyn or Mission District"
              />
            </div>
          )}
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

export default Step3;
