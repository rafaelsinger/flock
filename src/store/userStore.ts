import { create } from 'zustand';

interface User {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  isOnboarded?: boolean;
  // Add other user properties as needed
}

interface OnboardingStatus {
  isComplete: boolean;
  currentStep?: string;
  // Add other onboarding properties as needed
}

interface UserState {
  user: User | null;
  onboardingStatus: OnboardingStatus | null;
  setUser: (user: User | null) => void;
  setOnboardingStatus: (status: OnboardingStatus | null) => void;
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  onboardingStatus: null,
  setUser: (user) => set({ user }),
  setOnboardingStatus: (onboardingStatus) => set({ onboardingStatus }),
}));
