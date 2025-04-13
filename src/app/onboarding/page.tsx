'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/store/userStore';

export default function OnboardingIndex() {
  const router = useRouter();
  const { onboardingStatus } = useUserStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (onboardingStatus !== undefined) {
      setIsLoading(false);
    }
  }, [onboardingStatus]);

  useEffect(() => {
    if (!isLoading) {
      // If onboarding is complete, redirect to home
      if (onboardingStatus?.isComplete) {
        router.push('/');
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
