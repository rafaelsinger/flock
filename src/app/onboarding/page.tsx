'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/store/userStore';

export default function OnboardingIndex() {
  const router = useRouter();
  const { onboardingStatus, updateOnboardingStatus } = useUserStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOnboardingStatus = async () => {
      try {
        // Try to get the onboarding status from the API
        const response = await fetch('/api/auth/onboarding-status');
        const data = await response.json();

        // If we have a currentStep from the API and it's different from what's in the store
        if (
          data.currentStep &&
          (!onboardingStatus?.currentStep || data.currentStep !== onboardingStatus.currentStep)
        ) {
          // Update the store with the server data
          updateOnboardingStatus({
            isComplete: data.isOnboarded,
            currentStep: data.currentStep,
          });
        }

        setIsLoading(false);
      } catch (error) {
        console.error('Failed to fetch onboarding status:', error);
        setIsLoading(false);
      }
    };

    fetchOnboardingStatus();
  }, [onboardingStatus, updateOnboardingStatus]);

  useEffect(() => {
    if (!isLoading) {
      // If user has a saved step, redirect to the appropriate page based on the step number
      if (onboardingStatus?.currentStep) {
        const step = onboardingStatus.currentStep;
        const path = onboardingStatus.postGradType || 'work'; // Default to 'work' if not set

        if (step === 1) {
          router.push('/onboarding/step1');
        } else if (step === 2) {
          router.push(`/onboarding/step2-${path}`);
        } else if (step === 3) {
          router.push('/onboarding/step3');
        } else if (step === 4) {
          router.push('/onboarding/step4');
        } else if (step === 5) {
          router.push('/onboarding/review');
        } else if (step === -1) {
          // User has completed onboarding, redirect to home
          router.push('/');
        } else {
          // Default to step1 if we don't recognize the step
          router.push('/onboarding/step1');
        }
      } else {
        // Otherwise start from the beginning
        router.push('/onboarding/step1');
      }
    }
  }, [isLoading, onboardingStatus, router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#F28B82] mx-auto mb-4"></div>
        <p className="text-[#666666]">Loading your onboarding progress...</p>
      </div>
    </div>
  );
}
