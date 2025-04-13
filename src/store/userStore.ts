import { create } from 'zustand';

interface User {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

interface OnboardingStatus {
  isComplete: boolean;
  currentStep?: number;
}

interface UserState {
  user: User | null;
  onboardingStatus: OnboardingStatus | null;
  setUser: (user: User | null) => void;
  updateUser: (userData: Partial<User>) => void;
  setOnboardingStatus: (status: OnboardingStatus | null) => void;
  updateOnboardingStatus: (statusData: Partial<OnboardingStatus>) => void;
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  onboardingStatus: null,
  setUser: (user) => set({ user }),
  updateUser: (userData) =>
    set((state) => ({
      user: state.user ? { ...state.user, ...userData } : null,
    })),
  setOnboardingStatus: (onboardingStatus) => set({ onboardingStatus }),
  updateOnboardingStatus: (statusData) => {
    set((state) => ({
      onboardingStatus: state.onboardingStatus
        ? { ...state.onboardingStatus, ...statusData }
        : (statusData as OnboardingStatus),
    }));

    // Sync with database if we have a currentStep
    if (statusData.currentStep) {
      syncOnboardingProgress(statusData.currentStep);
    }
  },
}));

const syncOnboardingProgress = async (currentStep: number) => {
  try {
    await fetch('/api/users/onboarding-progress', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ currentStep }),
    });
  } catch (error) {
    console.error('Failed to sync onboarding progress:', error);
  }
};
